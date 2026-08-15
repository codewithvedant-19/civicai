"use client";
import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { RewardItem, Redemption } from "@/domain/types";

export default function RewardsPage() {
  const { user, refresh } = useCurrentUser();
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [provider, setProvider] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const load = () => {
    apiGet<{ catalog: RewardItem[]; redemptions: Redemption[]; provider: string }>("/api/rewards").then((d) => {
      setCatalog(d.catalog);
      setRedemptions(d.redemptions);
      setProvider(d.provider);
    });
    if (user) apiGet<{ pointsBalance: number }>("/api/points-history").then((d) => setBalance(d.pointsBalance));
  };

  useEffect(load, [user]);

  async function redeem(id: string) {
    setMsg(null);
    try {
      await apiPost("/api/rewards/redeem", { rewardId: id });
      setMsg("Redeemed! Check your points history for the ledger entry.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 flex items-center gap-2">
          <Gift className="text-amber" size={22} />
          <h1 className="font-display text-2xl font-semibold text-ink">Rewards Catalog</h1>
        </div>
        <p className="mb-1 text-xs font-mono text-ink-faint">Provider: {provider}</p>
        {balance !== null && <p className="mb-6 text-sm text-ink-muted">Your balance: <span className="text-teal font-mono">{balance} pts</span></p>}
        {msg && <p className="mb-4 rounded-lg bg-teal/10 p-2.5 text-sm text-teal">{msg}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {catalog.map((item) => (
            <div key={item.id} className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4">
              <h3 className="font-display text-base font-semibold text-ink">{item.label}</h3>
              <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-sm text-amber">{item.pointCost} pts</span>
                <span className="text-xs text-ink-faint">{item.stock} left</span>
              </div>
              {user?.role === "citizen" && (
                <button
                  onClick={() => redeem(item.id)}
                  disabled={item.stock <= 0 || (balance !== null && balance < item.pointCost)}
                  className="mt-3 w-full rounded-lg bg-amber py-2 text-sm font-medium text-asphalt hover:bg-amber/90 disabled:opacity-30"
                >
                  Redeem
                </button>
              )}
            </div>
          ))}
        </div>

        {redemptions.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Redemption History</h2>
            <div className="overflow-hidden rounded-xl border border-asphalt-line">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-asphalt-line bg-asphalt-surface px-4 py-2.5 last:border-b-0 text-sm">
                  <span className="text-ink">{catalog.find((c) => c.id === r.rewardId)?.label ?? r.rewardId}</span>
                  <span className="font-mono text-ink-muted">-{r.pointCost} pts · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
