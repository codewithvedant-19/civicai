import { supabaseServer } from "@/lib/supabase";
import type { Report } from "@/domain/types";
import { v4 as uuid } from "uuid";

function mapReport(data: any): Report {
  return {
    id: data.id,
    issueId: data.issue_id,
    userId: data.user_id,
    imageUrl: data.image_url,
    aiConfidence: data.ai_confidence,
    boundingBox: data.bounding_box,
    imageHash: data.image_hash,
    isDuplicateOf: data.is_duplicate_of || undefined,
    createdAt: data.created_at,
  };
}

export const ReportRepository = {
  async create(report: Omit<Report, "id" | "createdAt">): Promise<Report> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("reports").insert({
      id,
      issue_id: report.issueId,
      user_id: report.userId,
      image_url: report.imageUrl,
      ai_confidence: report.aiConfidence,
      bounding_box: report.boundingBox,
      image_hash: report.imageHash,
      is_duplicate_of: report.isDuplicateOf || null,
    }).select().single();

    if (error) throw error;
    return mapReport(data);
  },

  async listByUser(userId: string): Promise<Report[]> {
    const { data } = await supabaseServer.from("reports").select("*").eq("user_id", userId);
    return (data || []).map(mapReport);
  },

  async countByUserSince(userId: string, sinceIso: string): Promise<number> {
    const { count } = await supabaseServer
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceIso);
    return count || 0;
  },

  async findByHashAndUser(hash: string, userId: string): Promise<Report | undefined> {
    const { data } = await supabaseServer
      .from("reports")
      .select("*")
      .eq("image_hash", hash)
      .eq("user_id", userId)
      .maybeSingle();
    return data ? mapReport(data) : undefined;
  },
};
