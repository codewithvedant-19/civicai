import clsx from "clsx";
import type { Badge } from "@/domain/types";
import { Flag, Flame, BadgeCheck, Siren, CheckCircle, Award } from "lucide-react";

const ICONS: Record<string, any> = {
  flag: Flag,
  flame: Flame,
  "badge-check": BadgeCheck,
  siren: Siren,
  "check-circle": CheckCircle,
};

export default function BadgeShelf({ allBadges, earnedIds }: { allBadges: Badge[]; earnedIds: Set<string> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {allBadges.map((b) => {
        const Icon = ICONS[b.icon] ?? Award;
        const earned = earnedIds.has(b.id);
        return (
          <div
            key={b.id}
            title={b.description}
            className={clsx(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all shadow-sm",
              earned
                ? "border-amber-400 bg-amber-50/80 text-slate-900 font-medium"
                : "border-slate-200 bg-slate-50/50 opacity-50 text-slate-400"
            )}
          >
            <div className={clsx("p-2 rounded-full", earned ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-400")}>
              <Icon size={24} />
            </div>
            <span className="text-xs font-semibold">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}
