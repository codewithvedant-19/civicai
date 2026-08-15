import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import type { Report } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const ReportRepository = {
  async create(report: Omit<Report, "id" | "createdAt">): Promise<Report> {
    const [record] = await db
      .insert(reports)
      .values({ ...report, id: uuid(), createdAt: new Date().toISOString() })
      .returning();
    return record as Report;
  },

  async listByUser(userId: string): Promise<Report[]> {
    return (await db.select().from(reports).where(eq(reports.userId, userId))) as Report[];
  },

  async countByUserSince(userId: string, sinceIso: string): Promise<number> {
    const rows = await db
      .select()
      .from(reports)
      .where(and(eq(reports.userId, userId), gte(reports.createdAt, sinceIso)));
    return rows.length;
  },

  async findByHashAndUser(hash: string, userId: string): Promise<Report | undefined> {
    const [row] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.imageHash, hash), eq(reports.userId, userId)));
    return row as Report | undefined;
  },
};
