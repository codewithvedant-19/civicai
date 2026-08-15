import { getDb } from "@/lib/db";
import type { Notification } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const NotificationRepository = {
  async create(userId: string, type: string, message: string, relatedIssueId?: string): Promise<Notification> {
    const db = await getDb();
    const record: Notification = {
      id: uuid(),
      userId,
      type,
      message,
      relatedIssueId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.data.notifications.push(record);
    await db.write();
    return record;
  },

  async listByUser(userId: string): Promise<Notification[]> {
    const db = await getDb();
    return db.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async markRead(id: string): Promise<void> {
    const db = await getDb();
    const n = db.data.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    await db.write();
  },
};
