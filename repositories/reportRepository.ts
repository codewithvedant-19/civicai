import { getDb } from "@/lib/db";
import type { Report } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const ReportRepository = {
  async create(report: Omit<Report, "id" | "createdAt">): Promise<Report> {
    const db = await getDb();
    const record: Report = { ...report, id: uuid(), createdAt: new Date().toISOString() };
    db.data.reports.push(record);
    await db.write();
    return record;
  },

  async listByUser(userId: string): Promise<Report[]> {
    const db = await getDb();
    return db.data.reports.filter((r) => r.userId === userId);
  },

  async countByUserSince(userId: string, sinceIso: string): Promise<number> {
    const db = await getDb();
    return db.data.reports.filter((r) => r.userId === userId && r.createdAt >= sinceIso).length;
  },

  async findByHashAndUser(hash: string, userId: string): Promise<Report | undefined> {
    const db = await getDb();
    return db.data.reports.find((r) => r.imageHash === hash && r.userId === userId);
  },
};
