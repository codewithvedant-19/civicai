"use client";
import { motion } from "framer-motion";

export default function XPBar({
  points,
  rankName,
  nextRankName,
  minPoints,
  nextMinPoints,
}: {
  points: number;
  rankName: string;
  nextRankName?: string;
  minPoints: number;
  nextMinPoints?: number;
}) {
  const pct = nextMinPoints
    ? Math.min(100, Math.max(0, ((points - minPoints) / (nextMinPoints - minPoints)) * 100))
    : 100;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-display text-lg font-bold text-slate-950 uppercase tracking-tight">{rankName}</span>
        <span className="font-mono text-xs font-medium text-slate-600">
          {points} pts{nextRankName ? ` · ${nextMinPoints! - points} to ${nextRankName}` : " · Max rank"}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-amber-400 to-[#FFC000]"
        />
      </div>
    </div>
  );
}
