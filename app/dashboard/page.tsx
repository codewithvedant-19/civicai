"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Camera, Award, History, CheckCircle2, Construction } from "lucide-react";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import BadgeShelf from "@/components/BadgeShelf";
import IssueCard from "@/components/IssueCard";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";
import type { Issue, Badge, DamageClass, PointsLedgerEntry } from "@/domain/types";

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

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [data, setData] = useState<PointsData | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [damageClasses, setDamageClasses] = useState<DamageClass[]>([]);

  useEffect(() => {
    if (!user) return;
    apiGet<PointsData>("/api/points-history").then(setData).catch(() => {});
    apiGet<{ issues: Issue[] }>("/api/issues?mine=true").then((d) => setIssues(d.issues)).catch(() => {});
    apiGet<{ damageClasses: DamageClass[] }>("/api/public/stats").then((d) => setDamageClasses(d.damageClasses)).catch(() => {});
  }, [user]);

  if (loading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-asphalt blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Welcome */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-teal-dim px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal">
              <Construction size={12} /> Roads &amp; Potholes
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-slate-600">Your personal civic impact and road verification stats.</p>
          </div>
          <Link href="/report" className="btn-primary px-5 py-2.5 text-sm">
            <Camera size={16} /> Report Road Damage
          </Link>
        </div>

        {!data ? (
          <div className="mb-6 grid gap-4">
            <div className="h-28 w-full skeleton rounded-2xl" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Level + streak + points */}
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              <div className="card p-6 lg:col-span-2">
                <XPBar
                  points={data.pointsBalance}
                  rankName={data.rank.name}
                  nextRankName={data.nextRank?.name}
                  minPoints={data.rank.minPoints}
                  nextMinPoints={data.nextRank?.minPoints}
                />
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <Flame size={16} className="text-amber-500" />
                  {data.streakCount} Day Reporting Streak
                </div>
              </div>
              <div className="card flex flex-col justify-center gap-1 bg-teal p-6 text-white">
                <div className="flex items-center gap-2 text-blue-100">
                  <Award size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Reward Points</span>
                </div>
                <div className="font-display text-4xl font-extrabold leading-none">{data.pointsBalance.toLocaleString()}</div>
                <Link href="/rewards" className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-semibold text-amber hover:underline">
                  Redeem rewards →
                </Link>
              </div>
            </div>

            {/* Impact stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Reported" value={data.impact.reported} icon={Camera} accent="text-teal" chip="bg-teal-dim" />
              <StatCard label="Confirmed by others" value={data.impact.confirmedByOthers} icon={History} accent="text-violet-600" chip="bg-violet-100" />
              <StatCard label="Resolved" value={data.impact.resolved} icon={CheckCircle2} accent="text-emerald-600" chip="bg-emerald-100" />
            </div>

            {/* Badges */}
            <div className="mb-8">
              <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-slate-950">Badges Earned</h2>
              <div className="card p-6">
                <BadgeShelf allBadges={data.allBadges} earnedIds={new Set(data.badges.map((b) => b.id))} />
              </div>
            </div>

            {/* Ledger */}
            <div className="mb-8">
              <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-slate-950">Points Ledger</h2>
              <div className="card overflow-hidden">
                {data.ledger.length === 0 && (
                  <p className="p-6 text-center text-sm text-slate-500">No points yet — submit your first report to start earning!</p>
                )}
                {data.ledger.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 text-sm last:border-b-0">
                    <span className="font-medium capitalize text-slate-700">{e.eventType.replace(/_/g, " ")}</span>
                    <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${e.amount >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {e.amount >= 0 ? "+" : ""}{e.amount} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Reports */}
        <div>
          <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-slate-950">My Submitted Road Reports</h2>
          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="card flex flex-col items-center gap-3 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Camera size={26} />
                </div>
                <p className="text-sm font-semibold text-slate-700">No reports yet</p>
                <p className="max-w-xs text-sm text-slate-500">You haven&apos;t reported anything yet. File your first report to see it here.</p>
                <Link href="/report" className="btn-primary mt-1 px-5 py-2.5 text-sm">
                  <Camera size={16} /> Report an Issue
                </Link>
              </div>
            ) : (
              issues.map((i) => (
                <IssueCard key={i.id} issue={i} damageClass={damageClasses.find((d) => d.id === i.damageClassId)} href={`/issues/${i.id}`} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  chip,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  chip: string;
}) {
  return (
    <div className="card p-5">
      <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${chip}`}>
        <Icon size={20} className={accent} />
      </span>
      <div className="font-display text-3xl font-extrabold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
