"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, ShieldCheck, User } from "lucide-react";
import type { PublicUser } from "@/domain/types";
import { apiPost } from "@/lib/apiClient";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar({ user }: { user: PublicUser | null | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  async function logout() {
    await apiPost("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "LIVE MAP", href: "/map" },
    { name: "LEADERBOARD", href: "/leaderboard" },
    { name: "REWARDS", href: "/rewards" },
    {
      name: "ROAD DASH",
      href: user?.role === "super_admin" ? "/admin" : (user?.role === "officer" || user?.role === "authority_admin") ? "/authority" : "/dashboard",
    },
    { name: "SANITATION", href: "/sanitation/dashboard" },
    { name: "ELECTRICITY", href: "/electricity/dashboard" },
    { name: "DRAINAGE", href: "/drainage/dashboard" },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "V";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D5DDE6] bg-[#E7ECF0]/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-8 lg:px-12 flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* 4-square yellow grid icon */}
          <div className="grid grid-cols-2 gap-1 w-6 h-6 p-0.5">
            <div className="bg-[#FFC000] rounded-[2px] transition-transform duration-200 group-hover:scale-105" />
            <div className="bg-[#FFC000] rounded-[2px] transition-transform duration-200 group-hover:scale-105" />
            <div className="bg-[#FFC000] rounded-[2px] transition-transform duration-200 group-hover:scale-105" />
            <div className="bg-[#FFC000] rounded-[2px] transition-transform duration-200 group-hover:scale-105" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-950 font-body">
            Civic AI
          </span>
        </Link>

        {/* Center / Right: Nav Links */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] font-bold tracking-widest transition-colors ${
                  isActive
                    ? "text-slate-950 font-extrabold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Hairline Divider */}
          <div className="h-5 w-[1px] bg-[#CBD5E1]" />

          {/* Notification Bell */}
          <NotificationBell userId={user?.id} />

          {/* User Avatar / Profile */}
          {user === undefined ? (
            <div className="w-8 h-8 rounded-full bg-slate-300 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white text-sm font-bold shadow-sm hover:ring-2 hover:ring-[#FFC000] transition-all"
                aria-label="User profile"
              >
                {userInitial}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                  <Link
                    href={user.role === "super_admin" ? "/admin" : (user.role === "officer" || user.role === "authority_admin") ? "/authority" : "/dashboard"}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {user.role === "super_admin" ? <ShieldCheck size={14} /> : <User size={14} />}
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white text-sm font-bold shadow-sm hover:ring-2 hover:ring-[#FFC000] transition-all"
                title="Login / Account"
              >
                V
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <NotificationBell userId={user?.id} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-[#E7ECF0] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold tracking-wider text-slate-800 hover:text-slate-950 py-1"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs font-semibold text-red-600 flex items-center gap-1.5"
              >
                <LogOut size={14} /> Log out ({user.name})
              </button>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-amber-900 bg-[#FFC000] px-3 py-1 rounded"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
