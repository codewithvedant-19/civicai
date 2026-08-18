"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MapView, { MapMarker } from "@/components/MapView";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";
import { Layers, MapPin } from "lucide-react";

const COLOR: Record<string, string> = { low: "#2563EB", medium: "#FFC000", high: "#F97316", critical: "#DC2626" };

export default function PublicMapPage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    apiGet("/api/public/stats").then(setStats).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        () => {} // ignore
      );
    }
  }, []);

  if (!stats) {
    return (
      <div className="flex h-screen flex-col bg-[#E7ECF0]">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 font-mono text-sm text-slate-600">
            <span className="h-3 w-3 rounded-full bg-[#FFC000] animate-ping" />
            Loading Live Map data...
          </div>
        </div>
      </div>
    );
  }

  const markers: MapMarker[] = (stats.issues || []).map((i: any) => ({
    id: i.id,
    lat: i.lat,
    lng: i.lng,
    color: COLOR[i.severity] ?? "#64748B",
    popupHtml: `<div style="font-family:sans-serif;font-size:12px;padding:4px">
      <b style="color:#0F172A">${i.damageClassId.replace(/_/g, " ")}</b><br/>
      <span style="color:#475569">${i.address}</span><br/>
      <span style="font-size:11px;color:#1E3A8A">Status: ${i.status.replace(/_/g, " ")}</span><br/>
      <span style="font-size:11px;font-weight:bold">Band: ${i.priorityBand}</span>
    </div>`,
  }));

  const center: [number, number] = userLoc || (markers.length ? [markers[0].lat, markers[0].lng] : [39.78, -89.65]);

  return (
    <div className="flex h-screen flex-col bg-[#E7ECF0] blueprint-bg">
      <Navbar user={user} />
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6 md:flex-row">
        {/* Left Side Info Panel */}
        <div className="md:w-80 md:flex-shrink-0 flex flex-col gap-4 bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#1E3A8A]" />
              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-slate-950">
                Live Road Map
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Aggregated real-time issue telemetry across civil jurisdictions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat label="Total issues" value={stats.totalIssues} highlight="text-slate-900" />
            <MiniStat label="Resolved" value={stats.resolved} highlight="text-emerald-700" />
            <MiniStat label="Critical" value={stats.byBand?.critical ?? 0} highlight="text-red-600" />
            <MiniStat label="High" value={stats.byBand?.high ?? 0} highlight="text-orange-600" />
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Severity Indicator
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
              {Object.entries(COLOR).map(([sev, color]) => (
                <div key={sev} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full shadow-sm" style={{ background: color }} />
                  <span className="capitalize">{sev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="min-h-[450px] flex-1 rounded-2xl overflow-hidden border border-[#CBD5E1] shadow-sm bg-slate-100">
          <MapView markers={markers} center={center} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: number; highlight?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center shadow-sm">
      <div className={`font-mono text-xl font-extrabold ${highlight ?? "text-slate-900"}`}>{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{label}</div>
    </div>
  );
}
