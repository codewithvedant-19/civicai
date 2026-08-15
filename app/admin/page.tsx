"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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
    });
    apiGet<{ users: PublicUser[]; authorities: Authority[]; auditLogs: AuditLogEntry[] }>("/api/admin/users").then((d) => {
      setUsers(d.users);
      setAuthorities(d.authorities);
      setLogs(d.auditLogs);
    });
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
    setMsg("Role updated.");
    load();
  }

  if (loading) return null;
  if (!user || user.role !== "super_admin") {
    router.push("/login");
    return null;
  }
  if (!settings) return null;

  return (
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="text-amber" size={22} />
          <h1 className="font-display text-2xl font-semibold text-ink">Super Admin Console</h1>
        </div>
        {msg && <p className="mb-4 rounded-lg bg-teal/10 p-2.5 text-sm text-teal">{msg}</p>}

        {/* Active providers */}
        {providers && (
          <section className="mb-8 rounded-xl border border-asphalt-line bg-asphalt-surface p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Active Integration Providers
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(providers).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-asphalt-line p-3">
                  <div className="text-xs uppercase text-ink-faint">{k}</div>
                  <div className="mt-1 font-mono text-xs text-teal">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink-faint">
              Each of these is a single swappable file behind a shared interface (Section 3 of the build spec).
            </p>
          </section>
        )}

        {/* Thresholds */}
        <section className="mb-8 rounded-xl border border-asphalt-line bg-asphalt-surface p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Configurable Thresholds</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField
              label="AI confidence threshold"
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
          <button onClick={saveSettings} className="mt-4 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-asphalt hover:bg-amber/90">
            Save thresholds
          </button>
        </section>

        {/* User / role management */}
        <section className="mb-8 rounded-xl border border-asphalt-line bg-asphalt-surface p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Users &amp; Roles</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-asphalt-line p-2.5">
                <div>
                  <div className="text-sm text-ink">{u.name} <span className="text-ink-faint">· {u.email}</span></div>
                  <div className="text-xs text-ink-muted">Current role: {u.role.replace("_", " ")}</div>
                </div>
                <div className="flex gap-2">
                  {(["citizen", "officer", "authority_admin", "super_admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(u.id, r, authorities[0]?.id)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] ${u.role === r ? "border-amber bg-amber/10 text-amber" : "border-asphalt-line text-ink-muted"}`}
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
        <section className="rounded-xl border border-asphalt-line bg-asphalt-surface p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Audit Log</h2>
          <div className="space-y-1.5">
            {logs.length === 0 && <p className="text-sm text-ink-muted">No actions logged yet.</p>}
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between text-xs text-ink-muted">
                <span>{l.action}: {l.details}</span>
                <span className="font-mono text-ink-faint">{new Date(l.createdAt).toLocaleString()}</span>
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
    <label className="block text-sm text-ink-muted">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50"
      />
    </label>
  );
}
