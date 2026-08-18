"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, MapPin, Building2, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PriorityBadge, SeverityDot, StatusPill } from "@/components/Badges";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import RoadProgress from "@/components/RoadProgress";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { MockSanitationData, SANITATION_CLASSES } from "@/lib/mockSanitationData";
import type { Issue } from "@/domain/types";

export default function SanitationIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    const found = MockSanitationData.getIssue(params.id);
    if (found) setIssue(found);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [params.id]);

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#E7ECF0]">
        <Navbar user={user} />
        <div className="flex justify-center items-center py-20">
          <div className="font-mono text-sm text-slate-600">Loading sanitation issue details...</div>
        </div>
      </div>
    );
  }

  const isReporter = user?.id === issue.reporterId;
  const canConfirm = user?.role === "citizen" && !isReporter && !issue.confirmations.some((c) => c.userId === user?.id);

  // MOCK: simulate confirmation
  function confirm() {
    if (!user || !issue) return;
    try {
      const all = MockSanitationData.getIssues();
      const idx = all.findIndex(i => i.id === issue.id);
      if (idx !== -1) {
        all[idx].confirmations.push({ userId: user.id, createdAt: new Date().toISOString() });
        all[idx].priorityScore += 10;
        localStorage.setItem("civic_sanitation_issues", JSON.stringify(all));
      }
      setMsg("Confirmed! Issue priority increased.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  // MOCK: simulate reopen
  function reopen() {
    if (!issue) return;
    try {
      const all = MockSanitationData.getIssues();
      const idx = all.findIndex(i => i.id === issue.id);
      if (idx !== -1) {
        all[idx].status = "reopened";
        localStorage.setItem("civic_sanitation_issues", JSON.stringify(all));
      }
      setMsg("Flagged as still unresolved.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  const damageClassLabel = SANITATION_CLASSES.find(c => c.id === issue.damageClassId)?.label || issue.damageClassId.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-[#E7ECF0] blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#CBD5E1] shadow-sm mb-6">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <SeverityDot severity={issue.severity} />
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-950 capitalize">
              {damageClassLabel}
            </h1>
            <PriorityBadge band={issue.priorityBand} />
            <StatusPill status={issue.status} />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <MapPin size={16} className="text-slate-400" />
            <span>{issue.address}</span>
          </div>
          
          {issue.routedTo && (
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
              <Building2 size={14} />
              <span>Routed to: {issue.routedTo}{issue.isSimulatedRouting ? " (simulated department)" : ""}</span>
            </div>
          )}

          {msg && <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">{msg}</p>}

          <div className="mt-6">
            <BoundingBoxOverlay imageUrl={issue.imageUrl} box={issue.boundingBox} label={`${(issue.aiConfidence * 100).toFixed(0)}% confidence`} />
          </div>

          {/* Lifecycle pipeline - Re-using RoadProgress as the workflow is identical */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-500">Lifecycle Progress</h2>
            <RoadProgress status={issue.status} />
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <Stat label="Reporters" value={String(1 + issue.confirmations.length)} />
            <Stat label="Priority Score" value={String(issue.priorityScore)} />
            <Stat label="AI Confidence" value={`${(issue.aiConfidence * 100).toFixed(0)}%`} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {canConfirm && (
              <button
                onClick={confirm}
                className="flex items-center gap-2 rounded-xl bg-[#FFC000] hover:bg-[#EBB000] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all"
              >
                <CheckCircle2 size={16} /> Confirm this issue (+points)
              </button>
            )}
            {isReporter && ["resolved", "verification_pending"].includes(issue.status) && (
              <button
                onClick={reopen}
                className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-100 transition-all"
              >
                <AlertTriangle size={16} /> Issue still exists — reopen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm">
      <div className="font-mono text-2xl font-black text-slate-950">{value}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{label}</div>
    </div>
  );
}
