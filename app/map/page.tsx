"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MapView, { MapMarker } from "@/components/MapView";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";

const COLOR: Record<string, string> = { low: "#2FB8A6", medium: "#F5A623", high: "#F97316", critical: "#E14F4F" };

export default function PublicMapPage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiGet("/api/public/stats").then(setStats);
  }, []);

  if (!stats) return null;

  const markers: MapMarker[] = stats.issues.map((i: any) => ({
    id: i.id,
    lat: i.lat,
    lng: i.lng,
    color: COLOR[i.severity] ?? "#8B93A1",
    popupHtml: `<div style="font-family:sans-serif;font-size:12px"><b>${i.damageClassId.replace(/_/g, " ")}</b><br/>${i.address}<br/>Status: ${i.status.replace(/_/g, " ")}<br/>Band: ${i.priorityBand}</div>`,
  }));

  const center: [number, number] = markers.length ? [markers[0].lat, markers[0].lng] : [39.78, -89.65];

  return (
    <div className="flex h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
        <div className="md:w-72 md:flex-shrink-0">
          <h1 className="font-display text-xl font-semibold text-ink">Public Transparency Map</h1>
          <p className="mt-1 text-sm text-ink-muted">Aggregated issue data — no reporter identity shown.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniStat label="Total issues" value={stats.totalIssues} />
            <MiniStat label="Resolved" value={stats.resolved} />
            <MiniStat label="Critical" value={stats.byBand.critical ?? 0} />
            <MiniStat label="High" value={stats.byBand.high ?? 0} />
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
            {Object.entries(COLOR).map(([sev, color]) => (
              <div key={sev} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {sev} severity
              </div>
            ))}
          </div>
        </div>
        <div className="min-h-[400px] flex-1">
          <MapView markers={markers} center={center} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-asphalt-line bg-asphalt-surface p-2.5 text-center">
      <div className="font-mono text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] text-ink-muted">{label}</div>
    </div>
  );
}
