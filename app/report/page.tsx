"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet, apiPost } from "@/lib/apiClient";

interface JurisdictionOption {
  id: string;
  city: string;
  state: string;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

type Result =
  | { kind: "rejected"; message: string; detection: any; provider: string; previewUrl: string }
  | { kind: "created"; issueId: string; detection: any; routedTo: string; isSimulatedRouting: boolean; previewUrl: string }
  | { kind: "merged"; issueId: string; detection: any; previewUrl: string };

export default function ReportPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    apiGet<{ jurisdictions: JurisdictionOption[] }>("/api/public/jurisdictions").then((d) => {
      setJurisdictions(d.jurisdictions);
      if (d.jurisdictions[0]) setSelectedCity(d.jurisdictions[0].id);
    }).catch(() => {});
  }, []);

  function onFile(f: File | null) {
    setFile(f);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  function useDemoCity() {
    const j = jurisdictions.find((x) => x.id === selectedCity);
    if (!j) return;
    const lat = j.bounds.minLat + Math.random() * (j.bounds.maxLat - j.bounds.minLat);
    const lng = j.bounds.minLng + Math.random() * (j.bounds.maxLng - j.bounds.minLng);
    setCoords({ lat, lng });
    setError(null);
  }

  function tryRealGps() {
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your real location — falling back to the demo city instead.");
        useDemoCity();
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  async function submit() {
    if (!file || !coords) {
      setError("Add a photo and capture your location first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("lat", String(coords.lat));
      form.append("lng", String(coords.lng));
      const data = await apiPost<any>("/api/reports", form);
      if (data.rejected) {
        setResult({ kind: "rejected", message: data.message, detection: data.detection, provider: data.provider, previewUrl: preview! });
      } else if (data.merged) {
        setResult({ kind: "merged", issueId: data.issueId, detection: data.detection, previewUrl: preview! });
      } else {
        setResult({
          kind: "created",
          issueId: data.issueId,
          detection: data.detection,
          routedTo: data.routedTo,
          isSimulatedRouting: data.isSimulatedRouting,
          previewUrl: preview!,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-asphalt blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <p className="eyebrow mb-2">Report an Issue</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
            Report Road Damage
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Add a clear photo and your location. Our AI verifies the issue and
            routes it to the right authority instantly.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {error && (
                <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 shadow-sm">
                  <XCircle size={18} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              {/* Step 1 — Photo */}
              <div className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">1</span>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Photo of the issue</h2>
                    <p className="text-xs text-slate-500">Pothole, crack, debris or erosion — a clear, close shot works best.</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-asphalt-line bg-asphalt-surface p-6 text-center">
                  {preview ? (
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="mx-auto max-h-72 rounded-xl object-contain shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        <Camera size={30} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No photo selected yet</p>
                      <p className="max-w-xs text-xs text-slate-500">Upload or capture a clear photo of the road damage.</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="mt-4 flex justify-center">
                    <button onClick={() => fileRef.current?.click()} className="btn-primary px-5 py-2.5 text-sm">
                      <Upload size={16} /> {preview ? "Change Photo" : "Capture / Upload Photo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 — Location */}
              <div className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">2</span>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Location</h2>
                    <p className="text-xs text-slate-500">Select the municipal jurisdiction and set the exact coordinates.</p>
                  </div>
                </div>

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Municipal jurisdiction</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCoords(null);
                  }}
                  className="w-full rounded-xl border border-asphalt-line bg-asphalt-surface px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-light focus:ring-2 focus:ring-teal-light/40"
                >
                  {jurisdictions.map((j) => (
                    <option key={j.id} value={j.id}>{j.city}, {j.state}</option>
                  ))}
                </select>

                {coords && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={16} />
                    Location set — {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={useDemoCity}
                    disabled={!selectedCity}
                    className="btn-ghost flex-1 py-2.5 text-sm disabled:opacity-40"
                  >
                    <MapPin size={16} /> {coords ? "Reset Municipal Coordinates" : "Use Municipal Coordinates"}
                  </button>
                  <button onClick={tryRealGps} className="btn-ghost py-2.5 text-sm">
                    <MapPin size={16} className={locating ? "animate-pulse text-amber-500" : ""} />
                    {locating ? "Locating…" : "Use Device GPS"}
                  </button>
                </div>
              </div>

              {/* Step 3 — Submit */}
              <div className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">3</span>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Submit for verification</h2>
                    <p className="text-xs text-slate-500">We&apos;ll run AI verification and route your report automatically.</p>
                  </div>
                </div>
                <button
                  onClick={submit}
                  disabled={submitting || !file || !coords}
                  className="btn-secondary w-full py-3.5 text-sm disabled:opacity-40"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-amber" /> Running AI verification…
                    </span>
                  ) : (
                    "Submit Report for AI Verification"
                  )}
                </button>
                {(!file || !coords) && (
                  <p className="mt-2.5 text-center text-xs text-slate-400">
                    {!file ? "Add a photo" : ""}
                    {!file && !coords ? " and " : ""}
                    {!coords ? "set your location" : ""} to enable submission.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {result.kind === "rejected" ? (
                <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <XCircle size={24} />
                    <h2 className="font-display text-xl font-bold uppercase tracking-tight">{result.message}</h2>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-4">
                    Confidence {(result.detection.confidence * 100).toFixed(0)}% via {result.provider} — no complaint created.
                  </p>
                  <BoundingBoxOverlay imageUrl={result.previewUrl} box={result.detection.boundingBox} label="low confidence" />
                  <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} className="mt-4 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900">
                    Try another photo
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <CheckCircle2 size={24} />
                    <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                      {result.kind === "merged" ? "Confirmed an existing issue!" : "Report verified & routed!"}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-4">
                    Confidence {(result.detection.confidence * 100).toFixed(0)}% · Severity {result.detection.severity} · Defect: {result.detection.defectType}
                  </p>
                  {result.kind === "created" && (
                    <p className="mb-4 font-mono text-xs text-blue-700 font-semibold bg-blue-50 p-2 rounded-lg border border-blue-100">
                      Routed to: {result.routedTo}{result.isSimulatedRouting ? " (simulated municipal endpoint)" : ""}
                    </p>
                  )}
                  <BoundingBoxOverlay imageUrl={result.previewUrl} box={result.detection.boundingBox} label={result.detection.defectType} />
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => router.push(`/issues/${result.issueId}`)} className="rounded-xl bg-[#FFC000] hover:bg-[#EBB000] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm">
                      View Issue Status
                    </button>
                    <button onClick={() => router.push("/dashboard")} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                      My Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
