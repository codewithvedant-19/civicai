import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { NotificationService } from "@/services/notificationService";
import { supabaseServer } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

async function uploadToSupabase(file: File): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `repair-${Date.now()}-${uuid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const { error } = await supabaseServer.storage
    .from("road-reports")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data } = supabaseServer.storage.from("road-reports").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["officer", "authority_admin", "super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (!RbacService.canManageIssue(user!, issue.authorityId)) {
    return NextResponse.json({ error: "You can't manage issues outside your authority." }, { status: 403 });
  }

  const form = await req.formData();
  const before = form.get("before") as File | null;
  const after = form.get("after") as File | null;
  const notes = String(form.get("notes") ?? "");

  const beforePhotoUrl = before ? (await uploadToSupabase(before) || issue.repairEvidence?.beforePhotoUrl) : issue.repairEvidence?.beforePhotoUrl;
  const afterPhotoUrl = after ? (await uploadToSupabase(after) || issue.repairEvidence?.afterPhotoUrl) : issue.repairEvidence?.afterPhotoUrl;

  const updated = await IssueRepository.update(issue.id, {
    repairEvidence: { beforePhotoUrl, afterPhotoUrl, notes, officerId: user!.id, completedAt: new Date().toISOString() },
    status: afterPhotoUrl ? "repair_completed" : issue.status,
  });

  await NotificationService.notify(issue.reporterId, "repair_evidence", "Repair evidence uploaded for your report.", issue.id);

  return NextResponse.json({ issue: updated });
}
