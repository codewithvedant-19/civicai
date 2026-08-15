import { supabaseServer } from "@/lib/supabase";
import type { Notification } from "@/domain/types";
import { v4 as uuid } from "uuid";

function mapNotification(data: any): Notification {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    message: data.message,
    relatedIssueId: data.related_issue_id || undefined,
    read: data.read,
    createdAt: data.created_at,
  };
}

export const NotificationRepository = {
  async create(userId: string, type: string, message: string, relatedIssueId?: string): Promise<Notification> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("notifications").insert({
      id,
      user_id: userId,
      type,
      message,
      related_issue_id: relatedIssueId || null,
      read: false,
    }).select().single();

    if (error) throw error;
    return mapNotification(data);
  },

  async listByUser(userId: string): Promise<Notification[]> {
    const { data } = await supabaseServer
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data || []).map(mapNotification);
  },

  async markRead(id: string): Promise<void> {
    await supabaseServer.from("notifications").update({ read: true }).eq("id", id);
  },
};
