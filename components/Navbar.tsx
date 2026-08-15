"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Trophy, Gift, LayoutDashboard, ShieldCheck, LogOut, Home } from "lucide-react";
import type { PublicUser } from "@/domain/types";
import { apiPost } from "@/lib/apiClient";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar({ user }: { user: PublicUser | null | undefined }) {
  const router = useRouter();

  async function logout() {
    await apiPost("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-asphalt-line bg-asphalt/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-amber">
            <span className="h-[3px] w-5 rounded-full bg-dash-line text-asphalt" />
          </span>
          CivicRoad <span className="text-amber">AI</span>
        </Link>

        <div className="hidden items-center gap-5 text-sm text-ink-muted md:flex">
          <Link href="/" className="flex items-center gap-1.5 hover:text-ink"><Home size={15} /> Home</Link>
          <Link href="/map" className="flex items-center gap-1.5 hover:text-ink"><MapPin size={15} /> Live Map</Link>
          <Link href="/leaderboard" className="flex items-center gap-1.5 hover:text-ink"><Trophy size={15} /> Leaderboard</Link>
          <Link href="/rewards" className="flex items-center gap-1.5 hover:text-ink"><Gift size={15} /> Rewards</Link>
        </div>

        <div className="flex items-center gap-3">
          {user === undefined ? null : user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link
                href={
                  user.role === "citizen" ? "/dashboard" : user.role === "super_admin" ? "/admin" : "/authority"
                }
                className="hidden items-center gap-1.5 rounded-lg border border-asphalt-line px-3 py-1.5 text-sm text-ink hover:border-amber/50 md:flex"
              >
                {user.role === "super_admin" ? <ShieldCheck size={15} /> : <LayoutDashboard size={15} />}
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg bg-asphalt-surface px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
              >
                <LogOut size={15} />
                <span className="hidden md:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:text-ink">
                Login
              </Link>
              <Link href="/signup" className="rounded-lg bg-amber px-3 py-1.5 text-sm font-medium text-asphalt hover:bg-amber/90">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
