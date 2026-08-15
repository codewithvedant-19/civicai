import clsx from "clsx";
import type { PriorityBand, Severity } from "@/domain/types";

const BAND_STYLES: Record<PriorityBand, string> = {
  medium: "bg-amber/15 text-amber border-amber/40",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  critical: "bg-danger/15 text-danger border-danger/40",
};

const SEVERITY_DOT: Record<Severity, string> = {
  low: "bg-teal",
  medium: "bg-amber",
  high: "bg-danger",
};

export function PriorityBadge({ band }: { band: PriorityBand }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono uppercase tracking-wide", BAND_STYLES[band])}>
      {band}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span className={clsx("inline-block h-2.5 w-2.5 rounded-full", SEVERITY_DOT[severity])} title={severity} />;
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
    <span className="inline-flex items-center rounded-full border border-asphalt-line bg-asphalt-surface px-2.5 py-0.5 text-xs text-ink-muted">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
