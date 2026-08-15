import { getDb } from "@/lib/db";
import type { RewardItem, Redemption } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const RewardRepository = {
  async listCatalog(): Promise<RewardItem[]> {
    const db = await getDb();
    return db.data.rewardsCatalog;
  },

  async findById(id: string): Promise<RewardItem | undefined> {
    const db = await getDb();
    return db.data.rewardsCatalog.find((r) => r.id === id);
  },

  async decrementStock(id: string): Promise<void> {
    const db = await getDb();
    const item = db.data.rewardsCatalog.find((r) => r.id === id);
    if (item && item.stock > 0) item.stock -= 1;
    await db.write();
  },

  async createRedemption(userId: string, rewardId: string, pointCost: number): Promise<Redemption> {
    const db = await getDb();
    const record: Redemption = {
      id: uuid(),
      userId,
      rewardId,
      pointCost,
      status: "redeemed",
      createdAt: new Date().toISOString(),
    };
    db.data.redemptions.push(record);
    await db.write();
    return record;
  },

  async listRedemptionsByUser(userId: string): Promise<Redemption[]> {
    const db = await getDb();
    return db.data.redemptions.filter((r) => r.userId === userId);
  },
};
