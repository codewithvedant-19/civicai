import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Notification } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const NotificationRepository = {
  async create(userId: string, type: string, message: string, relatedIssueId?: string): Promise<Notification> {
    const [record] = await db
      .insert(notifications)
      .values({ id: uuid(), userId, type, message, relatedIssueId, read: false, createdAt: new Date().toISOString() })
      .returning();
    return record as Notification;
  },

  async listByUser(userId: string): Promise<Notification[]> {
    return (await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))) as Notification[];
  },

  async markRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  },
};
