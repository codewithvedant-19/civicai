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
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition",
              earned ? "border-amber/40 bg-amber/10" : "border-asphalt-line bg-asphalt-surface opacity-40"
            )}
          >
            <Icon size={26} className={earned ? "text-amber" : "text-ink-faint"} />
            <span className="text-xs font-medium text-ink">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}
