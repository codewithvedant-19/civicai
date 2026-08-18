"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Camera,
  MapPin,
  Building2,
  Wrench,
  Gift,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Trash2,
  Droplet,
  Construction,
  Cpu,
  Award,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { apiGet } from "@/lib/apiClient";

type Stats = {
  totalIssues: number;
  resolved: number;
  byStatus: Record<string, number>;
};

export default function HomePage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    apiGet<Stats>("/api/public/stats")
      .then(setStats)
      .catch(() => setStatsError(true));
  }, []);

  const inProgress = stats
    ? (stats.byStatus["repair_in_progress"] ?? 0) +
      (stats.byStatus["officer_assigned"] ?? 0) +
      (stats.byStatus["under_review"] ?? 0) +
      (stats.byStatus["authority_notified"] ?? 0)
    : 0;
  const resolutionRate =
    stats && stats.totalIssues > 0
      ? Math.round((stats.resolved / stats.totalIssues) * 100)
      : 0;

  const departments = [
    {
      name: "Potholes & Roads",
      desc: "Report damaged roads, potholes and unsafe streets.",
      icon: Construction,
      href: "/report",
      accent: "text-amber-600",
      chip: "bg-amber-100",
    },
    {
      name: "Electricity",
      desc: "Street lights, power outages and exposed wiring.",
      icon: Zap,
      href: "/electricity/report",
      accent: "text-violet-600",
      chip: "bg-violet-100",
    },
    {
      name: "Sanitation",
      desc: "Garbage piles, overflowing bins and cleanliness.",
      icon: Trash2,
      href: "/sanitation/report",
      accent: "text-emerald-600",
      chip: "bg-emerald-100",
    },
    {
      name: "Drainage & Water",
      desc: "Blocked drains, water logging and leakages.",
      icon: Droplet,
      href: "/drainage/report",
      accent: "text-teal-light",
      chip: "bg-teal-dim",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Report the Issue",
      desc: "Snap a photo, add the location and describe the problem in seconds.",
      icon: Camera,
    },
    {
      num: "02",
      title: "AI Verification",
      desc: "Our AI validates the report and classifies severity automatically.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "Routed to Authority",
      desc: "The right department is notified and an officer is assigned.",
      icon: Building2,
    },
    {
      num: "04",
      title: "Resolved & Rewarded",
      desc: "Track progress to resolution and earn civic reward points.",
      icon: Award,
    },
  ];

  const statCards = [
    {
      label: "Total Reports",
      value: stats?.totalIssues,
      caption: "Issues reported by citizens",
      icon: Camera,
      accent: "text-teal",
      chip: "bg-teal-dim",
    },
    {
      label: "Resolved",
      value: stats?.resolved,
      caption: "Issues fixed and closed",
      icon: CheckCircle2,
      accent: "text-emerald-600",
      chip: "bg-emerald-100",
    },
    {
      label: "In Progress",
      value: inProgress,
      caption: "Currently being handled",
      icon: Activity,
      accent: "text-amber-600",
      chip: "bg-amber-100",
    },
    {
      label: "Resolution Rate",
      value: stats ? resolutionRate : undefined,
      suffix: "%",
      caption: "Reports resolved to date",
      icon: TrendingUp,
      accent: "text-violet-600",
      chip: "bg-violet-100",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-asphalt text-slate-900">
      <Navbar user={user} />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-asphalt-line">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/city-bg.jpg"
            alt=""
            fill
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:px-16 lg:py-24">
          <div className="max-w-2xl flex-1 animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-asphalt-line bg-white px-3 py-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
                AI-Powered Civic Platform
              </span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 text-balance sm:text-5xl md:text-6xl">
              See a problem.
              <br />
              Report it. <span className="text-teal">Get it fixed.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
              CivicAI lets citizens report potholes, electricity, sanitation and
              drainage issues in seconds — then tracks every report from
              verification to resolution, all in one transparent platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="btn-primary px-6 py-3.5 text-sm">
                <Wrench className="h-[18px] w-[18px]" />
                Report an Issue
              </Link>
              <Link href="/dashboard" className="btn-ghost px-6 py-3.5 text-sm">
                <MapPin className="h-[18px] w-[18px]" />
                Track a Complaint
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium">AI-verified reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal" />
                <span className="text-xs font-medium">Community powered</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg flex-1 animate-fade-in">
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/60 bg-white/50 p-3 shadow-card-hover backdrop-blur-sm">
              {[
                { src: "/images/hero-3d.jpg", label: "Roads" },
                { src: "/images/sanitation-3d.jpg", label: "Sanitation" },
                { src: "/images/elec-drainage.jpg", label: "Electricity", origin: "origin-left" },
                { src: "/images/elec-drainage.jpg", label: "Drainage", origin: "origin-right", right: true },
              ].map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm"
                >
                  {img.right ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src || "/placeholder.svg"}
                      alt=""
                      className={`absolute right-0 top-0 h-full w-[200%] max-w-none object-cover transition-transform duration-500 group-hover:scale-105 ${img.origin ?? ""}`}
                    />
                  ) : img.origin ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src || "/placeholder.svg"}
                      alt=""
                      className={`absolute left-0 top-0 h-full w-[200%] max-w-none object-cover transition-transform duration-500 group-hover:scale-105 ${img.origin}`}
                    />
                  ) : (
                    <Image
                      src={img.src || "/placeholder.svg"}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                      {img.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-asphalt-line bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-start gap-3.5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.chip}`}>
                    <Icon className={`h-5 w-5 ${s.accent}`} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {s.label}
                    </p>
                    {s.value === undefined && !statsError ? (
                      <div className="my-1 h-7 w-16 skeleton" />
                    ) : s.value === undefined ? (
                      <p className="font-display text-2xl font-extrabold leading-none text-slate-300">—</p>
                    ) : (
                      <p className="font-display text-2xl font-extrabold leading-none text-slate-900">
                        {s.value.toLocaleString()}
                        {s.suffix ?? ""}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] leading-none text-slate-400">{s.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {statsError && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Live statistics are temporarily unavailable.
            </p>
          )}
        </div>
      </section>

      {/* Departments */}
      <section className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-2">Report by Category</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 text-balance">
            One platform for every civic issue
          </h2>
          <p className="mt-3 text-slate-600">
            Choose a department to file a report. Each issue is verified, routed
            and tracked to resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => {
            const Icon = d.icon;
            return (
              <Link key={d.name} href={d.href} className="card-interactive group flex flex-col p-6">
                <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${d.chip}`}>
                  <Icon className={`h-6 w-6 ${d.accent}`} />
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900">{d.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{d.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                  Report now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-asphalt-line bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-2">How CivicAI Works</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 text-balance">
              From report to resolution in four steps
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-asphalt-line lg:block" />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-asphalt-line bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-teal" />
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-300">{step.num}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="eyebrow mb-2">Civic Rewards</p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 text-balance">
                Get rewarded for making your city better
              </h2>
              <p className="mt-3 text-slate-600">
                Every verified report and resolved issue earns you civic points.
                Climb the leaderboard, unlock badges and redeem points for
                rewards from local partners.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/rewards" className="btn-secondary px-5 py-3 text-sm">
                  <Gift className="h-[18px] w-[18px]" />
                  Explore Rewards
                </Link>
                <Link href="/leaderboard" className="btn-ghost px-5 py-3 text-sm">
                  View Leaderboard
                </Link>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-asphalt-line bg-asphalt-surface p-8 sm:p-12 lg:border-l lg:border-t-0">
              {[
                { icon: Award, title: "Earn on every report", desc: "Points for verified and resolved issues." },
                { icon: TrendingUp, title: "Climb the leaderboard", desc: "See how you rank in your community." },
                { icon: Gift, title: "Redeem for rewards", desc: "Turn civic points into real perks." },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className="flex items-center gap-4 rounded-xl border border-asphalt-line bg-white p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-dim">
                      <Icon className="h-5 w-5 text-amber-600" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{r.title}</p>
                      <p className="text-sm text-slate-500">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-asphalt-line bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-2">Built on Trust</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 text-balance">
              Transparent, accountable, community-driven
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified before it counts",
                body: "Every photo runs through AI verification first — eliminating spam, false alarms and wasted authority response time.",
                accent: "text-teal",
                chip: "bg-teal-dim",
              },
              {
                icon: Sparkles,
                title: "Built to keep you engaged",
                body: "Levels, streaks and badges turn a public-good habit into a genuinely rewarding civic experience.",
                accent: "text-amber-600",
                chip: "bg-amber-dim",
              },
              {
                icon: Activity,
                title: "Open to everyone",
                body: "The live map shows every issue's verification status, authority assignment and fix progress in real time.",
                accent: "text-emerald-600",
                chip: "bg-emerald-100",
              },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card p-6">
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${v.chip}`}>
                    <Icon className={`h-5 w-5 ${v.accent}`} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-asphalt-line bg-teal">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-6 px-6 py-14 text-center sm:px-10 lg:px-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
            Spotted a civic issue? Report it now.
          </h2>
          <p className="max-w-xl text-teal-dim/90 text-blue-100">
            Join thousands of citizens building cleaner, safer cities — one report at a time.
          </p>
          <Link href="/report" className="btn-primary px-7 py-3.5 text-sm">
            <Wrench className="h-[18px] w-[18px]" />
            Report an Issue
            <ArrowUpRight className="h-4 w-4 opacity-60" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-asphalt-line bg-asphalt">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-12 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-teal p-1.5">
                  <span className="h-2 w-2 rounded-[2px] bg-amber" />
                  <span className="h-2 w-2 rounded-[2px] bg-white/70" />
                  <span className="h-2 w-2 rounded-[2px] bg-white/70" />
                  <span className="h-2 w-2 rounded-[2px] bg-amber" />
                </div>
                <span className="font-display text-lg font-extrabold tracking-tight text-slate-950">
                  Civic<span className="text-teal">AI</span>
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Revolutionizing civic infrastructure with AI — report, track and
                resolve community issues transparently.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="eyebrow mb-3">Platform</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/report" className="hover:text-teal">Report Issue</Link></li>
                  <li><Link href="/map" className="hover:text-teal">Live Map</Link></li>
                  <li><Link href="/dashboard" className="hover:text-teal">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-3">Community</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/leaderboard" className="hover:text-teal">Leaderboard</Link></li>
                  <li><Link href="/rewards" className="hover:text-teal">Rewards</Link></li>
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-3">Departments</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/sanitation/dashboard" className="hover:text-teal">Sanitation</Link></li>
                  <li><Link href="/electricity/dashboard" className="hover:text-teal">Electricity</Link></li>
                  <li><Link href="/drainage/dashboard" className="hover:text-teal">Drainage</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-asphalt-line pt-6 text-center font-mono text-[11px] font-medium uppercase tracking-wider text-slate-400">
            CivicAI — Revolutionizing Civic Infrastructure with AI
          </div>
        </div>
      </footer>
    </div>
  );
}
