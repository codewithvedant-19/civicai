"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/apiClient";

const DEMO_LOGINS = [
  ["citizen@demo.dev", "Citizen"],
  ["citizen2@demo.dev", "Citizen (confirmer)"],
  ["officer@demo.dev", "Authority Officer"],
  ["authority@demo.dev", "Authority Admin"],
  ["admin@demo.dev", "Super Admin"],
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiPost<{ redirectTo: string }>("/api/auth/login", { email, password });
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
          <h1 className="mb-5 font-display text-xl font-semibold text-ink">Log in</h1>
          {error && <p className="mb-3 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{error}</p>}
          <label className="mb-3 block text-sm text-ink-muted">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50"
            />
          </label>
          <label className="mb-4 block text-sm text-ink-muted">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-ink outline-none focus:border-amber/50"
            />
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-amber py-2.5 font-medium text-asphalt hover:bg-amber/90 disabled:opacity-50">
            {loading ? "Signing in…" : "Log in"}
          </button>
          <p className="mt-4 text-center text-sm text-ink-muted">
            No account? <Link href="/signup" className="text-teal">Sign up</Link>
          </p>
        </form>

        <div className="mt-5 rounded-2xl border border-asphalt-line bg-asphalt-surface/60 p-4 text-xs text-ink-muted">
          <p className="mb-2 font-medium text-ink">Demo accounts (password: password123)</p>
          {DEMO_LOGINS.map(([e, label]) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmail(e)}
              className="mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1 text-left hover:bg-asphalt"
            >
              <span className="font-mono">{e}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
