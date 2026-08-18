import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Issue, DamageClass } from "@/domain/types";
import { PriorityBadge, SeverityDot, StatusPill } from "@/components/Badges";

export default function IssueCard({
  issue,
  damageClass,
  href,
}: {
  issue: Issue;
  damageClass?: DamageClass;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-3.5 rounded-2xl border border-asphalt-line bg-white p-3.5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={issue.imageUrl || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <SeverityDot severity={issue.severity} />
          <span className="font-display text-sm font-bold text-slate-900">
            {damageClass?.label ?? issue.damageClassId}
          </span>
          <PriorityBadge band={issue.priorityBand} />
        </div>
        <div className="mb-2">
          <StatusPill status={issue.status} />
        </div>
        <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-600">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">{issue.address}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
          <span>Confidence {(issue.aiConfidence * 100).toFixed(0)}%</span>
          <span>{1 + issue.confirmations.length} reporter{issue.confirmations.length ? "s" : ""}</span>
          <span>Score {issue.priorityScore}</span>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-start text-slate-300 transition-colors group-hover:text-amber" />
    </Link>
  );
}
