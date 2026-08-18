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
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#E7ECF0] blueprint-bg text-slate-900">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="grid grid-cols-2 gap-1 w-6 h-6 p-0.5">
            <div className="bg-[#FFC000] rounded-[2px]" />
            <div className="bg-[#FFC000] rounded-[2px]" />
            <div className="bg-[#FFC000] rounded-[2px]" />
            <div className="bg-[#FFC000] rounded-[2px]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-950 font-body">
            Civic AI
          </span>
        </Link>

        <form onSubmit={submit} className="rounded-2xl border border-[#CBD5E1] bg-white p-7 shadow-sm">
          <h1 className="mb-1 font-display text-2xl font-black uppercase tracking-tight text-slate-950">Create Citizen Account</h1>
          <p className="mb-5 text-xs text-slate-500 font-medium">Join your local community to report and verify road repairs</p>
          
          {error && <p className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">{error}</p>}
          
          <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Full Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC000]"
            />
          </label>
          <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Email Address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC000]"
            />
          </label>
          <label className="mb-5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC000]"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#FFC000] hover:bg-[#EBB000] py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Creating Account…" : "Get Started"}
          </button>
          <p className="mt-5 text-center text-xs font-medium text-slate-600">
            Already have an account? <Link href="/login" className="text-blue-700 font-bold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
