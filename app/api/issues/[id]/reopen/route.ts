import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { NotificationService } from "@/services/notificationService";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["citizen"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (issue.reporterId !== user!.id) {
    return NextResponse.json({ error: "Only the original reporter can flag this." }, { status: 403 });
  }
  if (!["resolved", "verification_pending"].includes(issue.status)) {
    return NextResponse.json({ error: "This issue can't be reopened right now." }, { status: 400 });
  }

  const updated = await IssueRepository.setStatus(issue.id, "reopened");
  if (issue.authorityId) {
    await NotificationService.notifyAuthority(issue.authorityId, "reopened", `Issue ${issue.id} was flagged as still unresolved.`, issue.id);
  }
  return NextResponse.json({ issue: updated });
}
