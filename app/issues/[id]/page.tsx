"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PriorityBadge, SeverityDot, StatusPill } from "@/components/Badges";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import RoadProgress from "@/components/RoadProgress";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { Issue } from "@/domain/types";

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => apiGet<{ issue: Issue }>(`/api/issues/${params.id}`).then((d) => setIssue(d.issue));

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [params.id]);

  if (!issue) return null;

  const isReporter = user?.id === issue.reporterId;
  const canConfirm = user?.role === "citizen" && !isReporter && !issue.confirmations.some((c) => c.userId === user.id);

  async function confirm() {
    try {
      await apiPost(`/api/issues/${issue!.id}/confirm`);
      setMsg("Confirmed! Priority may increase.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  async function reopen() {
    try {
      await apiPost(`/api/issues/${issue!.id}/reopen`);
      setMsg("Flagged as still unresolved.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SeverityDot severity={issue.severity} />
          <h1 className="font-display text-2xl font-semibold text-ink capitalize">{issue.damageClassId.replace(/_/g, " ")}</h1>
          <PriorityBadge band={issue.priorityBand} />
          <StatusPill status={issue.status} />
        </div>
        <p className="text-sm text-ink-muted">{issue.address}</p>
        {issue.routedTo && (
          <p className="mt-1 font-mono text-xs text-ink-faint">Routed to: {issue.routedTo}{issue.isSimulatedRouting ? " (simulated)" : ""}</p>
        )}

        {msg && <p className="mt-3 rounded-lg bg-teal/10 p-2.5 text-sm text-teal">{msg}</p>}

        <div className="mt-5">
          <BoundingBoxOverlay imageUrl={issue.imageUrl} box={issue.boundingBox} label={`${(issue.aiConfidence * 100).toFixed(0)}% confidence`} />
        </div>

        {/* Lifecycle pipeline — the road */}
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Lifecycle</h2>
          <RoadProgress status={issue.status} />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Unique reporters" value={String(1 + issue.confirmations.length)} />
          <Stat label="Priority score" value={String(issue.priorityScore)} />
          <Stat label="AI confidence" value={`${(issue.aiConfidence * 100).toFixed(0)}%`} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {canConfirm && (
            <button onClick={confirm} className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-asphalt hover:bg-amber/90">
              <CheckCircle2 size={15} /> Confirm this issue
            </button>
          )}
          {isReporter && ["resolved", "verification_pending"].includes(issue.status) && (
            <button onClick={reopen} className="flex items-center gap-2 rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger hover:bg-danger/10">
              <AlertTriangle size={15} /> Issue still exists — reopen
            </button>
          )}
        </div>

        {/* Repair evidence */}
        {issue.repairEvidence && (issue.repairEvidence.beforePhotoUrl || issue.repairEvidence.afterPhotoUrl) && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Repair Evidence</h2>
            <div className="grid grid-cols-2 gap-3">
              {issue.repairEvidence.beforePhotoUrl && (
                <div>
                  <p className="mb-1 text-xs text-ink-faint">Before</p>
                  <img src={issue.repairEvidence.beforePhotoUrl} alt="Before" className="rounded-lg" />
                </div>
              )}
              {issue.repairEvidence.afterPhotoUrl && (
                <div>
                  <p className="mb-1 text-xs text-ink-faint">After</p>
                  <img src={issue.repairEvidence.afterPhotoUrl} alt="After" className="rounded-lg" />
                </div>
              )}
            </div>
            {issue.repairEvidence.notes && <p className="mt-2 text-sm text-ink-muted">{issue.repairEvidence.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-3">
      <div className="font-mono text-xl font-semibold text-ink">{value}</div>
      <div className="text-[11px] text-ink-muted">{label}</div>
    </div>
  );
}
