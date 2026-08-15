import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/repositories/userRepository";
import { GamificationService } from "@/services/gamificationService";

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "all_time"; // week/month/all_time — prototype ranks by all-time balance
  const citizens = (await UserRepository.list()).filter((u) => u.role === "citizen");
  const ranked = citizens
    .sort((a, b) => b.pointsBalance - a.pointsBalance)
    .map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      points: u.pointsBalance,
      rankName: GamificationService.rankFor(u).name,
    }));
  return NextResponse.json({ scope, leaderboard: ranked });
}
