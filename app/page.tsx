"use client";
import Link from "next/link";
import Image from "next/image";
import { Camera, ArrowRight, Map, ShieldCheck, Sparkles, MapPin, Wrench, Gift, Users2, Zap, Trophy, CheckCircle2, Circle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function HomePage() {
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-24 md:pb-32 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/5 px-3 py-1 mb-8">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber font-semibold">
                AI-Powered • Community Driven
              </span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              See a road problem.<br />
              <span className="text-amber">Report it.</span> Get it fixed.
            </h1>
            
            <p className="max-w-xl text-lg sm:text-xl text-ink-muted mb-10 leading-relaxed">
              CivicRoad AI uses smart verification to ensure every report reaches the right authority and gets things moving.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <Link href="/report" className="flex items-center justify-center gap-2 rounded-xl bg-amber px-6 py-4 font-display text-[15px] font-bold text-asphalt hover:bg-amber/90 transition-colors w-full sm:w-auto">
                <Camera size={18} />
                Report a Road Issue
                <ArrowRight size={18} className="ml-1" />
              </Link>
              <Link href="/map" className="flex items-center justify-center gap-2 rounded-xl border border-asphalt-line bg-transparent px-6 py-4 font-display text-[15px] font-semibold text-white hover:bg-asphalt-surface transition-colors w-full sm:w-auto">
                <Map size={18} />
                Explore Live Map
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted font-medium">
              <div className="flex items-center gap-3 pr-4 border-r border-asphalt-line">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-[#0a0d14] bg-gray-600"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-[#0a0d14] bg-gray-500"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-[#0a0d14] bg-gray-400"></div>
                </div>
                <span>Trusted by 25,000+ citizens</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-500">
                <CheckCircle2 size={16} />
                <span className="text-ink-muted">AI Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-500 border-l border-asphalt-line pl-4">
                <ShieldCheck size={16} />
                <span className="text-ink-muted">Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center">
            {/* The Image with Targeting overlay */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-transparent to-transparent z-10 lg:block hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-[#0a0d14]/40 z-10"></div>
              <Image 
                src="/hero-pothole.jpg" 
                alt="Pothole at night" 
                fill
                className="object-cover rounded-2xl opacity-60"
                priority
              />
              {/* Yellow Targeting Bracket - Top Left */}
              <div className="absolute top-[20%] left-[20%] w-16 h-16 border-t-2 border-l-2 border-amber z-10 rounded-tl-lg"></div>
              {/* Yellow Targeting Bracket - Bottom Right */}
              <div className="absolute bottom-[20%] right-[20%] w-16 h-16 border-b-2 border-r-2 border-amber z-10 rounded-br-lg"></div>
            </div>

            {/* Floating Card */}
            <div className="relative z-20 bg-[#161a22]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl w-full max-w-[340px] ml-auto lg:-mr-12">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-sm font-medium text-white">AI Verification in progress</span>
              </div>
              
              <div className="flex gap-4 mb-6 bg-[#0f1218] p-3 rounded-xl border border-white/5">
                <div className="h-14 w-14 rounded-lg bg-gray-800 relative overflow-hidden flex-shrink-0">
                  <Image src="/hero-pothole.jpg" alt="thumbnail" fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-xs text-white font-medium mb-1">Pothole on 5th Avenue<br/>Sector 12, Downtown</h4>
                  <span className="text-[10px] text-[#ff5f5f] border border-[#ff5f5f]/30 bg-[#ff5f5f]/10 rounded px-2 py-0.5 w-fit">High Priority</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 size={16} className="text-green-500 fill-green-500/20" />
                    <span>Image captured</span>
                  </div>
                  <span className="text-ink-muted">2:45 PM</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 size={16} className="text-green-500 fill-green-500/20" />
                    <span>AI damage verification</span>
                  </div>
                  <span className="text-ink-muted">2:45 PM</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 size={16} className="text-green-500 fill-green-500/20" />
                    <span>Location matched</span>
                  </div>
                  <span className="text-ink-muted">2:46 PM</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <Circle size={16} className="text-ink-muted" />
                    <span className="text-ink-muted">Routed to authority</span>
                  </div>
                  <span className="text-ink-faint">Pending</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-ink-muted">
                Estimated resolution: 3-5 days
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="border-y border-asphalt-line bg-[#0d1017]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-asphalt-line">
            
            <div className="p-6 md:p-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber/20 bg-amber/5 text-amber shrink-0">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-[15px] mb-1">Capture</h3>
                <p className="text-xs text-ink-muted">Take a photo of the road issue</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber/20 bg-amber/5 text-amber shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-[15px] mb-1">AI Verifies</h3>
                <p className="text-xs text-ink-muted">Our AI checks and validates it</p>
              </div>
            </div>

            <div className="p-6 md:p-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-teal/20 bg-teal/5 text-teal shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-[15px] mb-1">Routes</h3>
                <p className="text-xs text-ink-muted">Sent to the right authority</p>
              </div>
            </div>

            <div className="p-6 md:p-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#48c792]/20 bg-[#48c792]/5 text-[#48c792] shrink-0">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-[15px] mb-1">Fixed</h3>
                <p className="text-xs text-ink-muted">Track progress till it's resolved</p>
              </div>
            </div>

            <div className="p-6 md:p-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[#d946ef]/20 border bg-[#d946ef]/5 text-[#d946ef] shrink-0">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-[15px] mb-1">Rewards</h3>
                <p className="text-xs text-ink-muted">Earn points for your contribution</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
          
          <div className="lg:w-1/4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber font-semibold block mb-4">
              Making impact together
            </span>
            <h2 className="font-display text-4xl font-bold leading-[1.2] text-white">
              Real issues.<br />
              Real actions.<br />
              <span className="text-amber">Real change.</span>
            </h2>
          </div>

          <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/5 bg-[#12161f] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2230] text-[#7196ff] mb-6">
                <Users2 size={18} />
              </div>
              <div className="text-2xl font-display font-bold text-white mb-1">25,000+</div>
              <div className="text-sm font-medium text-white mb-1">Active Citizens</div>
              <div className="text-xs text-ink-muted">Making our roads better together</div>
            </div>
            
            <div className="rounded-2xl border border-white/5 bg-[#12161f] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2230] text-[#48c792] mb-6">
                <ShieldCheck size={18} />
              </div>
              <div className="text-2xl font-display font-bold text-white mb-1">12,450</div>
              <div className="text-sm font-medium text-white mb-1">Issues Reported</div>
              <div className="text-xs text-ink-muted">Every report makes a difference</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#12161f] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2230] text-amber mb-6">
                <Zap size={18} />
              </div>
              <div className="text-2xl font-display font-bold text-white mb-1">9,850</div>
              <div className="text-sm font-medium text-white mb-1">Issues Resolved</div>
              <div className="text-xs text-ink-muted">Fixed and closed successfully</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#12161f] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2230] text-[#c084fc] mb-6">
                <Trophy size={18} />
              </div>
              <div className="text-2xl font-display font-bold text-white mb-1">78%</div>
              <div className="text-sm font-medium text-white mb-1">Resolution Rate</div>
              <div className="text-xs text-ink-muted">Within committed time</div>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}

