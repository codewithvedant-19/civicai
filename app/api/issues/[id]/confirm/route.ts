import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { IssueRepository } from "@/repositories/issueRepository";
import { PriorityEngine } from "@/services/priorityEngine";
import { GamificationService } from "@/services/gamificationService";
import { NotificationService } from "@/services/notificationService";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["citizen"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (issue.reporterId === user!.id) {
    return NextResponse.json({ error: "You can't confirm your own report." }, { status: 400 });
  }
  if (issue.confirmations.some((c) => c.userId === user!.id)) {
    return NextResponse.json({ error: "You've already confirmed this issue." }, { status: 409 });
  }

  const updated = await IssueRepository.addConfirmation(issue.id, { userId: user!.id, createdAt: new Date().toISOString() });
  if (!updated) return NextResponse.json({ error: "Could not confirm issue." }, { status: 400 });

  const prevBand = issue.priorityBand;
  const { score, band } = await PriorityEngine.computeScoreAndBand(updated);
  await IssueRepository.update(issue.id, { priorityScore: score, priorityBand: band });

  await GamificationService.award(user!.id, "confirmation", issue.id);
  await GamificationService.recordActivityForStreak(user!.id);
  await NotificationService.notify(issue.reporterId, "confirmation", "Someone confirmed your reported issue.", issue.id);

  if (band !== prevBand) {
    await NotificationService.notify(issue.reporterId, "priority_increase", `Your report's priority increased to ${band}.`, issue.id);
    if (band === "critical" && issue.authorityId) {
      await NotificationService.notifyAuthority(issue.authorityId, "critical_alert", `Issue ${issue.id} escalated to Critical.`, issue.id);
    }
  }

  return NextResponse.json({ issueId: issue.id, uniqueReporters: updated.confirmations.length + 1, priorityBand: band });
}
