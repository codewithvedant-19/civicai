"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";
import { MockElectricityData, ELECTRICITY_CLASSES } from "@/lib/mockElectricityData";

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

export default function ElectricityReportPage() {
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
    if (!file || !coords || !user) {
      setError("Add a photo and capture your location first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    
    // Simulate API request and AI Processing
    setTimeout(() => {
      try {
        const randomClass = ELECTRICITY_CLASSES[Math.floor(Math.random() * ELECTRICITY_CLASSES.length)];
        
        const newIssue = MockElectricityData.createIssue({
          reporterId: user.id,
          lat: coords.lat,
          lng: coords.lng,
          imageUrl: preview || "",
          damageClassId: randomClass.id,
          jurisdictionId: selectedCity,
        });

        const mockDetection = {
          confidence: 0.96 + Math.random() * 0.03,
          severity: newIssue.severity,
          defectType: randomClass.id,
          boundingBox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }
        };

        setResult({
          kind: "created",
          issueId: newIssue.id,
          detection: mockDetection,
          routedTo: "Electricity Department",
          isSimulatedRouting: true,
          previewUrl: preview!,
        });
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    }, 1500);
  }

  if (loading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E7ECF0] blueprint-bg text-slate-900">
      <Navbar user={user} />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FFC000] text-slate-900 rounded-xl shadow-sm">
              <Camera size={26} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-950">
                Report Electricity Issue
              </h1>
              <p className="text-xs text-slate-600 font-medium">Capture or upload photo · AI verifies and routes to Electricity immediately</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {error && <p className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700 shadow-sm">{error}</p>}

              <div className="rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white p-8 text-center shadow-sm">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto max-h-72 rounded-xl object-contain shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500 py-6">
                    <div className="p-4 rounded-full bg-slate-100 text-slate-700">
                      <Camera size={36} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No damage photo selected</p>
                    <p className="text-xs text-slate-500 max-w-xs">Upload a clear photo of the Electricity issue (garbage accumulation, illegal dumping, blocked drains)</p>
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
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-[#FFC000] hover:bg-[#EBB000] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:scale-105"
                  >
                    <Upload size={16} /> {preview ? "Change Photo" : "Capture / Upload Photo"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#CBD5E1] bg-white p-5 shadow-sm space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Municipal Jurisdiction
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCoords(null);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC000]"
                >
                  {jurisdictions.map((j) => (
                    <option key={j.id} value={j.id}>{j.city}, {j.state}</option>
                  ))}
                </select>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={useDemoCity}
                    disabled={!selectedCity}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-all"
                  >
                    <MapPin size={16} /> {coords ? `Location Set (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : "Use Municipal Coordinates"}
                  </button>
                  <button
                    onClick={tryRealGps}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <MapPin size={14} className={locating ? "animate-pulse text-amber-500" : ""} />
                    {locating ? "Locating…" : "Try Device GPS"}
                  </button>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={submitting || !file || !coords}
                className="w-full rounded-xl bg-blue-900 hover:bg-blue-950 py-3.5 font-bold uppercase tracking-wider text-xs sm:text-sm text-white shadow-sm transition-all disabled:opacity-40"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin text-[#FFC000]" /> Running AI verification…</span>
                ) : (
                  "Submit Report For AI Verification"
                )}
              </button>
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
                    Confidence {(result.detection.confidence * 100).toFixed(0)}% · Severity {result.detection.severity} · Category: {result.detection.defectType}
                  </p>
                  {result.kind === "created" && (
                    <p className="mb-4 font-mono text-xs text-blue-700 font-semibold bg-blue-50 p-2 rounded-lg border border-blue-100">
                      Routed to: {result.routedTo}{result.isSimulatedRouting ? " (simulated municipal endpoint)" : ""}
                    </p>
                  )}
                  <BoundingBoxOverlay imageUrl={result.previewUrl} box={result.detection.boundingBox} label={result.detection.defectType} />
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => router.push(`/Electricity/issues/${result.issueId}`)} className="rounded-xl bg-[#FFC000] hover:bg-[#EBB000] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm">
                      View Issue Status
                    </button>
                    <button onClick={() => router.push("/Electricity/dashboard")} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                      Electricity Dashboard
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
