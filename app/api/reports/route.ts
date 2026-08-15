import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { computePerceptualHash } from "@/services/imageHash";
import { DuplicateDetectionService } from "@/services/duplicateDetectionService";
import { PriorityEngine } from "@/services/priorityEngine";
import { GamificationService } from "@/services/gamificationService";
import { NotificationService } from "@/services/notificationService";
import { ReportRepository } from "@/repositories/reportRepository";
import { IssueRepository } from "@/repositories/issueRepository";
import { ConfigRepository, AuditLogRepository, DamageClassRepository } from "@/repositories/miscRepositories";
import { JurisdictionRepository, AuthorityRepository } from "@/repositories/jurisdictionRepository";
import {
  getDamageDetectionProvider,
  getGeocodingProvider,
  getJurisdictionResolver,
  getAuthorityIntegration,
} from "@/lib/registry";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["citizen"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const form = await req.formData();
  const file = form.get("image") as File | null;
  const lat = parseFloat(String(form.get("lat")));
  const lng = parseFloat(String(form.get("lng")));

  if (!file || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "An image and GPS location are required." }, { status: 400 });
  }

  // --- Anti-abuse: rate limit reports per user per hour (config-driven) ---
  const settings = await ConfigRepository.get();
  const oneHourAgo = new Date(Date.now() - 36e5).toISOString();
  const recentCount = await ReportRepository.countByUserSince(user!.id, oneHourAgo);
  if (recentCount >= settings.rateLimitReportsPerHour) {
    return NextResponse.json({ error: "Rate limit reached. Please try again later." }, { status: 429 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const imageHash = await computePerceptualHash(buffer);
  
  // Upload to Supabase Storage
  const { supabaseServer } = await import("@/lib/supabase");
  const fileName = `${Date.now()}-${uuid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const { error: storageError } = await supabaseServer.storage
    .from("road-reports")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    console.error("Storage upload error:", storageError);
    return NextResponse.json({ error: "Failed to upload image." }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseServer.storage.from("road-reports").getPublicUrl(fileName);
  const imageUrl = publicUrlData.publicUrl;

  // Reject an exact duplicate image re-submitted by the same user.
  const priorSameUser = await ReportRepository.findByHashAndUser(imageHash, user!.id);
  if (priorSameUser) {
    return NextResponse.json({ error: "You've already submitted this exact image." }, { status: 409 });
  }

  // --- 4.2 AI Verification Pipeline (behind IDamageDetectionProvider) ---
  const aiProvider = getDamageDetectionProvider();
  const detection = await aiProvider.detect({ base64, mimeType: file.type, filename: file.name });

  if (!detection.isRoadDefect || detection.confidence < settings.aiConfidenceThreshold) {
    await AuditLogRepository.log("report_rejected", `AI confidence ${detection.confidence} below threshold ${settings.aiConfidenceThreshold}`, user!.id);
    return NextResponse.json(
      {
        rejected: true,
        message: "Road damage could not be verified.",
        detection,
        provider: aiProvider.name,
      },
      { status: 200 }
    );
  }

  // --- 4.3 Location & Jurisdiction (behind IGeocodingProvider / IJurisdictionResolver) ---
  const geocodingProvider = getGeocodingProvider();
  const jurisdictionResolver = getJurisdictionResolver();
  const [geo, jurisdictionMatch] = await Promise.all([
    geocodingProvider.reverseGeocode(lat, lng),
    jurisdictionResolver.resolve(lat, lng),
  ]);

  // --- 4.4 Duplicate Detection & Merging ---
  const duplicate = await DuplicateDetectionService.findDuplicate(lat, lng, imageHash);

  if (duplicate) {
    await ReportRepository.create({
      issueId: duplicate.id,
      userId: user!.id,
      imageUrl,
      aiConfidence: detection.confidence,
      boundingBox: detection.boundingBox,
      imageHash,
      isDuplicateOf: duplicate.id,
    });
    const updated = await IssueRepository.addConfirmation(duplicate.id, { userId: user!.id, createdAt: new Date().toISOString() });
    if (updated) {
      const { score, band } = await PriorityEngine.computeScoreAndBand(updated);
      const prevBand = duplicate.priorityBand;
      await IssueRepository.update(duplicate.id, { priorityScore: score, priorityBand: band });
      await GamificationService.award(user!.id, "confirmation", duplicate.id);
      await GamificationService.recordActivityForStreak(user!.id);
      if (band !== prevBand) {
        await NotificationService.notify(duplicate.reporterId, "priority_increase", `Your report's priority increased to ${band}.`, duplicate.id);
        if (band === "critical" && duplicate.authorityId) {
          await NotificationService.notifyAuthority(duplicate.authorityId, "critical_alert", `Issue ${duplicate.id} escalated to Critical.`, duplicate.id);
        }
      }
    }
    return NextResponse.json({ merged: true, issueId: duplicate.id, detection });
  }

  // --- New issue: route to authority, compute priority, set SLA ---
  const jurisdiction = jurisdictionMatch ? await JurisdictionRepository.findById(jurisdictionMatch.jurisdictionId) : undefined;
  const authority = jurisdiction ? await AuthorityRepository.findById(jurisdiction.authorityId) : undefined;
  const authorityIntegration = getAuthorityIntegration();

  const damageClasses = await DamageClassRepository.list();
  const defectType = damageClasses.some((d) => d.id === detection.defectType) ? detection.defectType : damageClasses[0]?.id;

  const created = await IssueRepository.create({
    damageClassId: defectType,
    severity: detection.severity,
    status: "ai_verified",
    lat,
    lng,
    address: geo.address,
    jurisdictionId: jurisdiction?.id ?? "unassigned",
    authorityId: authority?.id,
    reporterId: user!.id,
    imageUrl,
    imageHash,
    aiConfidence: detection.confidence,
    boundingBox: detection.boundingBox,
    priorityScore: 0,
    priorityBand: "medium",
  });

  const { score, band } = await PriorityEngine.computeScoreAndBand(created);
  const slaDeadline = await PriorityEngine.slaDeadline(band, created.createdAt, settings);

  let routing: { routedTo: string; isSimulatedRouting: boolean } = { routedTo: "Unassigned jurisdiction", isSimulatedRouting: true };
  if (authority) {
    const result = await authorityIntegration.routeIssue(created, authority);
    routing = { routedTo: result.routedTo, isSimulatedRouting: result.isSimulated };
  }

  await IssueRepository.update(created.id, {
    priorityScore: score,
    priorityBand: band,
    slaDeadline,
    status: "authority_notified",
    routedTo: routing.routedTo,
    isSimulatedRouting: routing.isSimulatedRouting,
  });

  await ReportRepository.create({
    issueId: created.id,
    userId: user!.id,
    imageUrl,
    aiConfidence: detection.confidence,
    boundingBox: detection.boundingBox,
    imageHash,
  });

  await GamificationService.award(user!.id, "report_verified", created.id);
  await GamificationService.recordActivityForStreak(user!.id);
  await NotificationService.notify(user!.id, "report_verified", "Your report was verified and routed to the authority.", created.id);

  return NextResponse.json({
    created: true,
    issueId: created.id,
    detection,
    routedTo: routing.routedTo,
    isSimulatedRouting: routing.isSimulatedRouting,
    provider: aiProvider.name,
  });
}
