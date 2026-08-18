"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Camera, Award, History, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import BadgeShelf from "@/components/BadgeShelf";
import IssueCard from "@/components/IssueCard";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";
import type { Issue, Badge, DamageClass, PointsLedgerEntry } from "@/domain/types";
import { MockElectricityData, ELECTRICITY_CLASSES } from "@/lib/mockElectricityData";

interface PointsData {
  pointsBalance: number;
  level: number;
  rank: { level: number; name: string; minPoints: number };
  nextRank: { level: number; name: string; minPoints: number } | null;
  streakCount: number;
  ledger: PointsLedgerEntry[];
  badges: Badge[];
  allBadges: Badge[];
  impact: { reported: number; confirmedByOthers: number; resolved: number };
}

export default function ElectricityDashboardPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [data, setData] = useState<PointsData | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [damageClasses, setDamageClasses] = useState<DamageClass[]>(ELECTRICITY_CLASSES);

  useEffect(() => {
    if (!user) return;
    // We re-use the Roads points history so gamification still feels alive in demo
    apiGet<PointsData>("/api/points-history").then(setData).catch(() => {});
    
    // Load issues from our local mock data
    const myIssues = MockElectricityData.getIssues().filter((i) => i.reporterId === user.id);
    setIssues(myIssues.reverse()); // latest first
  }, [user]);

  if (loading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  // Calculate local mock impact for Electricity
  const mockImpact = {
    reported: issues.length,
    confirmedByOthers: issues.reduce((acc, i) => acc + (i.confirmations?.length || 0), 0),
    resolved: issues.filter(i => i.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#E7ECF0] blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
          <div>
            <div className="inline-block mb-1 px-2 py-1 text-[10px] font-bold tracking-widest text-emerald-800 bg-emerald-100 rounded border border-emerald-200 uppercase">
              Electricity Department
            </div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-950">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-slate-600 font-medium">Your personal civic impact & Electricity verification stats.</p>
          </div>
          <Link
            href="/Electricity/report"
            className="flex items-center gap-2 rounded-xl bg-[#FFC000] hover:bg-[#EBB000] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:scale-105"
          >
            <Camera size={16} /> Report Electricity Issue
          </Link>
        </div>

        {data && (
          <>
            <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm mb-6">
              <XPBar
                points={data.pointsBalance}
                rankName={data.rank.name}
                nextRankName={data.nextRank?.name}
                minPoints={data.rank.minPoints}
                nextMinPoints={data.nextRank?.minPoints}
              />
              <div className="mt-4 flex items-center gap-2 font-mono text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 inline-flex">
                <Flame size={16} className="text-amber-500" />
                {data.streakCount} Day Reporting Streak
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <StatCard label="Electricity Issues Reported" value={mockImpact.reported} />
              <StatCard label="Confirmed by others" value={mockImpact.confirmedByOthers} />
              <StatCard label="Resolved" value={mockImpact.resolved} />
            </div>

            <div className="mb-8">
              <h2 className="mb-3 font-display text-xl font-black uppercase tracking-tight text-slate-950">Badges Earned</h2>
              <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
                <BadgeShelf allBadges={data.allBadges} earnedIds={new Set(data.badges.map((b) => b.id))} />
              </div>
            </div>
          </>
        )}

        <div>
          <h2 className="mb-3 font-display text-xl font-black uppercase tracking-tight text-slate-950">My Submitted Electricity Reports</h2>
          <div className="space-y-3">
            {issues.length === 0 && <p className="text-xs text-slate-500 bg-white p-5 rounded-xl border border-slate-200">You haven't reported any Electricity issues yet.</p>}
            {issues.map((i) => (
              <IssueCard key={i.id} issue={i} damageClass={damageClasses.find((d) => d.id === i.damageClassId)} href={`/Electricity/issues/${i.id}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#CBD5E1] bg-white p-5 shadow-sm">
      <div className="font-mono text-3xl font-black text-slate-950">{value}</div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mt-1">{label}</div>
    </div>
  );
}
