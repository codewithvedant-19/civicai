"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Camera } from "lucide-react";
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
    apiGet<PointsData>("/api/points-history").then(setData);
    apiGet<{ issues: Issue[] }>("/api/issues?mine=true").then((d) => setIssues(d.issues));
    apiGet<{ damageClasses: DamageClass[] }>("/api/public/stats").then((d) => setDamageClasses(d.damageClasses));
  }, [user]);

  if (loading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-ink-muted">Here's your civic impact so far.</p>
          </div>
          <Link href="/report" className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-medium text-asphalt hover:bg-amber/90">
            <Camera size={15} /> Report New Issue
          </Link>
        </div>

        {data && (
          <>
            <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-5">
              <XPBar
                points={data.pointsBalance}
                rankName={data.rank.name}
                nextRankName={data.nextRank?.name}
                minPoints={data.rank.minPoints}
                nextMinPoints={data.nextRank?.minPoints}
              />
              <div className="mt-4 flex items-center gap-2 text-sm text-amber">
                <Flame size={16} />
                {data.streakCount} day streak
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <StatCard label="Reported" value={data.impact.reported} />
              <StatCard label="Confirmed by others" value={data.impact.confirmedByOthers} />
              <StatCard label="Resolved" value={data.impact.resolved} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Badges</h2>
              <BadgeShelf allBadges={data.allBadges} earnedIds={new Set(data.badges.map((b) => b.id))} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">My Points History</h2>
              <div className="overflow-hidden rounded-xl border border-asphalt-line">
                {data.ledger.length === 0 && <p className="p-4 text-sm text-ink-muted">No points yet — submit your first report!</p>}
                {data.ledger.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b border-asphalt-line bg-asphalt-surface px-4 py-2.5 last:border-b-0">
                    <span className="text-sm text-ink">{e.eventType.replace(/_/g, " ")}</span>
                    <span className={`font-mono text-sm ${e.amount >= 0 ? "text-teal" : "text-danger"}`}>{e.amount >= 0 ? "+" : ""}{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">My Reports</h2>
          <div className="space-y-3">
            {issues.length === 0 && <p className="text-sm text-ink-muted">You haven't reported anything yet.</p>}
            {issues.map((i) => (
              <IssueCard key={i.id} issue={i} damageClass={damageClasses.find((d) => d.id === i.damageClassId)} href={`/issues/${i.id}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4">
      <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}
