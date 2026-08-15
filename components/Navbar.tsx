"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
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
    <nav className="sticky top-0 z-40 border-b border-asphalt-line bg-[#0a0d14]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-amber">
            <span className="h-[3px] w-5 rounded-full bg-asphalt" />
          </span>
          CivicRoad <span className="text-amber">AI</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <Link href="/" className="relative text-white">
            Home
            <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-amber"></span>
          </Link>
          <Link href="/map" className="hover:text-white transition-colors">Live Map</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/rewards" className="hover:text-white transition-colors">Rewards</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          {user === undefined ? null : user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link
                href={
                  user.role === "citizen" ? "/dashboard" : user.role === "super_admin" ? "/admin" : "/authority"
                }
                className="hidden items-center gap-1.5 rounded-lg border border-asphalt-line px-4 py-2 text-sm text-ink hover:border-amber/50 md:flex"
              >
                {user.role === "super_admin" ? <ShieldCheck size={15} /> : <LayoutDashboard size={15} />}
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg bg-asphalt-surface px-4 py-2 text-sm text-ink-muted hover:text-white transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden md:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-asphalt-line px-5 py-2 text-sm font-medium text-white hover:bg-asphalt-surface transition-colors">
                Login
              </Link>
              <Link href="/signup" className="rounded-lg bg-amber px-5 py-2 text-sm font-semibold text-asphalt hover:bg-amber/90 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
