"use client";
import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
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
    apiGet<{ leaderboard: Entry[] }>(`/api/leaderboard?scope=${scope}`).then((d) => setEntries(d.leaderboard)).catch(() => {});
  }, [scope]);

  const myRank = entries.find((e) => e.userId === user?.id);

  return (
    <div className="min-h-screen bg-[#E7ECF0] blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFC000] text-slate-900 rounded-xl shadow-sm">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-950">
                Civic Leaderboard
              </h1>
              <p className="text-xs text-slate-600 font-medium">Top community reporters improving local infrastructure</p>
            </div>
          </div>

          <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300">
            {(["week", "month", "all_time"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-lg px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  scope === s
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-sm">
          {entries.map((e, idx) => (
            <div
              key={e.userId}
              className={`flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0 transition-colors ${
                e.userId === user?.id ? "bg-amber-50/80" : "hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black ${
                  idx === 0 ? "bg-amber-400 text-slate-950 shadow-sm" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700/20 text-amber-900" : "bg-slate-100 text-slate-600"
                }`}>
                  #{e.rank}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{e.name}</div>
                  <div className="text-xs text-slate-500 font-mono font-medium">{e.rankName}</div>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {e.points} pts
              </span>
            </div>
          ))}
        </div>

        {myRank && myRank.rank > 10 && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900 shadow-sm">
            You're #{myRank.rank} with {myRank.points} points — keep reporting to climb the leaderboard!
          </div>
        )}
      </div>
    </div>
  );
}
