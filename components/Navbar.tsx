"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  User,
  ChevronDown,
  LayoutDashboard,
  Plus,
  Construction,
  Trash2,
  Zap,
  Droplet,
  Map as MapIcon,
  Trophy,
  Gift,
  Home,
} from "lucide-react";
import type { PublicUser } from "@/domain/types";
import { apiPost } from "@/lib/apiClient";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar({ user }: { user: PublicUser | null | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const deptMenuRef = useRef<HTMLDivElement>(null);

  async function logout() {
    await apiPost("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  // Close dropdowns when clicking outside.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (deptMenuRef.current && !deptMenuRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const myDashboardHref =
    user?.role === "super_admin"
      ? "/admin"
      : user?.role === "officer" || user?.role === "authority_admin"
        ? "/authority"
        : "/dashboard";

  const primaryLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Live Map", href: "/map", icon: MapIcon },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Rewards", href: "/rewards", icon: Gift },
  ];

  const deptLinks = [
    { name: "My Dashboard", href: myDashboardHref, icon: LayoutDashboard, desc: "Your overview" },
    { name: "Roads", href: "/dashboard", icon: Construction, desc: "Potholes & roads" },
    { name: "Sanitation", href: "/sanitation/dashboard", icon: Trash2, desc: "Waste & cleanliness" },
    { name: "Electricity", href: "/electricity/dashboard", icon: Zap, desc: "Power & lighting" },
    { name: "Drainage", href: "/drainage/dashboard", icon: Droplet, desc: "Water & drainage" },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "V";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-asphalt-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-teal p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="h-2 w-2 rounded-[2px] bg-amber" />
            <span className="h-2 w-2 rounded-[2px] bg-white/70" />
            <span className="h-2 w-2 rounded-[2px] bg-white/70" />
            <span className="h-2 w-2 rounded-[2px] bg-amber" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-950">
            Civic<span className="text-teal">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-teal-dim text-teal"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Departments dropdown */}
          <div className="relative" ref={deptMenuRef}>
            <button
              onClick={() => setDeptOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              aria-expanded={deptOpen}
            >
              Dashboards
              <ChevronDown className={`h-4 w-4 transition-transform ${deptOpen ? "rotate-180" : ""}`} />
            </button>
            {deptOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-asphalt-line bg-white p-2 shadow-card-hover animate-fade-in">
                {deptLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setDeptOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-dim text-teal">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{link.name}</span>
                        <span className="block text-[11px] text-slate-500">{link.desc}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right cluster */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/report" className="btn-primary px-4 py-2 text-sm">
            <Plus className="h-4 w-4" />
            Report Issue
          </Link>

          <div className="mx-1 h-6 w-px bg-asphalt-line" />

          <NotificationBell userId={user?.id} />

          {user === undefined ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-sm font-bold text-white shadow-sm transition-all hover:ring-2 hover:ring-amber hover:ring-offset-1"
                aria-label="User profile"
              >
                {userInitial}
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-asphalt-line bg-white p-2 shadow-card-hover animate-fade-in">
                  <div className="mb-1 border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="truncate font-mono text-[11px] text-slate-500">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded-md bg-teal-dim px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                  <Link
                    href={myDashboardHref}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {user.role === "super_admin" ? <ShieldCheck size={16} /> : <User size={16} />}
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost px-3.5 py-2 text-sm">
                Login
              </Link>
              <Link href="/signup" className="btn-secondary px-3.5 py-2 text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell userId={user?.id} />
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileMenuOpen && (
        <div className="border-t border-asphalt-line bg-white px-5 py-4 md:hidden animate-fade-in">
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary mb-4 w-full py-3 text-sm"
          >
            <Plus className="h-4 w-4" />
            Report an Issue
          </Link>

          <div className="grid grid-cols-2 gap-1">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    isActive ? "bg-teal-dim text-teal" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <p className="eyebrow mb-1 mt-4 px-1">Dashboards</p>
          <div className="grid grid-cols-1 gap-1">
            {deptLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-dim text-teal">
                    <Icon className="h-4 w-4" />
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600"
              >
                <LogOut size={16} /> Log out ({user.name})
              </button>
            ) : (
              <div className="flex w-full gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-ghost flex-1 py-2.5 text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary flex-1 py-2.5 text-sm"
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
