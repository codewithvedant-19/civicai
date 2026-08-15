import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { NotificationService } from "@/services/notificationService";

export const runtime = "nodejs";

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buf.toString("base64")}`;
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

  const beforePhotoUrl = before ? await fileToDataUrl(before) : issue.repairEvidence?.beforePhotoUrl;
  const afterPhotoUrl = after ? await fileToDataUrl(after) : issue.repairEvidence?.afterPhotoUrl;

  const updated = await IssueRepository.update(issue.id, {
    repairEvidence: { beforePhotoUrl, afterPhotoUrl, notes, officerId: user!.id, completedAt: new Date().toISOString() },
    status: afterPhotoUrl ? "repair_completed" : issue.status,
  });

  await NotificationService.notify(issue.reporterId, "repair_evidence", "Repair evidence uploaded for your report.", issue.id);

  return NextResponse.json({ issue: updated });
}
