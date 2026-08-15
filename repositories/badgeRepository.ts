import { db } from "@/db";
import { badges, userBadges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { Badge, UserBadge } from "@/domain/types";

export const BadgeRepository = {
  async listAll(): Promise<Badge[]> {
    return (await db.select().from(badges)) as Badge[];
  },

  async listForUser(userId: string): Promise<UserBadge[]> {
    return (await db.select().from(userBadges).where(eq(userBadges.userId, userId))) as UserBadge[];
  },

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const rows = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    return rows.length > 0;
  },

  async award(userId: string, badgeId: string): Promise<UserBadge | null> {
    if (await this.hasBadge(userId, badgeId)) return null;
    const [record] = await db
      .insert(userBadges)
      .values({ userId, badgeId, earnedAt: new Date().toISOString() })
      .returning();
    return record as UserBadge;
  },
};
