import { supabaseServer } from "@/lib/supabase";
import type { Badge, UserBadge } from "@/domain/types";

export const BadgeRepository = {
  async listAll(): Promise<Badge[]> {
    const { data } = await supabaseServer.from("badges").select("*");
    return data || [];
  },

  async listForUser(userId: string): Promise<UserBadge[]> {
    const { data } = await supabaseServer.from("user_badges").select("*").eq("user_id", userId);
    return (data || []).map(b => ({
      userId: b.user_id,
      badgeId: b.badge_id,
      earnedAt: b.earned_at
    }));
  },

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const { data } = await supabaseServer
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)
      .eq("badge_id", badgeId)
      .maybeSingle();
    return !!data;
  },

  async award(userId: string, badgeId: string): Promise<UserBadge | null> {
    const hasIt = await this.hasBadge(userId, badgeId);
    if (hasIt) return null;

    const { data, error } = await supabaseServer.from("user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
    }).select().single();

    if (error) return null;
    return {
      userId: data.user_id,
      badgeId: data.badge_id,
      earnedAt: data.earned_at
    };
  },
};
