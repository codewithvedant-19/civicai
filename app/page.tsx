"use client";
import Link from "next/link";
import { Camera, ScanSearch, MapPinned, Users2, Building2, Wrench, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";

const FLOW = [
  { icon: Camera, label: "Citizen" },
  { icon: ScanSearch, label: "AI" },
  { icon: MapPinned, label: "GPS" },
  { icon: Users2, label: "Community" },
  { icon: Building2, label: "Authority" },
  { icon: Wrench, label: "Repair" },
  { icon: Gift, label: "Reward" },
];

export default function HomePage() {
  const { user } = useCurrentUser();

  return (
    <div>
      <Navbar user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-asphalt-line">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
          <span className="mb-5 inline-block rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-amber">
            Prototype · simulated authority integrations
          </span>
          <h1 className="font-display text-4xl font-bold uppercase leading-[1.1] tracking-tight text-ink sm:text-6xl">
            See a road problem.
            <br />
            <span className="text-amber">Report it.</span> Get it fixed.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">
            Photograph the damage. Our AI verifies it, routes it to the right authority,
            and your neighbors help push it up the queue.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/report" className="rounded-lg bg-amber px-5 py-3 font-display font-semibold uppercase tracking-wide text-asphalt hover:bg-amber/90">
              Report a Road Issue
            </Link>
            <Link href="/map" className="rounded-lg border border-asphalt-line px-5 py-3 font-display font-semibold uppercase tracking-wide text-ink hover:border-teal/50">
              Explore Live Map
            </Link>
          </div>
        </div>

        {/* Literal road: a single asphalt strip carries the flow, instead of an icon+arrow chain */}
        <div className="border-t border-asphalt-line bg-asphalt-surface/40 py-10">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative h-2 rounded-full bg-asphalt">
              <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-dash-line text-ink-faint/50" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-y-6 sm:grid-cols-7">
              {FLOW.map((step) => (
                <div key={step.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal/10 text-teal">
                    <step.icon size={17} />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Verified before it counts", body: "Every photo runs through AI verification first — no spam, no false alarms, no wasted authority time." },
            { title: "Built to keep you reporting", body: "Levels, streaks, and badges turn a public-good habit into something worth doing again tomorrow." },
            { title: "Open to everyone", body: "The live map shows every issue's status and how fast it got fixed — no login, nothing hidden." },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-asphalt-line bg-asphalt-surface p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-asphalt-line py-8 text-center text-xs text-ink-faint">
        CivicRoad AI — prototype build. All authority integrations shown are simulated for demo purposes.
      </footer>
    </div>
  );
}

