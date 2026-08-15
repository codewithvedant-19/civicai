import { supabaseServer } from "@/lib/supabase";
import type { RewardItem, Redemption } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const RewardRepository = {
  async listCatalog(): Promise<RewardItem[]> {
    const { data } = await supabaseServer.from("rewards_catalog").select("*");
    return (data || []).map(r => ({
      id: r.id,
      label: r.label,
      description: r.description,
      pointCost: r.point_cost,
      stock: r.stock,
    }));
  },

  async findById(id: string): Promise<RewardItem | undefined> {
    const { data } = await supabaseServer.from("rewards_catalog").select("*").eq("id", id).maybeSingle();
    return data ? {
      id: data.id,
      label: data.label,
      description: data.description,
      pointCost: data.point_cost,
      stock: data.stock,
    } : undefined;
  },

  async decrementStock(id: string): Promise<void> {
    const item = await this.findById(id);
    if (item && item.stock > 0) {
      await supabaseServer.from("rewards_catalog").update({ stock: item.stock - 1 }).eq("id", id);
    }
  },

  async createRedemption(userId: string, rewardId: string, pointCost: number): Promise<Redemption> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("redemptions").insert({
      id,
      user_id: userId,
      reward_id: rewardId,
      point_cost: pointCost,
      status: "redeemed",
    }).select().single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      rewardId: data.reward_id,
      pointCost: data.point_cost,
      status: data.status as "redeemed",
      createdAt: data.created_at,
    };
  },

  async listRedemptionsByUser(userId: string): Promise<Redemption[]> {
    const { data } = await supabaseServer.from("redemptions").select("*").eq("user_id", userId);
    return (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      rewardId: r.reward_id,
      pointCost: r.point_cost,
      status: r.status as "redeemed",
      createdAt: r.created_at,
    }));
  },
};
