import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { PointsLedgerRepository } from "@/repositories/pointsLedgerRepository";
import { BadgeRepository } from "@/repositories/badgeRepository";
import { GamificationService } from "@/services/gamificationService";
import { IssueRepository } from "@/repositories/issueRepository";
import { ReportRepository } from "@/repositories/reportRepository";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const ledger = await PointsLedgerRepository.listByUser(user.id);
  const allBadges = await BadgeRepository.listAll();
  const earnedBadges = await BadgeRepository.listForUser(user.id);
  const rank = GamificationService.rankFor(user);
  const nextRank = GamificationService.nextRank(user);

  const myIssues = await IssueRepository.listByReporter(user.id);
  const myReports = await ReportRepository.listByUser(user.id);
  const confirmedByOthers = myIssues.reduce((sum, i) => sum + i.confirmations.length, 0);
  const resolved = myIssues.filter((i) => i.status === "resolved").length;

  return NextResponse.json({
    pointsBalance: user.pointsBalance,
    level: user.level,
    rank,
    nextRank,
    streakCount: user.streakCount,
    ledger,
    badges: earnedBadges.map((eb) => allBadges.find((b) => b.id === eb.badgeId)).filter(Boolean),
    allBadges,
    impact: { reported: myReports.length, confirmedByOthers, resolved },
  });
}
