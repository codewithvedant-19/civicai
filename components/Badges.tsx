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
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold uppercase tracking-wide", BAND_STYLES[band])}>
      {band}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span className={clsx("inline-block h-2.5 w-2.5 rounded-full shadow-sm", SEVERITY_DOT[severity])} title={severity} />;
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

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
