import { supabaseServer } from "@/lib/supabase";
import type { PointsLedgerEntry, PointEventType } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const PointsLedgerRepository = {
  async add(userId: string, eventType: PointEventType, amount: number, relatedIssueId?: string): Promise<PointsLedgerEntry> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("points_ledger").insert({
      id,
      user_id: userId,
      event_type: eventType,
      amount,
      related_issue_id: relatedIssueId || null,
    }).select().single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      eventType: data.event_type as PointEventType,
      amount: data.amount,
      relatedIssueId: data.related_issue_id || undefined,
      createdAt: data.created_at,
    };
  },

  async listByUser(userId: string): Promise<PointsLedgerEntry[]> {
    const { data } = await supabaseServer
      .from("points_ledger")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      eventType: d.event_type as PointEventType,
      amount: d.amount,
      relatedIssueId: d.related_issue_id || undefined,
      createdAt: d.created_at,
    }));
  },
};
