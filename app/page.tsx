"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  MapPin,
  Users,
  Building2,
  Wrench,
  Gift,
  ArrowUpRight,
  Globe,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Trash2,
  Droplet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function HomePage() {
  const { user } = useCurrentUser();

  const steps = [
    {
      num: "01",
      title: "CITIZEN",
      desc: "You report a road issue",
      icon: (
        <Camera className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
    {
      num: "02",
      title: "AI VERIFICATION",
      desc: "AI verifies the issue",
      icon: (
        <div className="flex items-center justify-center font-mono text-[#1E3A8A] font-extrabold text-[12px] tracking-tighter">
          <span className="text-sm font-light mr-0.5">[</span>
          <span>AI</span>
          <span className="text-sm font-light ml-0.5">]</span>
        </div>
      ),
    },
    {
      num: "03",
      title: "LOCATION",
      desc: "Location is captured",
      icon: (
        <MapPin className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
    {
      num: "04",
      title: "COMMUNITY",
      desc: "Neighbors upvote",
      icon: (
        <Users className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
    {
      num: "05",
      title: "AUTHORITY",
      desc: "Sent to right department",
      icon: (
        <Building2 className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
    {
      num: "06",
      title: "REPAIR",
      desc: "Issue is resolved",
      icon: (
        <Wrench className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
    {
      num: "07",
      title: "REWARD",
      desc: "You earn points",
      icon: (
        <Gift className="w-5 h-5 text-[#1E3A8A] stroke-[2.2]" />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#E7ECF0] text-slate-900 flex flex-col font-body blueprint-bg selection:bg-[#FFC000] selection:text-black">
      {/* Top Navigation */}
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="relative w-full min-h-[700px] flex flex-col justify-between overflow-hidden border-b border-[#CBD5E1]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/city-bg.jpg"
            alt="City Background"
            fill
            className="object-cover object-bottom"
            priority
          />
          {/* Soft gradient overlay for text readability on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col xl:flex-row items-center justify-between gap-10">
          
          {/* Left Column */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#FFC000]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-slate-800">
                AI-POWERED CIVIC PLATFORM
              </span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-[80px] leading-[1.05] tracking-tight text-slate-900 mb-6">
              See a Problem.<br />
              <span className="text-[#FFC000]">Report It.</span><br />
              Get It Fixed.
            </h1>

            <p className="font-body text-slate-700 text-base md:text-lg max-w-lg leading-relaxed mb-10">
              From potholes to garbage piled up on the street — report civic issues, track progress, and help build a cleaner, safer city for everyone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/report" className="flex items-center justify-between bg-[#FFC000] hover:bg-[#EBB000] text-slate-950 font-bold uppercase tracking-wider text-[11px] sm:text-xs px-5 py-3.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4" />
                  <span>REPORT ROAD ISSUE</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>
              
              <Link href="/sanitation/report" className="flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs px-5 py-3.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>REPORT SANITATION ISSUE</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>

              <Link href="/electricity/report" className="flex items-center justify-between bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs px-5 py-3.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4" />
                  <span>REPORT ELECTRICITY ISSUE</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>

              <Link href="/drainage/report" className="flex items-center justify-between bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs px-5 py-3.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <Droplet className="w-4 h-4" />
                  <span>REPORT DRAINAGE ISSUE</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>

          {/* Center Badge (Hidden on mobile) */}
          <div className="hidden 2xl:flex items-center justify-center relative w-48 h-48 mx-4 shrink-0">
            <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/50 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-emerald-400/30" />
            <div className="w-32 h-32 bg-white rounded-full shadow-xl flex flex-col items-center justify-center p-4 text-center z-10 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-1">CIVIC AI</span>
              <Building2 className="w-8 h-8 text-emerald-600 mb-1" />
              <span className="text-[9px] font-semibold text-slate-500 uppercase">Better City, Together</span>
            </div>
            {/* Connecting lines illustration */}
            <svg className="absolute left-full top-1/2 -translate-y-1/2 w-32 h-64 -z-10" viewBox="0 0 100 200" fill="none">
              <path d="M0,100 C50,100 50,20 100,20" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M0,100 C50,100 50,180 100,180" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Right Column: 4 Images Grid (Restored) */}
          <div className="w-full xl:w-[600px] shrink-0 relative flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[16/16] sm:aspect-[16/14] flex items-center justify-center group z-10">
              <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full h-full bg-white/40 p-3 rounded-3xl backdrop-blur-sm border border-white/50 shadow-2xl">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src="/images/hero-3d.jpg"
                    alt="Civic AI - Roads"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src="/images/sanitation-3d.jpg"
                    alt="Civic AI - Sanitation"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group/img">
                  <img
                    src="/images/elec-drainage.jpg"
                    alt="Civic AI - Electricity"
                    className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover group-hover/img:scale-105 transition-transform duration-500 origin-left"
                  />
                </div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group/img">
                  <img
                    src="/images/elec-drainage.jpg"
                    alt="Civic AI - Drainage"
                    className="absolute top-0 right-0 w-[200%] max-w-none h-full object-cover group-hover/img:scale-105 transition-transform duration-500 origin-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full bg-white border-b border-[#CBD5E1] py-6 px-6 sm:px-10 lg:px-16 shadow-sm relative z-20 overflow-x-auto">
        <div className="max-w-[1600px] mx-auto flex sm:grid sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 lg:gap-6 divide-x divide-slate-100 min-w-[700px]">
          
          <div className="flex items-center gap-4 px-2 sm:px-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Total Reports</div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">12,842</div>
              <div className="text-[10px] text-slate-400 leading-none">All time reports</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Resolved Issues</div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">9,215</div>
              <div className="text-[10px] text-slate-400 leading-none">Issues fixed</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#FFC000]/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Active Citizens</div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">5,678</div>
              <div className="text-[10px] text-slate-400 leading-none">Making a difference</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Reward Points Given</div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">2.4M</div>
              <div className="text-[10px] text-slate-400 leading-none">Points distributed</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">In Progress</div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">3,627</div>
              <div className="text-[10px] text-slate-400 leading-none">Being resolved</div>
            </div>
          </div>

        </div>
      </div>

      {/* Section 02: HOW IT WORKS (Connected 7-Step Process Bar) */}
      <section className="w-full border-b border-[#CBD5E1] bg-[#E7ECF0]/80 py-8 px-4 sm:px-8 lg:px-12">
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Section 02 Header */}
          <div className="flex items-center gap-2.5 min-w-[170px] shrink-0">
            <span className="font-mono text-sm font-bold text-slate-900">02</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC000] inline-block shadow-sm" />
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-900">
              HOW IT WORKS
            </span>
          </div>

          {/* 7 Connected Steps Progression */}
          <div className="relative w-full">
            {/* Continuous dashed guide line */}
            <div className="hidden md:block absolute top-6 left-6 right-6 h-0.5 border-t-2 border-dashed border-[#CBD5E1] z-0" />

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 sm:gap-4 relative z-10">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col items-center text-center group cursor-default"
                >
                  {/* Step Icon Node */}
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110 group-hover:shadow-md group-hover:border-amber-400">
                    {step.icon}
                  </div>

                  {/* Step Meta */}
                  <span className="font-mono text-[11px] font-bold text-slate-900 mb-0.5">
                    {step.num}
                  </span>
                  <h3 className="font-mono text-[11px] sm:text-xs font-black tracking-wider uppercase text-slate-950 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium leading-tight max-w-[120px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Cards */}
      <section className="w-full px-6 sm:px-12 lg:px-16 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-[#1E3A8A]" />,
              title: "Verified Before It Counts",
              body: "Every photo runs through AI verification first — eliminating spam, false alarms, and wasted authority response time.",
            },
            {
              icon: <Sparkles className="w-5 h-5 text-[#FFC000]" />,
              title: "Built to Keep You Reporting",
              body: "Levels, streaks, and badges turn a public-good habit into an engaging and rewarding civic experience.",
            },
            {
              icon: <Zap className="w-5 h-5 text-emerald-600" />,
              title: "Open To Everyone",
              body: "The live map shows every issue's verification status, authority assignment, and fix progress in open real-time.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[#CBD5E1] bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-slate-400 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-950 uppercase tracking-tight">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#CBD5E1] py-6 px-6 text-center text-xs font-mono font-medium text-slate-500 bg-[#E7ECF0]">
        CIVIC AI — REVOLUTIONIZING CIVIC INFRASTRUCTURE WITH AI
      </footer>
    </div>
  );
}
