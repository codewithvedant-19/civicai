"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Settings as SettingsIcon, Users as UsersIcon, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";
import type { Settings, PublicUser, Authority, AuditLogEntry } from "@/domain/types";

export default function AdminPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<Record<string, string> | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    apiGet<{ settings: Settings; activeProviders: any }>("/api/admin/config").then((d) => {
      setSettings(d.settings);
      setProviders(d.activeProviders);
    }).catch(() => {});
    apiGet<{ users: PublicUser[]; authorities: Authority[]; auditLogs: AuditLogEntry[] }>("/api/admin/users").then((d) => {
      setUsers(d.users);
      setAuthorities(d.authorities);
      setLogs(d.auditLogs);
    }).catch(() => {});
  }

  useEffect(() => {
    if (user?.role === "super_admin") load();
  }, [user]);

  async function saveSettings() {
    if (!settings) return;
    await apiPatch("/api/admin/config", settings);
    setMsg("Settings updated — thresholds now take effect immediately.");
    load();
  }

  async function setRole(userId: string, role: string, authorityId?: string) {
    await apiPost("/api/admin/users", { userId, role, authorityId });
    setMsg("Role updated successfully.");
    load();
  }

  if (loading) return null;
  if (!user || user.role !== "super_admin") {
    router.push("/login");
    return null;
  }
  if (!settings) return null;

  return (
    <div className="min-h-screen bg-asphalt blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-white shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="eyebrow mb-1">Administration</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">Super Admin Console</h1>
            <p className="mt-1 text-sm text-slate-600">System configuration, AI confidence thresholds, and user roles.</p>
          </div>
        </div>

        {msg && <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800">{msg}</p>}

        {/* Active providers */}
        {providers && (
          <section className="card mb-8 p-6">
            <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Integration Providers
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(providers).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-asphalt-line bg-asphalt-surface p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</div>
                  <div className="mt-1 font-mono text-xs font-bold text-teal">{v}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Thresholds */}
        <section className="card mb-8 p-6">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Configurable Thresholds</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField
              label="AI confidence threshold (0.0 - 1.0)"
              value={settings.aiConfidenceThreshold}
              step={0.05}
              onChange={(v) => setSettings({ ...settings, aiConfidenceThreshold: v })}
            />
            <NumField
              label="Rate limit (reports/hour)"
              value={settings.rateLimitReportsPerHour}
              onChange={(v) => setSettings({ ...settings, rateLimitReportsPerHour: v })}
            />
            <NumField
              label="High priority reporter count"
              value={settings.priorityThresholds.highReporterCount}
              onChange={(v) => setSettings({ ...settings, priorityThresholds: { ...settings.priorityThresholds, highReporterCount: v } })}
            />
            <NumField
              label="Critical priority reporter count"
              value={settings.priorityThresholds.criticalReporterCount}
              onChange={(v) => setSettings({ ...settings, priorityThresholds: { ...settings.priorityThresholds, criticalReporterCount: v } })}
            />
          </div>
          <button onClick={saveSettings} className="btn-primary mt-5 px-5 py-2.5 text-sm">
            Save thresholds
          </button>
        </section>

        {/* User / role management */}
        <section className="card mb-8 p-6">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Users &amp; Roles</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-asphalt-line bg-asphalt-surface p-3.5">
                <div>
                  <div className="text-sm font-bold text-slate-900">{u.name} <span className="font-mono text-xs text-slate-500">· {u.email}</span></div>
                  <div className="text-xs font-medium text-slate-600">Role: <span className="font-semibold uppercase text-teal">{u.role.replace(/_/g, " ")}</span></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(["citizen", "officer", "authority_admin", "super_admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(u.id, r, authorities[0]?.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                        u.role === r
                          ? "bg-teal text-white shadow-sm"
                          : "border border-asphalt-line bg-white text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {r.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audit log */}
        <section className="card p-6">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-950">Audit Log</h2>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {logs.length === 0 && <p className="text-sm text-slate-500">No actions logged yet.</p>}
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between rounded-lg border border-slate-100 bg-asphalt-surface p-2.5 text-xs font-medium text-slate-700">
                <span>{l.action}: {l.details}</span>
                <span className="font-mono text-[11px] text-slate-400">{new Date(l.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function NumField({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1.5 w-full rounded-xl border border-asphalt-line bg-asphalt-surface px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-light focus:ring-2 focus:ring-teal-light/40"
      />
    </label>
  );
}
