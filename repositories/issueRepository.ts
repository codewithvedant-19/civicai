import { db } from "@/db";
import { issues } from "@/db/schema";
import { eq, ne, and, gt, lt } from "drizzle-orm";
import type { Issue, Confirmation, IssueStatus } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const IssueRepository = {
  async findById(id: string): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue as Issue | undefined;
  },

  async list(): Promise<Issue[]> {
    return (await db.select().from(issues)) as Issue[];
  },

  async listOpenNear(lat: number, lng: number, radiusDeg = 0.002): Promise<Issue[]> {
    return (await db
      .select()
      .from(issues)
      .where(
        and(
          ne(issues.status, "resolved"),
          gt(issues.lat, lat - radiusDeg),
          lt(issues.lat, lat + radiusDeg),
          gt(issues.lng, lng - radiusDeg),
          lt(issues.lng, lng + radiusDeg)
        )
      )) as Issue[];
  },

  async findByImageHash(hash: string): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.imageHash, hash));
    return issue as Issue | undefined;
  },

  async create(issue: Omit<Issue, "id" | "createdAt" | "updatedAt" | "confirmations">): Promise<Issue> {
    const now = new Date().toISOString();
    const [record] = await db
      .insert(issues)
      .values({ ...issue, id: uuid(), confirmations: [], createdAt: now, updatedAt: now })
      .returning();
    return record as Issue;
  },

  async addConfirmation(issueId: string, confirmation: Confirmation): Promise<Issue | undefined> {
    const issue = await this.findById(issueId);
    if (!issue) return undefined;
    // enforce uniqueness per (user, issue) — a user confirming twice never counts twice
    if (issue.confirmations.some((c) => c.userId === confirmation.userId)) return issue;
    if (issue.reporterId === confirmation.userId) return issue; // reporter can't confirm own report
    const [updated] = await db
      .update(issues)
      .set({ confirmations: [...issue.confirmations, confirmation], updatedAt: new Date().toISOString() })
      .where(eq(issues.id, issueId))
      .returning();
    return updated as Issue;
  },

  async update(id: string, patch: Partial<Issue>): Promise<Issue | undefined> {
    const [updated] = await db
      .update(issues)
      .set({ ...patch, updatedAt: new Date().toISOString() })
      .where(eq(issues.id, id))
      .returning();
    return updated as Issue | undefined;
  },

  async setStatus(id: string, status: IssueStatus): Promise<Issue | undefined> {
    return this.update(id, { status });
  },

  async listByReporter(userId: string): Promise<Issue[]> {
    return (await db.select().from(issues).where(eq(issues.reporterId, userId))) as Issue[];
  },

  async listByAuthority(authorityId: string): Promise<Issue[]> {
    return (await db.select().from(issues).where(eq(issues.authorityId, authorityId))) as Issue[];
  },

  async listAssignedToOfficer(officerId: string): Promise<Issue[]> {
    return (await db.select().from(issues).where(eq(issues.assignedOfficerId, officerId))) as Issue[];
  },
};
