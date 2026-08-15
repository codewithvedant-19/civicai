"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiPost<{ redirectTo: string }>("/api/auth/signup", { name, email, password });
      router.push(data.redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-xl font-semibold text-ink">
          CivicRoad <span className="text-amber">AI</span>
        </Link>
        <form onSubmit={submit} className="rounded-2xl border border-asphalt-line bg-asphalt-surface p-6">
          <h1 className="mb-1 font-display text-xl font-semibold text-ink">Create your citizen account</h1>
          <p className="mb-5 text-xs text-ink-faint">Authority and admin roles are granted by invite only — not available here.</p>
          {error && <p className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</p>}
          <label className="mb-3 block text-sm text-ink-muted">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50" />
          </label>
          <label className="mb-3 block text-sm text-ink-muted">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50" />
          </label>
          <label className="mb-4 block text-sm text-ink-muted">
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50" />
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-amber py-2.5 font-medium text-asphalt hover:bg-amber/90 disabled:opacity-50">
            {loading ? "Creating account…" : "Get Started"}
          </button>
          <p className="mt-4 text-center text-sm text-ink-muted">
            Already have an account? <Link href="/login" className="text-teal">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
