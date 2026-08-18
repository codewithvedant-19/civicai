"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Building2, AlertOctagon, Upload, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import MapView, { MapMarker } from "@/components/MapView";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { Issue, DamageClass } from "@/domain/types";

const COLOR: Record<string, string> = { low: "#2563EB", medium: "#FFC000", high: "#F97316", critical: "#DC2626" };

export default function AuthorityDashboard() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [damageClasses, setDamageClasses] = useState<DamageClass[]>([]);
  const [officers, setOfficers] = useState<{ userId: string; name: string; assignedCount: number }[]>([]);
  const [view, setView] = useState<"queue" | "map" | "analytics">("queue");
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  function load() {
    apiGet<{ issues: Issue[] }>(`/api/issues?authorityId=${user!.authorityId ?? ""}`).then((d) => setIssues(d.issues)).catch(() => {});
    apiGet<{ damageClasses: DamageClass[] }>("/api/public/stats").then((d) => setDamageClasses(d.damageClasses)).catch(() => {});
    apiGet<{ officers: any[] }>("/api/authority/officers").then((d) => setOfficers(d.officers)).catch(() => {});
    if (navigator.geolocation && !userLoc) {
      navigator.geolocation.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]), () => {});
    }
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
    color: COLOR[i.severity] ?? "#64748B",
    popupHtml: `<b>${i.damageClassId}</b><br/>${i.address}<br/>${i.status}`,
  }));

  return (
    <div className="min-h-screen bg-asphalt blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-white shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <p className="eyebrow mb-1">Authority Portal</p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">Dispatch Console</h1>
              <p className="mt-1 text-sm capitalize text-slate-600">{user.role.replace(/_/g, " ")} — {user.name}</p>
            </div>
          </div>

          <div className="flex rounded-xl border border-asphalt-line bg-white p-1 shadow-sm">
            {(["queue", "map", "analytics"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                  view === v ? "bg-teal text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {critical.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
            <AlertOctagon size={20} className="shrink-0 text-red-600" />
            <span>{critical.length} critical issue{critical.length > 1 ? "s" : ""} requiring urgent municipal dispatch.</span>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total Complaints" value={issues.length} />
          <Stat label="Active Queue" value={active.length} highlight="text-blue-700" />
          <Stat label="Critical Band" value={critical.length} highlight="text-red-600" />
          <Stat label="Resolved Repaired" value={resolved.length} highlight="text-emerald-700" />
        </div>

        {view === "queue" && (
          <div className="space-y-4">
            {sorted.length === 0 && (
              <div className="card flex flex-col items-center gap-3 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={26} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Dispatch queue is clear</p>
                <p className="max-w-xs text-sm text-slate-500">No issues are waiting for action right now.</p>
              </div>
            )}
            {sorted.map((issue) => (
              <div key={issue.id} className="space-y-2">
                <IssueCard issue={issue} damageClass={damageClasses.find((d) => d.id === issue.damageClassId)} href={`/issues/${issue.id}`} />
                {user.role !== "officer" && officers.length > 0 && !issue.assignedOfficerId && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    {officers.map((o) => (
                      <button
                        key={o.userId}
                        onClick={() => assign(issue.id, o.userId)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                      >
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
          <div className="card h-[520px] overflow-hidden">
            <MapView markers={markers} center={userLoc || (markers[0] ? [markers[0].lat, markers[0].lng] : [39.78, -89.65])} />
          </div>
        )}

        {view === "analytics" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={severityData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#FFC000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-6">
              <h3 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Priority Bands</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={bandData} dataKey="value" nameKey="name" outerRadius={85}>
                    {bandData.map((d) => (
                      <Cell key={d.name} fill={COLOR[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: string }) {
  return (
    <div className="card p-5 text-center">
      <div className={`font-display text-3xl font-extrabold ${highlight ?? "text-slate-950"}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
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
    <button
      onClick={() => onAdvance(issue.id, next)}
      className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase text-blue-700 hover:bg-blue-100"
    >
      Advance to {next.replace(/_/g, " ")}
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
      <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        Upload Before Photo
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "before")} />
      </label>
      <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        Upload After Photo
        <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "after")} />
      </label>
    </div>
  );
}
