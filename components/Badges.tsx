import clsx from "clsx";
import type { PriorityBand, Severity } from "@/domain/types";

const BAND_STYLES: Record<PriorityBand, string> = {
  medium: "bg-amber-100 text-amber-900 border-amber-300",
  high: "bg-orange-100 text-orange-900 border-orange-300",
  critical: "bg-red-100 text-red-900 border-red-300",
};

const SEVERITY_DOT: Record<Severity, string> = {
  low: "bg-blue-500",
  medium: "bg-[#FFC000]",
  high: "bg-red-500",
};

export function PriorityBadge({ band }: { band: PriorityBand }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wide", BAND_STYLES[band])}>
      {band}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex items-center" title={severity}>
      <span className={clsx("inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm", SEVERITY_DOT[severity])} />
    </span>
  );
}

const STATUS_LABELS: Record<string, string> = {
  reported: "Reported",
  ai_verified: "AI Verified",
  authority_notified: "Authority Notified",
  under_review: "Under Review",
  officer_assigned: "Officer Assigned",
  repair_in_progress: "Repair In Progress",
  repair_completed: "Repair Completed",
  verification_pending: "Verification Pending",
  resolved: "Resolved",
  reopened: "Reopened",
};

// Semantic color mapping across the civic resolution workflow.
const STATUS_STYLES: Record<string, string> = {
  reported: "bg-slate-100 text-slate-700 border-slate-200",
  ai_verified: "bg-blue-50 text-blue-700 border-blue-200",
  authority_notified: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
  officer_assigned: "bg-violet-50 text-violet-700 border-violet-200",
  repair_in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  repair_completed: "bg-teal-50 text-teal-700 border-teal-200",
  verification_pending: "bg-amber-50 text-amber-800 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reopened: "bg-red-50 text-red-700 border-red-200",
};

export function StatusPill({ status }: { status: string }) {
  const dotColor: Record<string, string> = {
    reported: "bg-slate-400",
    ai_verified: "bg-blue-500",
    authority_notified: "bg-blue-500",
    under_review: "bg-indigo-500",
    officer_assigned: "bg-violet-500",
    repair_in_progress: "bg-amber-500",
    repair_completed: "bg-teal-500",
    verification_pending: "bg-amber-500",
    resolved: "bg-emerald-500",
    reopened: "bg-red-500",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", dotColor[status] ?? "bg-slate-400")} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
