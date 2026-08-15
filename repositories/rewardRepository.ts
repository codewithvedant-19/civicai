import { db } from "@/db";
import { rewardsCatalog, redemptions } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import type { RewardItem, Redemption } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const RewardRepository = {
  async listCatalog(): Promise<RewardItem[]> {
    return (await db.select().from(rewardsCatalog)) as RewardItem[];
  },

  async findById(id: string): Promise<RewardItem | undefined> {
    const [row] = await db.select().from(rewardsCatalog).where(eq(rewardsCatalog.id, id));
    return row as RewardItem | undefined;
  },

  async decrementStock(id: string): Promise<void> {
    await db
      .update(rewardsCatalog)
      .set({ stock: sql`${rewardsCatalog.stock} - 1` })
      .where(and(eq(rewardsCatalog.id, id), gt(rewardsCatalog.stock, 0)));
  },

  async createRedemption(userId: string, rewardId: string, pointCost: number): Promise<Redemption> {
    const [record] = await db
      .insert(redemptions)
      .values({ id: uuid(), userId, rewardId, pointCost, status: "redeemed", createdAt: new Date().toISOString() })
      .returning();
    return record as Redemption;
  },

  async listRedemptionsByUser(userId: string): Promise<Redemption[]> {
    return (await db.select().from(redemptions).where(eq(redemptions.userId, userId))) as Redemption[];
  },
};
