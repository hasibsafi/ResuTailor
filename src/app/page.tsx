"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Download, ArrowRight, CheckCircle, UserCircle, ShieldCheck, Zap, Clock, BadgeCheck, Star, Layers, Lock, ArrowUpRight } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Resu<span className="text-blue-600">Tailor</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#template" className="text-gray-600 hover:text-gray-900 transition">
              ATS Template
            </a>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>
            {user && (
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition">
                <span className="sr-only">Profile</span>
                <UserCircle className="h-6 w-6" />
              </Link>
            )}
            <Link href="/generate">
              <Button variant="outline">Get Started</Button>
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 text-blue-700 px-4 py-2 text-sm font-semibold mb-6">
                <Star className="h-4 w-4" />
                One ATS‑tested resume template
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The fastest way to a{" "}
                <span className="text-blue-600">screen‑passing resume</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Stop guessing templates. ResuTailor uses one proven ATS format and tailors your content to every job description with precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/generate">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Generate My Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    See Pricing
                  </Button>
                </Link>
              </div>
              <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  ATS‑safe layout
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  Tailored in minutes
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Instant preview
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 bg-blue-100 rounded-[32px] blur-2xl opacity-60" />
              <div className="relative bg-white rounded-2xl border shadow-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-blue-100 rounded-full" />
                    <div className="h-3 w-16 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-6 w-48 bg-gray-900/10 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-11/12 bg-gray-100 rounded" />
                    <div className="h-3 w-10/12 bg-gray-100 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-14 rounded-lg border bg-blue-50/60" />
                    <div className="h-14 rounded-lg border bg-blue-50/60" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-5/6 bg-gray-100 rounded" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">ATS</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Keywords</span>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">PDF</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-6 right-6 bg-white/90 border rounded-2xl shadow-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BadgeCheck className="h-5 w-5 text-blue-600" />
                  ATS‑verified structure • keyword‑aligned content • clean PDF export
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Metrics */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { label: "ATS‑tested format", value: "1 template" },
            { label: "Tailoring time", value: "< 2 minutes" },
            { label: "Export options", value: "PDF ready" },
          ].map((item) => (
            <Card key={item.label} className="border-dashed">
              <CardHeader>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
                <div className="text-sm text-gray-600">{item.label}</div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Single Template Highlight */}
      <section id="template" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-4">One template. Zero guesswork.</h2>
              <p className="text-gray-600 mb-6">
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
                  <Card key={feature.title} className="bg-white">
                    <CardHeader className="space-y-2">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <div className="text-sm text-gray-600">{feature.desc}</div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border shadow-lg p-4">
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
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything you need. Nothing you don’t.</h2>
            <p className="text-gray-600 mt-3">
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
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/generate" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              Start tailoring now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto">
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
                className={`border-white/20 text-white ${idx === 1 ? "bg-white/20 ring-2 ring-white/40" : "bg-white/10"}`}
              >
                <CardHeader>
                  <CardTitle className="text-3xl">{plan.price}</CardTitle>
                  <div className="text-blue-100">{plan.label}</div>
                </CardHeader>
                <CardContent className="text-blue-50">{plan.desc}</CardContent>
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
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready for a resume that passes ATS?</h2>
          <p className="text-gray-600 mb-8">
            Upload your resume, paste the job description, and export a clean ATS‑ready PDF in minutes.
          </p>
          <Link href="/generate">
            <Button size="lg" className="text-lg px-8 py-6">
              Build My ATS Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold text-gray-900">
              Resu<span className="text-blue-600">Tailor</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <Link href="/resume-templates" className="hover:text-gray-900">Templates</Link>
              <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 ResuTailor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
