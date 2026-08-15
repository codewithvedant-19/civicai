import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { NotificationService } from "@/services/notificationService";
import { GamificationService } from "@/services/gamificationService";
import type { IssueStatus } from "@/domain/types";

const VALID_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  reported: ["ai_verified"],
  ai_verified: ["authority_notified"],
  authority_notified: ["under_review"],
  under_review: ["officer_assigned"],
  officer_assigned: ["repair_in_progress"],
  repair_in_progress: ["repair_completed"],
  repair_completed: ["verification_pending"],
  verification_pending: ["resolved", "reopened"],
  resolved: ["reopened"],
  reopened: ["under_review"],
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["officer", "authority_admin", "super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (!RbacService.canManageIssue(user!, issue.authorityId)) {
    return NextResponse.json({ error: "You can't manage issues outside your authority." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nextStatus: IssueStatus | undefined = body?.status;
  if (!nextStatus) return NextResponse.json({ error: "status is required." }, { status: 400 });

  const allowed = VALID_TRANSITIONS[issue.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return NextResponse.json({ error: `Cannot move from ${issue.status} to ${nextStatus}.` }, { status: 400 });
  }

  const updated = await IssueRepository.setStatus(issue.id, nextStatus);
  await NotificationService.notify(issue.reporterId, "status_change", `Your report is now: ${nextStatus.replace(/_/g, " ")}.`, issue.id);

  if (nextStatus === "resolved") {
    await GamificationService.award(issue.reporterId, "resolution_bonus", issue.id);
    for (const c of issue.confirmations) {
      await GamificationService.award(c.userId, "accuracy_bonus", issue.id);
    }
  }

  return NextResponse.json({ issue: updated });
}
