import { getDb } from "@/lib/db";
import type { Issue, Confirmation, IssueStatus } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const IssueRepository = {
  async findById(id: string): Promise<Issue | undefined> {
    const db = await getDb();
    return db.data.issues.find((i) => i.id === id);
  },

  async list(): Promise<Issue[]> {
    const db = await getDb();
    return db.data.issues;
  },

  async listOpenNear(lat: number, lng: number, radiusDeg = 0.002): Promise<Issue[]> {
    const db = await getDb();
    return db.data.issues.filter(
      (i) =>
        i.status !== "resolved" &&
        Math.abs(i.lat - lat) < radiusDeg &&
        Math.abs(i.lng - lng) < radiusDeg
    );
  },

  async findByImageHash(hash: string): Promise<Issue | undefined> {
    const db = await getDb();
    return db.data.issues.find((i) => i.imageHash === hash);
  },

  async create(issue: Omit<Issue, "id" | "createdAt" | "updatedAt" | "confirmations">): Promise<Issue> {
    const db = await getDb();
    const now = new Date().toISOString();
    const record: Issue = { ...issue, id: uuid(), confirmations: [], createdAt: now, updatedAt: now };
    db.data.issues.push(record);
    await db.write();
    return record;
  },

  async addConfirmation(issueId: string, confirmation: Confirmation): Promise<Issue | undefined> {
    const db = await getDb();
    const issue = db.data.issues.find((i) => i.id === issueId);
    if (!issue) return undefined;
    // enforce uniqueness per (user, issue) — a user confirming twice never counts twice
    if (issue.confirmations.some((c) => c.userId === confirmation.userId)) return issue;
    if (issue.reporterId === confirmation.userId) return issue; // reporter can't confirm own report
    issue.confirmations.push(confirmation);
    issue.updatedAt = new Date().toISOString();
    await db.write();
    return issue;
  },

  async update(id: string, patch: Partial<Issue>): Promise<Issue | undefined> {
    const db = await getDb();
    const issue = db.data.issues.find((i) => i.id === id);
    if (!issue) return undefined;
    Object.assign(issue, patch, { updatedAt: new Date().toISOString() });
    await db.write();
    return issue;
  },

  async setStatus(id: string, status: IssueStatus): Promise<Issue | undefined> {
    return this.update(id, { status });
  },

  async listByReporter(userId: string): Promise<Issue[]> {
    const db = await getDb();
    return db.data.issues.filter((i) => i.reporterId === userId);
  },

  async listByAuthority(authorityId: string): Promise<Issue[]> {
    const db = await getDb();
    return db.data.issues.filter((i) => i.authorityId === authorityId);
  },

  async listAssignedToOfficer(officerId: string): Promise<Issue[]> {
    const db = await getDb();
    return db.data.issues.filter((i) => i.assignedOfficerId === officerId);
  },
};
