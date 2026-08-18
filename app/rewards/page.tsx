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
    tagColor: "bg-[#7C3AED]",
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
    <div className="min-h-screen bg-white text-slate-900 font-body flex flex-col">
      <Navbar user={user} />
      
      {/* Header Section (Lavender Gradient) */}
      <div className="w-full bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] py-12 px-6 border-b border-[#E2E8F0] overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative">
          
          {/* Left: 3D Gift & Copy */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
            <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 drop-shadow-2xl -ml-4 sm:ml-0">
              <Image src="/images/rewards-gift.jpg" alt="Gift Box" width={144} height={144} className="object-contain mix-blend-multiply" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-3 tracking-tight">Rewards Catalog</h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-sm leading-relaxed font-medium">
                Redeem your civic points for exciting rewards, vouchers & exclusive perks.
              </p>
            </div>
          </div>

          {/* Right: Balance Card */}
          {balance !== null && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 min-w-[280px] relative z-10">
              <div className="w-14 h-14 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0 shadow-inner">
                <Star size={24} className="fill-white" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Your Balance</div>
                <div className="font-display font-black text-3xl text-[#7C3AED] leading-none">{balance} <span className="text-lg">pts</span></div>
              </div>
              <div className="opacity-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <Gift size={80} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        
        {/* Alerts */}
        {msg && (
          <div className="mb-8 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.label}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                f.active 
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/20" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={f.active ? "text-white" : "text-slate-400"}>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalog.map((item) => {
            const style = REWARD_STYLES[item.id] || REWARD_STYLES["coffee"];
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all flex flex-col overflow-hidden group">
                
                {/* Top Half: Image with Overlay Tag */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image src={style.image} alt={item.label} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Floating Right Tag */}
                  <div className={`absolute top-6 right-0 ${style.tagColor} text-white px-4 py-3 rounded-l-xl shadow-lg min-w-[130px] z-10`}>
                    <p className="text-[11px] font-black uppercase tracking-wider leading-tight whitespace-pre-line text-right">
                      {style.tagLabel}
                    </p>
                    {/* Fold effect triangle */}
                    <div className="absolute -bottom-2 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-black/40 border-r-transparent"></div>
                  </div>
                </div>

                {/* Bottom Half: Details & Action */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-black text-slate-900 text-lg mb-1.5 leading-tight">{item.label}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 flex-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-amber-500">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <Star size={12} className="fill-amber-500" />
                      </div>
                      <span className="font-mono text-[15px] font-black">{item.pointCost} pts</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 font-medium">{item.stock > 1000 ? "Unlimited" : `${item.stock} left`}</span>
                  </div>

                  <button
                    onClick={() => redeem(item.id)}
                    disabled={item.stock <= 0 || (balance !== null && balance < item.pointCost)}
                    className="w-full rounded-xl border-2 border-[#7C3AED] bg-white hover:bg-[#F5F3FF] text-[#7C3AED] py-3 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    Redeem Reward <span className="text-lg leading-none">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {redemptions.length > 0 && (
          <div className="mt-12 mb-4">
            <h2 className="mb-4 font-display text-xl font-black uppercase tracking-tight text-slate-950">Redemption History</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0">
                  <span className="font-bold text-slate-900 text-sm">{catalog.find((c) => c.id === r.rewardId)?.label ?? r.rewardId}</span>
                  <span className="font-mono text-slate-500 font-medium text-xs">-{r.pointCost} pts · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="w-full bg-[#F5F3FF] border-t border-purple-100/50 py-6 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 text-center">
          <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Gift size={14} />
          </div>
          <p className="text-[13px] font-bold text-slate-800">
            Keep reporting. Keep earning. Help build a better city and unlock more rewards!
          </p>
        </div>
      </div>
    </div>
  );
}

