const STAGES = [
  { key: "reported", label: "Reported" },
  { key: "ai_verified", label: "AI Verified" },
  { key: "authority_notified", label: "Authority Notified" },
  { key: "under_review", label: "Under Review" },
  { key: "officer_assigned", label: "Officer Assigned" },
  { key: "repair_in_progress", label: "Repair In Progress" },
  { key: "repair_completed", label: "Repair Completed" },
  { key: "verification_pending", label: "Verification Pending" },
  { key: "resolved", label: "Resolved" },
];

/**
 * The one bespoke visual signature of this app: an issue's lifecycle
 * rendered as a literal stretch of road. A route-blue strip fills in behind
 * a safety-yellow "pin" as the issue advances; a dashed lane line runs the
 * full length; unreached mile markers sit dim ahead on the asphalt.
 */
export default function RoadProgress({ status }: { status: string }) {
  const idx = Math.max(0, STAGES.findIndex((s) => s.key === status));
  const pct = (idx / (STAGES.length - 1)) * 100;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="relative min-w-[720px] px-2 pt-3">
        {/* Road bed */}
        <div className="relative h-3 rounded-full bg-asphalt-surface">
          {/* Traveled stretch */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-teal/70 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          {/* Dashed lane line, full length */}
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-dash-line text-ink-faint/60" />
          {/* Pin marking current position */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${pct}%` }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-asphalt bg-amber shadow-[0_0_0_4px_rgba(245,183,0,0.18)]" />
          </div>
        </div>

        {/* Mile markers */}
        <div className="mt-3 grid" style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}>
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center text-center">
              <span
                className={`mb-1 h-1.5 w-1.5 rounded-full ${
                  i <= idx ? "bg-teal" : "bg-asphalt-line"
                }`}
              />
              <span
                className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-wide ${
                  i === idx ? "text-amber" : i < idx ? "text-ink-muted" : "text-ink-faint"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
