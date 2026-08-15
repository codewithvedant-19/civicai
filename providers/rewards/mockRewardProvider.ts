import type { IRewardProvider, RewardItem, RedemptionResult } from "@/domain/types";
import { RewardRepository } from "@/repositories/rewardRepository";
import { UserRepository } from "@/repositories/userRepository";
import { PointsLedgerRepository } from "@/repositories/pointsLedgerRepository";

// SIMULATED PROVIDER — mock gift-card/voucher catalog. Balance checks are
// server-side and authoritative (never trust a client-submitted point value).
// To go live, implement IRewardProvider against a real vendor API in a new
// file and switch it on in lib/registry.ts.
export class MockRewardProvider implements IRewardProvider {
  readonly name = "MockRewardProvider (simulated)";

  async listCatalog(): Promise<RewardItem[]> {
    return RewardRepository.listCatalog();
  }

  async redeem(userId: string, rewardId: string): Promise<RedemptionResult> {
    const item = await RewardRepository.findById(rewardId);
    if (!item) return { success: false, error: "Reward not found." };
    if (item.stock <= 0) return { success: false, error: "Reward out of stock." };

    const user = await UserRepository.findById(userId);
    if (!user) return { success: false, error: "User not found." };
    if (user.pointsBalance < item.pointCost) {
      return { success: false, error: "Not enough points for this reward." };
    }

    await UserRepository.adjustPoints(userId, -item.pointCost);
    await RewardRepository.decrementStock(rewardId);
    await PointsLedgerRepository.add(userId, "redemption", -item.pointCost);
    const redemption = await RewardRepository.createRedemption(userId, rewardId, item.pointCost);
    return { success: true, redemption };
  }
}
