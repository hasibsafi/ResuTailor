"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES } from "@/types/resume";
import { FileText, Sparkles, Download, ArrowRight, CheckCircle } from "lucide-react";
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
            <Link href="/resume-templates" className="text-gray-600 hover:text-gray-900 transition">
              Templates
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>
            {user && (
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition">
                Profile
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
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Tailor your resume to any job —{" "}
            <span className="text-blue-600">instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your resume, paste a job description, choose a template. 
            Get a perfectly tailored, ATS-friendly resume in seconds.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/generate">
              <Button size="lg" className="text-lg px-8 py-6">
                Generate My Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/resume-templates">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Upload Your Resume</h3>
            <p className="text-gray-600">
              Upload your existing resume in PDF or DOCX format. We'll extract all your experience.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Paste Job Description</h3>
            <p className="text-gray-600">
              Paste the job description and select a template. Our AI tailors your content.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Download & Apply</h3>
            <p className="text-gray-600">
              Preview your tailored resume and download as a beautiful, ATS-optimized PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Beautiful, ATS-Friendly Templates</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose from 4 professionally designed templates, each optimized for applicant tracking systems.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TEMPLATES.map((template) => (
              <Card key={template.slug} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-4 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/resume-templates">
              <Button variant="outline" size="lg">
                Explore All Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why ResuTailor?</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { title: "ATS-Optimized", desc: "Every template is designed to pass applicant tracking systems." },
            { title: "No Invented Content", desc: "We never fabricate skills or experience. Only your real qualifications." },
            { title: "Instant Preview", desc: "See your tailored resume in real-time before downloading." },
            { title: "Keyword Matching", desc: "See which keywords from the job description are matched in your resume." },
            { title: "Multiple Formats", desc: "Download as PDF or share via link." },
            { title: "Privacy First", desc: "Your data is encrypted and never shared with third parties." },
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Free, Pay When You're Ready</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Preview unlimited resumes for free. Only pay when you want to download a clean, 
            watermark-free PDF.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold">$9</div>
              <div className="text-blue-200">Single Export</div>
            </div>
            <div>
              <div className="text-4xl font-bold">$15</div>
              <div className="text-blue-200">Monthly Unlimited</div>
            </div>
            <div>
              <div className="text-4xl font-bold">$29</div>
              <div className="text-blue-200">Lifetime Access</div>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              View Pricing Details
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Join thousands of job seekers who've landed interviews with perfectly tailored resumes.
        </p>
        <Link href="/generate">
          <Button size="lg" className="text-lg px-8 py-6">
            Generate My Resume Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
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
