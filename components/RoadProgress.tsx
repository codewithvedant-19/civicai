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

export default function RoadProgress({ status }: { status: string }) {
  const idx = Math.max(0, STAGES.findIndex((s) => s.key === status));
  const pct = (idx / (STAGES.length - 1)) * 100;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="relative min-w-[720px] px-2 pt-3">
        {/* Road bed */}
        <div className="relative h-3 rounded-full bg-slate-200 shadow-inner">
          {/* Traveled stretch */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          {/* Dashed lane line, full length */}
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-dash-line text-slate-400" />
          {/* Pin marking current position */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${pct}%` }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-white bg-[#FFC000] shadow-[0_0_0_4px_rgba(255,192,0,0.35)]" />
          </div>
        </div>

        {/* Mile markers */}
        <div className="mt-3 grid" style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}>
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center text-center">
              <span
                className={`mb-1 h-2 w-2 rounded-full ${
                  i <= idx ? "bg-blue-600" : "bg-slate-300"
                }`}
              />
              <span
                className={`whitespace-nowrap font-mono text-[10px] uppercase font-bold tracking-tight ${
                  i === idx ? "text-amber-700 font-extrabold" : i < idx ? "text-slate-700" : "text-slate-400"
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
