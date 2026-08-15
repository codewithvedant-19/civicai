import { UserRepository } from "@/repositories/userRepository";
import { PointsLedgerRepository } from "@/repositories/pointsLedgerRepository";
import { BadgeRepository } from "@/repositories/badgeRepository";
import { ReportRepository } from "@/repositories/reportRepository";
import { IssueRepository } from "@/repositories/issueRepository";
import { NotificationService } from "@/services/notificationService";
import type { PointEventType, User } from "@/domain/types";

const POINTS_FOR: Record<Exclude<PointEventType, "redemption">, number> = {
  report_verified: 25,
  confirmation: 10,
  accuracy_bonus: 15,
  resolution_bonus: 40,
};

export const RANKS = [
  { level: 1, name: "Pothole Spotter", minPoints: 0 },
  { level: 2, name: "Road Guardian", minPoints: 150 },
  { level: 3, name: "City Defender", minPoints: 500 },
  { level: 4, name: "Infrastructure Hero", minPoints: 1200 },
] as const;

function rankFor(points: number) {
  return [...RANKS].reverse().find((r) => points >= r.minPoints) ?? RANKS[0];
}

// ============================================================================
// Anti-gaming guardrail made visible in code: this is the ONLY function in
// the entire app that increases a user's pointsBalance for report/confirm/
// resolve events, and it is only ever called from server-side API routes
// after AI verification and duplicate checks pass — never from the client.
// ============================================================================
export const GamificationService = {
  async award(userId: string, eventType: Exclude<PointEventType, "redemption">, relatedIssueId?: string) {
    const amount = POINTS_FOR[eventType];
    await PointsLedgerRepository.add(userId, eventType, amount, relatedIssueId);
    const before = await UserRepository.findById(userId);
    const beforeRank = before ? rankFor(before.pointsBalance) : RANKS[0];
    const user = await UserRepository.adjustPoints(userId, amount);
    if (!user) return;

    const afterRank = rankFor(user.pointsBalance);
    if (afterRank.level !== user.level) {
      await UserRepository.update(userId, { level: afterRank.level });
    }
    if (afterRank.level > beforeRank.level) {
      await NotificationService.notify(
        userId,
        "level_up",
        `Level up! You're now a ${afterRank.name}.`,
        relatedIssueId
      );
    }
    await NotificationService.notify(userId, "points_credited", `+${amount} points credited.`, relatedIssueId);

    await this.checkBadges(userId);
  },

  async recordActivityForStreak(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = user.lastActivityDate?.slice(0, 10);
    if (last === today) return; // already counted today
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = last === yesterday ? user.streakCount + 1 : 1;
    await UserRepository.update(userId, { streakCount: newStreak, lastActivityDate: today });
    if (newStreak === 5) {
      await this.awardBadgeIfNew(userId, "streak_5");
    }
  },

  async awardBadgeIfNew(userId: string, badgeId: string) {
    const awarded = await BadgeRepository.award(userId, badgeId);
    if (awarded) {
      const badges = await BadgeRepository.listAll();
      const badge = badges.find((b) => b.id === badgeId);
      await NotificationService.notify(userId, "badge_earned", `Badge earned: ${badge?.label ?? badgeId}`);
    }
  },

  async checkBadges(userId: string) {
    const reports = await ReportRepository.listByUser(userId);
    if (reports.length >= 1) await this.awardBadgeIfNew(userId, "first_report");
    if (reports.length >= 10) await this.awardBadgeIfNew(userId, "verified_10");

    const resolved = (await IssueRepository.listByReporter(userId)).filter((i) => i.status === "resolved");
    if (resolved.length >= 1) await this.awardBadgeIfNew(userId, "repair_confirmed");

    const critical = (await IssueRepository.listByReporter(userId)).filter((i) => i.priorityBand === "critical");
    if (critical.length >= 1) await this.awardBadgeIfNew(userId, "critical_spotter");
  },

  rankFor(user: Pick<User, "pointsBalance">) {
    return rankFor(user.pointsBalance);
  },

  nextRank(user: Pick<User, "pointsBalance">) {
    const current = rankFor(user.pointsBalance);
    return RANKS.find((r) => r.level === current.level + 1) ?? null;
  },
};
