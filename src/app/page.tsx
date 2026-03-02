"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Download, ArrowRight, CheckCircle, UserCircle, ShieldCheck, Zap, Clock, BadgeCheck, Star, Layers, Lock, ArrowUpRight, Search } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        background: "radial-gradient(1200px 600px at 50% 10%, rgba(0,110,220,0.08), transparent 60%), linear-gradient(180deg, #F5F9FC 0%, #EEF5FD 40%, #FFFFFF 100%)",
      }}
    >
      {/* Navbar - design spec */}
      <nav className="h-[72px] flex items-center justify-between px-4 md:px-6 lg:px-[24px] max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-2" style={{ color: "#0B2B4B" }}>
          <span className="text-xl font-bold">Resu</span>
          <span className="text-xl font-bold" style={{ color: "#006EDC" }}>Tailor</span>
        </Link>
        <div className="hidden md:flex items-center gap-6" style={{ fontSize: 14, fontWeight: 500 }}>
          <a href="#template" className="hover:opacity-80 transition" style={{ color: "#123A5B" }}>
            ATS Template
          </a>
          <Link href="/pricing" className="hover:opacity-80 transition" style={{ color: "#123A5B" }}>
            Pricing
          </Link>
          {user && (
            <Link href="/profile" className="hover:opacity-80 transition" style={{ color: "#123A5B" }}>
              <UserCircle className="h-5 w-5" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/50 transition" aria-label="Search" style={{ color: "#0B2B4B" }}>
            <Search className="h-[18px] w-[18px]" />
          </button>
          <AuthButton />
          <Link href="/generate">
            <Button
              size="sm"
              className="rounded-[12px] font-semibold"
              style={{
                background: "#006EDC",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 600,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - design spec */}
      <section
        className="relative overflow-hidden flex flex-col items-center text-center"
        style={{
          minHeight: 720,
          paddingTop: 72,
          paddingBottom: 80,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center">
          <h1
            className="font-extrabold max-w-[980px] mx-auto mb-6"
            style={{
              color: "#0B2B4B",
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: -0.8,
            }}
          >
            Instantly Tailor Your Resume with
            <br />
            AI-Powered, One-Click Suggestions
          </h1>
          <p
            className="max-w-[820px] mx-auto mb-8"
            style={{
              color: "#2E5D87",
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            ResuTailor&apos;s AI-powered resume editor is a faster, more intuitive way to tailor your resume to a specific job description. See clear, in-context suggestions that you can accept with a single click.
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              className="rounded-[14px] font-semibold hover:opacity-95 transition"
              style={{
                background: "#006EDC",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 600,
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 14,
                paddingBottom: 14,
                boxShadow: "0 8px 20px rgba(0, 110, 220, 0.18)",
              }}
            >
              One-click optimize your resume
            </Button>
          </Link>
          {/* Hero image card - placeholder per design spec (max 1040px desktop, 680px tablet, 360px mobile) */}
          <div
            className="w-full max-w-[1040px] md:max-w-[680px] max-md:max-w-[min(680px,calc(100vw-32px))] max-[480px]:max-w-[360px] mt-9 rounded-[18px] overflow-hidden border"
            style={{
              boxShadow: "0 16px 60px rgba(15, 30, 60, 0.14)",
              borderColor: "#D9E6F5",
              background: "#FFFFFF",
            }}
          >
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="text-center p-8">
                <FileText className="h-24 w-24 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500 font-medium">Resume editor preview</p>
                <p className="text-slate-400 text-sm mt-1">Skills sidebar • Accept/reject suggestions • ATS-optimized layout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Metrics */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { label: "ATS‑tested format", value: "1 template" },
            { label: "Tailoring time", value: "< 2 minutes" },
            { label: "Export options", value: "PDF ready" },
          ].map((item) => (
            <Card key={item.label} className="border" style={{ borderColor: "#D9E6F5", background: "#FFFFFF", boxShadow: "0 10px 30px rgba(15, 30, 60, 0.08)", borderRadius: 14 }}>
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: "#0B2B4B" }}>{item.value}</CardTitle>
                <div className="text-sm" style={{ color: "#6B7C93" }}>{item.label}</div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Single Template Highlight */}
      <section id="template" className="py-20" style={{ background: "#F5F9FC" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#0B2B4B" }}>One template. Zero guesswork.</h2>
              <p className="mb-6" style={{ color: "#2E5D87" }}>
                A single ATS‑tested layout with clean typography, consistent spacing, and recruiter‑friendly sections.
                Your content adapts to the job—never the template.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "ATS‑Optimized", icon: ShieldCheck, desc: "Pass automated screening systems." },
                  { title: "Keyword Control", icon: Layers, desc: "Add/remove keywords with instant preview." },
                  { title: "Privacy First", icon: Lock, desc: "No sharing or selling of your data." },
                  { title: "Export‑Ready", icon: Download, desc: "Clean PDF in one click." },
                ].map((feature) => (
                  <Card key={feature.title} style={{ background: "#FFFFFF", borderColor: "#D9E6F5", borderRadius: 14, boxShadow: "0 10px 30px rgba(15, 30, 60, 0.08)" }}>
                    <CardHeader className="space-y-2">
                      <feature.icon className="h-5 w-5" style={{ color: "#006EDC" }} />
                      <CardTitle className="text-base" style={{ color: "#0B2B4B" }}>{feature.title}</CardTitle>
                      <div className="text-sm" style={{ color: "#6B7C93" }}>{feature.desc}</div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border p-4" style={{ background: "#FFFFFF", borderColor: "#D9E6F5", boxShadow: "0 16px 60px rgba(15, 30, 60, 0.14)" }}>
              <img
                src="/resutailor%20ats%20resume%20template.jpeg"
                alt="ResuTailor ATS Resume Template"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: "#0B2B4B" }}>Everything you need. Nothing you don’t.</h2>
            <p className="mt-3" style={{ color: "#2E5D87" }}>
              A focused experience designed to produce one clean, ATS‑ready resume every time.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Live Editor", desc: "Adjust sections, bullets, and typography with instant preview." },
              { title: "Keyword Matching", desc: "See matched and missing keywords and add them in one click." },
              { title: "Project Bullet Control", desc: "Generate 3–4 project bullets with no fluff or metrics." },
              { title: "One‑Click PDF", desc: "Export a polished PDF that mirrors the preview." },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "#0B2B4B" }}>{feature.title}</h3>
                  <p style={{ color: "#6B7C93" }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/generate" className="inline-flex items-center gap-2 font-medium hover:opacity-80 transition" style={{ color: "#006EDC" }}>
              Start tailoring now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="text-white py-20" style={{ background: "#006EDC" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
            Preview for free. Pay only when you want a clean export.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { price: "$9", label: "Single Export", desc: "One ATS‑optimized PDF download." },
              { price: "$15", label: "Monthly Unlimited", desc: "Unlimited exports for 30 days." },
              { price: "$29", label: "Lifetime Access", desc: "Unlimited exports forever." },
            ].map((plan, idx) => (
              <Card
                key={plan.label}
                className={`text-white ${idx === 1 ? "ring-2 ring-white/40" : ""}`}
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  background: idx === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  borderRadius: 18,
                }}
              >
                <CardHeader>
                  <CardTitle className="text-3xl">{plan.price}</CardTitle>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>{plan.label}</div>
                </CardHeader>
                <CardContent style={{ color: "rgba(255,255,255,0.8)" }}>{plan.desc}</CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View Pricing Details
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#0B2B4B" }}>Ready for a resume that passes ATS?</h2>
          <p className="mb-8" style={{ color: "#2E5D87" }}>
            Upload your resume, paste the job description, and export a clean ATS‑ready PDF in minutes.
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-[14px] font-semibold hover:opacity-95 transition"
              style={{
                background: "#006EDC",
                color: "#FFFFFF",
                boxShadow: "0 8px 20px rgba(0, 110, 220, 0.18)",
              }}
            >
              Build My ATS Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ background: "#F5F9FC", borderColor: "#D9E6F5" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold" style={{ color: "#0B2B4B" }}>
              Resu<span style={{ color: "#006EDC" }}>Tailor</span>
            </div>
            <div className="flex gap-6" style={{ color: "#6B7C93" }}>
              <Link href="/resume-templates" className="hover:text-gray-900">Templates</Link>
              <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            </div>
            <div className="text-sm" style={{ color: "#6B7C93" }}>
              © 2025 ResuTailor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
