import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { getRewardProvider } from "@/lib/registry";
import { RewardRepository } from "@/repositories/rewardRepository";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  const provider = getRewardProvider();
  const catalog = await provider.listCatalog();
  const redemptions = user ? await RewardRepository.listRedemptionsByUser(user.id) : [];
  return NextResponse.json({ catalog, redemptions, provider: provider.name });
}
