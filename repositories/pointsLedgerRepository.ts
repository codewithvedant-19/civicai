import { getDb } from "@/lib/db";
import type { PointsLedgerEntry, PointEventType } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const PointsLedgerRepository = {
  async add(userId: string, eventType: PointEventType, amount: number, relatedIssueId?: string): Promise<PointsLedgerEntry> {
    const db = await getDb();
    const entry: PointsLedgerEntry = {
      id: uuid(),
      userId,
      eventType,
      amount,
      relatedIssueId,
      createdAt: new Date().toISOString(),
    };
    db.data.pointsLedger.push(entry);
    await db.write();
    return entry;
  },

  async listByUser(userId: string): Promise<PointsLedgerEntry[]> {
    const db = await getDb();
    return db.data.pointsLedger
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
