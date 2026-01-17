import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES } from "@/types/resume";
import { FileText, ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Resume Templates | ResuTailor",
  description: "Choose from 4 professionally designed, ATS-friendly resume templates. Modern, Classic, Tech-Focused, and Executive styles available.",
};

export default function ResumeTemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Resu<span className="text-blue-600">Tailor</span>
            </Link>
          </div>
          <Link href="/generate">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Professional Resume Templates
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from 4 expertly designed templates, each optimized for applicant tracking systems
          and crafted to make your experience shine.
        </p>
      </section>

      {/* Templates Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {TEMPLATES.map((template) => (
            <Card key={template.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <FileText className="h-24 w-24 text-gray-400" />
                <div className="absolute bottom-4 right-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    ATS-Friendly
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription className="text-base">{template.description}</CardDescription>
                <Link
                  href={`/resume-template/${template.slug}`}
                  className="inline-flex items-center text-blue-600 hover:underline mt-4"
                >
                  View template details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">All Templates Include</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "ATS Optimization",
                desc: "Every template is designed with semantic HTML and proper formatting to pass applicant tracking systems.",
              },
              {
                title: "Print-Ready CSS",
                desc: "Perfect rendering for both screen preview and PDF export, ensuring your resume looks great everywhere.",
              },
              {
                title: "Responsive Design",
                desc: "Preview and edit your resume on any device. Our templates adapt to any screen size.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Your Resume?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Upload your resume, paste a job description, and let our AI tailor your content to perfection.
        </p>
        <Link href="/generate">
          <Button size="lg">
            Start Tailoring Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
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
