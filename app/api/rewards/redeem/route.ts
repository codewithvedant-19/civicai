import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { getRewardProvider } from "@/lib/registry";
import { NotificationService } from "@/services/notificationService";

export async function POST(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["citizen"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const body = await req.json().catch(() => null);
  if (!body?.rewardId) return NextResponse.json({ error: "rewardId is required." }, { status: 400 });

  const provider = getRewardProvider();
  const result = await provider.redeem(user!.id, body.rewardId);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

  await NotificationService.notify(user!.id, "reward_redeemed", "Reward redeemed successfully.");
  return NextResponse.json({ redemption: result.redemption });
}
