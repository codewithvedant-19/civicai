"use client";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";

interface Entry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  rankName: string;
}

export default function LeaderboardPage() {
  const { user } = useCurrentUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scope, setScope] = useState<"all_time" | "week" | "month">("all_time");

  useEffect(() => {
    apiGet<{ leaderboard: Entry[] }>(`/api/leaderboard?scope=${scope}`).then((d) => setEntries(d.leaderboard));
  }, [scope]);

  const myRank = entries.find((e) => e.userId === user?.id);

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Trophy className="text-amber" size={22} />
          <h1 className="font-display text-2xl font-semibold text-ink">City Leaderboard</h1>
        </div>

        <div className="mb-5 flex gap-2">
          {(["week", "month", "all_time"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-full border px-3 py-1 text-xs ${scope === s ? "border-amber bg-amber/10 text-amber" : "border-asphalt-line text-ink-muted"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        {scope !== "all_time" && (
          <p className="mb-3 text-xs text-ink-faint">Prototype note: weekly/monthly scoping reuses the all-time ledger for this demo.</p>
        )}

        <div className="overflow-hidden rounded-xl border border-asphalt-line">
          {entries.map((e) => (
            <div
              key={e.userId}
              className={`flex items-center justify-between border-b border-asphalt-line px-4 py-3 last:border-b-0 ${
                e.userId === user?.id ? "bg-amber/10" : "bg-asphalt-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono text-sm text-ink-faint">#{e.rank}</span>
                <div>
                  <div className="text-sm font-medium text-ink">{e.name}</div>
                  <div className="text-xs text-ink-muted">{e.rankName}</div>
                </div>
              </div>
              <span className="font-mono text-sm text-teal">{e.points} pts</span>
            </div>
          ))}
        </div>

        {myRank && myRank.rank > 10 && (
          <div className="mt-3 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
            You're #{myRank.rank} with {myRank.points} points — keep reporting!
          </div>
        )}
      </div>
    </div>
  );
}
