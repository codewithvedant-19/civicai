import Link from "next/link";
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
      className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:shadow-md hover:border-amber-400"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={issue.imageUrl} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover border border-slate-100" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <SeverityDot severity={issue.severity} />
          <span className="text-sm font-semibold text-slate-900">{damageClass?.label ?? issue.damageClassId}</span>
          <PriorityBadge band={issue.priorityBand} />
          <StatusPill status={issue.status} />
        </div>
        <p className="truncate text-xs text-slate-600 font-medium">{issue.address}</p>
        <div className="mt-1.5 flex gap-3 font-mono text-[11px] text-slate-500">
          <span>Confidence {(issue.aiConfidence * 100).toFixed(0)}%</span>
          <span>{1 + issue.confirmations.length} reporter{issue.confirmations.length ? "s" : ""}</span>
          <span>Score {issue.priorityScore}</span>
        </div>
      </div>
    </Link>
  );
}
