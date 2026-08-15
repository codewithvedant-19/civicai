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
        <span className="font-display text-lg font-semibold text-ink">{rankName}</span>
        <span className="font-mono text-xs text-ink-muted">
          {points} pts{nextRankName ? ` · ${nextMinPoints! - points} to ${nextRankName}` : " · Max rank"}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-asphalt-surface">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-teal to-amber"
        />
      </div>
    </div>
  );
}
