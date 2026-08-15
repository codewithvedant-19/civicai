import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { OfficerRepository } from "@/repositories/miscRepositories";
import { NotificationService } from "@/services/notificationService";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["authority_admin", "super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (!RbacService.canManageIssue(user!, issue.authorityId)) {
    return NextResponse.json({ error: "You can't manage issues outside your authority." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.officerId) return NextResponse.json({ error: "officerId is required." }, { status: 400 });

  const officer = await OfficerRepository.findByUserId(body.officerId);
  if (!officer || officer.authorityId !== issue.authorityId) {
    return NextResponse.json({ error: "Officer not found in this authority." }, { status: 400 });
  }

  await OfficerRepository.assignIssue(body.officerId, issue.id);
  const updated = await IssueRepository.update(issue.id, { assignedOfficerId: body.officerId, status: "officer_assigned" });

  await NotificationService.notify(body.officerId, "officer_assigned", "You've been assigned a new issue.", issue.id);
  await NotificationService.notify(issue.reporterId, "officer_assigned", "An officer has been assigned to your report.", issue.id);

  return NextResponse.json({ issue: updated });
}
