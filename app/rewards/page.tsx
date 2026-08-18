"use client";
import { useEffect, useState } from "react";
import { Gift, Coins, CheckCircle2, Ticket, Bus, Shirt, Coffee, Star, Shield, HelpCircle, Heart, Film } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { RewardItem, Redemption } from "@/domain/types";
import Image from "next/image";

// Image and color mappings for each reward ID to match the mockup style
const REWARD_STYLES: Record<string, { image: string, tagColor: string, tagLabel: string }> = {
  coffee: {
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    tagColor: "bg-[#1B3B2B]",
    tagLabel: "COFFEE VOUCHER\n$5",
  },
  gym: {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    tagColor: "bg-[#EF4444]",
    tagLabel: "GYM PASS\n1 WEEK",
  },
  bookstore: {
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
    tagColor: "bg-[#047857]",
    tagLabel: "BOOKSTORE VOUCHER\n$15",
  },
  tshirt: {
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    tagColor: "bg-[#1E3A8A]",
    tagLabel: "CIVIC AI\nT-SHIRT",
  }
};

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
    }).catch(() => {});
    if (user) apiGet<{ pointsBalance: number }>("/api/points-history").then((d) => setBalance(d.pointsBalance)).catch(() => {});
  };

  useEffect(load, [user]);

  async function redeem(id: string) {
    setMsg(null);
    try {
      await apiPost("/api/rewards/redeem", { rewardId: id });
      setMsg("Redeemed successfully! Check your points history.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  const filters = [
    { label: "All Rewards", icon: <Gift size={14} />, active: true },
    { label: "Vouchers", icon: <Ticket size={14} />, active: false },
    { label: "Transit", icon: <Bus size={14} />, active: false },
    { label: "Merchandise", icon: <Shirt size={14} />, active: false },
    { label: "Lifestyle", icon: <Coffee size={14} />, active: false },
    { label: "Donation", icon: <Heart size={14} />, active: false },
    { label: "Exclusive", icon: <Shield size={14} />, active: false },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-asphalt text-slate-900">
      <Navbar user={user} />

      {/* Header */}
      <div className="w-full border-b border-asphalt-line bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="h-28 w-28 shrink-0 drop-shadow-xl sm:h-36 sm:w-36">
              <Image src="/images/rewards-gift.jpg" alt="" width={144} height={144} className="object-contain mix-blend-multiply" />
            </div>
            <div>
              <p className="eyebrow mb-2">Civic Rewards</p>
              <h1 className="mb-3 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Rewards Catalog
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
                Redeem your civic points for vouchers, merchandise and exclusive perks.
              </p>
            </div>
          </div>

          {/* Balance Card */}
          {balance !== null && (
            <div className="relative flex min-w-[280px] items-center gap-5 overflow-hidden rounded-2xl bg-teal p-6 text-white shadow-card">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber text-slate-950 shadow-inner">
                <Star size={24} className="fill-slate-950" />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-100">Your Balance</div>
                <div className="font-display text-3xl font-extrabold leading-none">
                  {balance.toLocaleString()} <span className="text-lg font-bold">pts</span>
                </div>
              </div>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-10">
                <Gift size={80} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* Alerts */}
        {msg && (
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2.5 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.label}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                f.active
                  ? "border-teal bg-teal text-white shadow-sm"
                  : "border-asphalt-line bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={f.active ? "text-white" : "text-slate-400"}>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Empty catalog state */}
        {catalog.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Gift size={26} />
            </div>
            <p className="text-sm font-semibold text-slate-700">No rewards available right now</p>
            <p className="max-w-xs text-sm text-slate-500">Check back soon — new rewards are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((item) => {
              const style = REWARD_STYLES[item.id] || REWARD_STYLES["coffee"];
              const affordable = balance === null || balance >= item.pointCost;
              const locked = item.stock <= 0 || !affordable;
              return (
                <div key={item.id} className="card-interactive group flex flex-col overflow-hidden">
                  {/* Image + tag */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <Image src={style.image || "/placeholder.svg"} alt={item.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className={`absolute right-0 top-6 z-10 min-w-[130px] rounded-l-xl ${style.tagColor} px-4 py-3 text-white shadow-lg`}>
                      <p className="whitespace-pre-line text-right text-[11px] font-extrabold uppercase leading-tight tracking-wider">
                        {style.tagLabel}
                      </p>
                    </div>
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">
                          {item.stock <= 0 ? "Out of stock" : "Not enough points"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-1.5 font-display text-lg font-bold leading-tight text-slate-900">{item.label}</h3>
                    <p className="mb-6 flex-1 text-xs leading-relaxed text-slate-500">{item.description}</p>

                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-600">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                        </div>
                        <span className="font-mono text-[15px] font-extrabold">{item.pointCost} pts</span>
                      </div>
                      <span className="font-mono text-[11px] font-medium text-slate-400">
                        {item.stock > 1000 ? "Unlimited" : `${item.stock} left`}
                      </span>
                    </div>

                    <button
                      onClick={() => redeem(item.id)}
                      disabled={locked}
                      className="btn-secondary w-full py-3 text-sm disabled:pointer-events-none disabled:opacity-40"
                    >
                      Redeem Reward <span className="text-base leading-none">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {redemptions.length > 0 && (
          <div className="mb-4 mt-12">
            <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Redemption History</h2>
            <div className="card overflow-hidden">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0">
                  <span className="text-sm font-semibold text-slate-900">{catalog.find((c) => c.id === r.rewardId)?.label ?? r.rewardId}</span>
                  <span className="font-mono text-xs font-medium text-slate-500">-{r.pointCost} pts · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-auto w-full border-t border-asphalt-line bg-white px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 text-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-white shadow-sm">
            <Gift size={14} />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Keep reporting. Keep earning. Help build a better city and unlock more rewards.
          </p>
        </div>
      </div>
    </div>
  );
}

