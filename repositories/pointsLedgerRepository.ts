import { db } from "@/db";
import { pointsLedger } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PointsLedgerEntry, PointEventType } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const PointsLedgerRepository = {
  async add(userId: string, eventType: PointEventType, amount: number, relatedIssueId?: string): Promise<PointsLedgerEntry> {
    const [entry] = await db
      .insert(pointsLedger)
      .values({ id: uuid(), userId, eventType, amount, relatedIssueId, createdAt: new Date().toISOString() })
      .returning();
    return entry as PointsLedgerEntry;
  },

  async listByUser(userId: string): Promise<PointsLedgerEntry[]> {
    return (await db
      .select()
      .from(pointsLedger)
      .where(eq(pointsLedger.userId, userId))
      .orderBy(desc(pointsLedger.createdAt))) as PointsLedgerEntry[];
  },
};
