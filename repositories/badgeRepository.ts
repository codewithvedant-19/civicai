import { getDb } from "@/lib/db";
import type { Badge, UserBadge } from "@/domain/types";

export const BadgeRepository = {
  async listAll(): Promise<Badge[]> {
    const db = await getDb();
    return db.data.badges;
  },

  async listForUser(userId: string): Promise<UserBadge[]> {
    const db = await getDb();
    return db.data.userBadges.filter((b) => b.userId === userId);
  },

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const db = await getDb();
    return db.data.userBadges.some((b) => b.userId === userId && b.badgeId === badgeId);
  },

  async award(userId: string, badgeId: string): Promise<UserBadge | null> {
    const db = await getDb();
    if (db.data.userBadges.some((b) => b.userId === userId && b.badgeId === badgeId)) return null;
    const record: UserBadge = { userId, badgeId, earnedAt: new Date().toISOString() };
    db.data.userBadges.push(record);
    await db.write();
    return record;
  },
};
