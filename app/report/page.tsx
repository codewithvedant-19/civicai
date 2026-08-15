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
    });
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
    <div>
      <Navbar user={user} />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink">Report Road Damage</h1>
        <p className="mt-1 text-sm text-ink-muted">Take or upload a photo. Our AI pipeline verifies it before a complaint is created.</p>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-5">
              {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}

              <div className="rounded-xl border border-dashed border-asphalt-line bg-asphalt-surface p-6 text-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto max-h-72 rounded-lg object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ink-muted">
                    <Camera size={30} />
                    <p className="text-sm">No photo selected</p>
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
                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-asphalt hover:bg-amber/90">
                    <Upload size={15} /> {preview ? "Change Photo" : "Capture / Upload Photo"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-ink-faint">
                  Demo tip: filenames containing "pothole" or "road" verify reliably; filenames like "cat" or "random" are reliably rejected.
                </p>
              </div>

              <div className="rounded-xl border border-asphalt-line bg-asphalt-surface p-4">
                <label className="mb-1.5 block text-xs text-ink-muted">
                  Demo location (guarantees a jurisdiction match — real GPS from your browser won't fall inside this prototype's seeded demo cities)
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCoords(null);
                  }}
                  className="w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-sm text-ink outline-none focus:border-amber/50"
                >
                  {jurisdictions.map((j) => (
                    <option key={j.id} value={j.id}>{j.city}, {j.state}</option>
                  ))}
                </select>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={useDemoCity}
                    disabled={!selectedCity}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal/40 bg-teal/10 py-2.5 text-sm text-teal hover:bg-teal/15 disabled:opacity-40"
                  >
                    <MapPin size={15} /> {coords ? `Location set (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : "Use Demo Location"}
                  </button>
                  <button
                    onClick={tryRealGps}
                    className="flex items-center justify-center gap-2 rounded-lg border border-asphalt-line px-3 py-2.5 text-xs text-ink-faint hover:border-ink-muted/50"
                  >
                    <MapPin size={13} className={locating ? "animate-pulse" : ""} />
                    {locating ? "Locating…" : "Try my real GPS instead"}
                  </button>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={submitting || !file || !coords}
                className="w-full rounded-lg bg-teal py-3 font-medium text-asphalt hover:bg-teal/90 disabled:opacity-40"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Running AI verification…</span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              {result.kind === "rejected" ? (
                <div className="rounded-xl border border-danger/30 bg-danger/10 p-5">
                  <div className="flex items-center gap-2 text-danger">
                    <XCircle size={20} />
                    <h2 className="font-display text-lg font-semibold">{result.message}</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    Confidence {(result.detection.confidence * 100).toFixed(0)}% via {result.provider} — no complaint created, no points awarded.
                  </p>
                  <div className="mt-4">
                    <BoundingBoxOverlay imageUrl={result.previewUrl} box={result.detection.boundingBox} label="low confidence" />
                  </div>
                  <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} className="mt-4 rounded-lg bg-asphalt-surface px-4 py-2 text-sm text-ink hover:text-amber">
                    Try another photo
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-teal/30 bg-teal/10 p-5">
                  <div className="flex items-center gap-2 text-teal">
                    <CheckCircle2 size={20} />
                    <h2 className="font-display text-lg font-semibold">
                      {result.kind === "merged" ? "Confirmed an existing issue!" : "Report verified & routed!"}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    Confidence {(result.detection.confidence * 100).toFixed(0)}% · Severity {result.detection.severity} · Defect: {result.detection.defectType}
                  </p>
                  {result.kind === "created" && (
                    <p className="mt-1 font-mono text-xs text-ink-faint">Routed to: {result.routedTo}{result.isSimulatedRouting ? " (simulated)" : ""}</p>
                  )}
                  <div className="mt-4">
                    <BoundingBoxOverlay imageUrl={result.previewUrl} box={result.detection.boundingBox} label={result.detection.defectType} />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => router.push(`/issues/${result.issueId}`)} className="rounded-lg bg-amber px-4 py-2 text-sm font-medium text-asphalt hover:bg-amber/90">
                      View Issue
                    </button>
                    <button onClick={() => router.push("/dashboard")} className="rounded-lg bg-asphalt-surface px-4 py-2 text-sm text-ink hover:text-amber">
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
