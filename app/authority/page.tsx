"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import MapView, { MapMarker } from "@/components/MapView";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { Issue, DamageClass } from "@/domain/types";

const COLOR: Record<string, string> = { low: "#2FB8A6", medium: "#F5A623", high: "#F97316", critical: "#E14F4F" };

export default function AuthorityDashboard() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [damageClasses, setDamageClasses] = useState<DamageClass[]>([]);
  const [officers, setOfficers] = useState<{ userId: string; name: string; assignedCount: number }[]>([]);
  const [view, setView] = useState<"queue" | "map" | "analytics">("queue");

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  function load() {
    apiGet<{ issues: Issue[] }>(`/api/issues?authorityId=${user!.authorityId ?? ""}`).then((d) => setIssues(d.issues));
    apiGet<{ damageClasses: DamageClass[] }>("/api/public/stats").then((d) => setDamageClasses(d.damageClasses));
    apiGet<{ officers: any[] }>("/api/authority/officers").then((d) => setOfficers(d.officers));
  }

  async function assign(issueId: string, officerId: string) {
    await apiPost(`/api/issues/${issueId}/assign`, { officerId });
    load();
  }

  async function advanceStatus(issueId: string, status: string) {
    await fetch(`/api/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return null;
  if (!user || !["officer", "authority_admin", "super_admin"].includes(user.role)) {
    router.push("/login");
    return null;
  }

  const active = issues.filter((i) => !["resolved"].includes(i.status));
  const critical = issues.filter((i) => i.priorityBand === "critical" && i.status !== "resolved");
  const resolved = issues.filter((i) => i.status === "resolved");
  const sorted = [...issues].sort((a, b) => b.priorityScore - a.priorityScore);

  const severityData = ["low", "medium", "high"].map((s) => ({ name: s, count: issues.filter((i) => i.severity === s).length }));
  const bandData = ["medium", "high", "critical"].map((b) => ({ name: b, value: issues.filter((i) => i.priorityBand === b).length }));

  const markers: MapMarker[] = issues.map((i) => ({
    id: i.id,
    lat: i.lat,
    lng: i.lng,
    color: COLOR[i.severity] ?? "#8B93A1",
    popupHtml: `<b>${i.damageClassId}</b><br/>${i.address}<br/>${i.status}`,
  }));

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Authority Dashboard</h1>
        <p className="text-sm text-ink-muted">Logged in as {user.role.replace("_", " ")} — {user.name}</p>

        {critical.length > 0 && (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            🚨 {critical.length} issue{critical.length > 1 ? "s" : ""} at Critical priority requiring immediate attention.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={issues.length} />
          <Stat label="Active" value={active.length} />
          <Stat label="Critical" value={critical.length} />
          <Stat label="Resolved" value={resolved.length} />
        </div>

        <div className="mt-6 flex gap-2">
          {(["queue", "map", "analytics"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${view === v ? "border-amber bg-amber/10 text-amber" : "border-asphalt-line text-ink-muted"}`}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "queue" && (
          <div className="mt-5 space-y-3">
            {sorted.length === 0 && <p className="text-sm text-ink-muted">No issues yet.</p>}
            {sorted.map((issue) => (
              <div key={issue.id} className="space-y-2">
                <IssueCard issue={issue} damageClass={damageClasses.find((d) => d.id === issue.damageClassId)} href={`/issues/${issue.id}`} />
                {user.role !== "officer" && officers.length > 0 && !issue.assignedOfficerId && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    {officers.map((o) => (
                      <button key={o.userId} onClick={() => assign(issue.id, o.userId)} className="rounded-full border border-asphalt-line px-3 py-1 text-xs text-ink-muted hover:border-teal/50 hover:text-teal">
                        Assign to {o.name}
                      </button>
                    ))}
                  </div>
                )}
                {issue.assignedOfficerId === user.id && issue.status !== "resolved" && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    <NextStatusButtons issue={issue} onAdvance={advanceStatus} />
                    {["repair_in_progress", "repair_completed"].includes(issue.status) && (
                      <RepairUploadButton issueId={issue.id} onDone={load} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "map" && (
          <div className="mt-5 h-[500px]">
            <MapView markers={markers} center={markers[0] ? [markers[0].lat, markers[0].lng] : [39.78, -89.65]} />
          </div>
        )}

        {view === "analytics" && (
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4">
              <h3 className="mb-3 text-sm font-medium text-ink-muted">Severity distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={severityData}>
                  <XAxis dataKey="name" stroke="#8B93A1" fontSize={12} />
                  <YAxis stroke="#8B93A1" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1B1F27", border: "1px solid #262B35" }} />
                  <Bar dataKey="count" fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4">
              <h3 className="mb-3 text-sm font-medium text-ink-muted">Priority bands</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={bandData} dataKey="value" nameKey="name" outerRadius={80}>
                    {bandData.map((d) => (
                      <Cell key={d.name} fill={COLOR[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1B1F27", border: "1px solid #262B35" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4 text-center">
      <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

const NEXT_STATUS: Record<string, string> = {
  officer_assigned: "repair_in_progress",
  repair_in_progress: "repair_completed",
  repair_completed: "verification_pending",
  verification_pending: "resolved",
  under_review: "officer_assigned",
  authority_notified: "under_review",
};

function NextStatusButtons({ issue, onAdvance }: { issue: Issue; onAdvance: (id: string, status: string) => void }) {
  const next = NEXT_STATUS[issue.status];
  if (!next) return null;
  return (
    <button onClick={() => onAdvance(issue.id, next)} className="rounded-full bg-teal/15 px-3 py-1 text-xs text-teal hover:bg-teal/25">
      Move to {next.replace(/_/g, " ")}
    </button>
  );
}

function RepairUploadButton({ issueId, onDone }: { issueId: string; onDone: () => void }) {
  async function upload(e: React.ChangeEvent<HTMLInputElement>, kind: "before" | "after") {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append(kind, f);
    await apiPost(`/api/issues/${issueId}/repair`, form);
    onDone();
  }
  return (
    <div className="flex gap-2">
      <label className="cursor-pointer rounded-full border border-asphalt-line px-3 py-1 text-xs text-ink-muted hover:text-amber">
        Upload before photo
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "before")} />
      </label>
      <label className="cursor-pointer rounded-full border border-asphalt-line px-3 py-1 text-xs text-ink-muted hover:text-amber">
        Upload after photo
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "after")} />
      </label>
    </div>
  );
}
