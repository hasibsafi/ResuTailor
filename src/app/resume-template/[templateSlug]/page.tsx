import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES, TemplateSlug, TemplateSlugSchema } from "@/types/resume";
import { ArrowLeft, FileText, Check, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ templateSlug: string }>;
}

export async function generateStaticParams() {
  return TEMPLATES.map((template) => ({
    templateSlug: template.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { templateSlug } = await params;
  const template = TEMPLATES.find((t) => t.slug === templateSlug);
  
  if (!template) {
    return {
      title: "Template Not Found | ResuTailor",
    };
  }

  return {
    title: `${template.name} Resume Template | ResuTailor`,
    description: template.description,
  };
}

const templateFeatures: Record<TemplateSlug, string[]> = {
  "modern-professional": [
    "Clean, contemporary design with subtle accent colors",
    "Perfect for corporate and business roles",
    "Optimized spacing for readability",
    "Professional blue accent color scheme",
    "Clear section hierarchy",
  ],
  "classic-ats": [
    "Traditional format for maximum ATS compatibility",
    "Simple, clean structure that parses perfectly",
    "Ideal for conservative industries",
    "No graphics or complex formatting",
    "Proven layout trusted by recruiters",
  ],
  "tech-focused": [
    "Designed specifically for developers and engineers",
    "Prominent skills and technologies section",
    "Projects section with tech stack highlights",
    "GitHub and portfolio link integration",
    "Modern monospace font accents",
  ],
};

const templateBestFor: Record<TemplateSlug, string[]> = {
  "modern-professional": ["Business Analysts", "Marketing Professionals", "Project Managers", "Consultants"],
  "classic-ats": ["Large Corporations", "Government Positions", "Traditional Industries", "Career Changers"],
  "tech-focused": ["Software Engineers", "Data Scientists", "DevOps Engineers", "Technical Architects"],
};

export default async function TemplateDetailPage({ params }: PageProps) {
  const { templateSlug } = await params;
  
  // Validate the slug
  const parseResult = TemplateSlugSchema.safeParse(templateSlug);
  if (!parseResult.success) {
    notFound();
  }

  const validSlug = parseResult.data;
  const template = TEMPLATES.find((t) => t.slug === validSlug);

  if (!template) {
    notFound();
  }

  const features = templateFeatures[validSlug];
  const bestFor = templateBestFor[validSlug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/resume-templates" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Resu<span className="text-blue-600">Tailor</span>
            </Link>
          </div>
          <Link href="/generate">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ATS-Friendly
            </Badge>
            <Badge variant="secondary">Free</Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{template.name}</h1>
          <p className="text-xl text-gray-600">{template.description}</p>
        </div>
      </section>

      {/* Template Preview & Details */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Preview */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Template Preview</p>
                  <p className="text-sm text-gray-400 mt-1">Full preview available after generation</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Features */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Template Features</h2>
              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Best For */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Best For</h2>
              <div className="flex flex-wrap gap-2">
                {bestFor.map((role, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {role}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* CTA */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-lg font-semibold mb-2">Ready to Get Started?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Upload your resume and job description, and we&apos;ll tailor your resume using this template.
              </p>
              <Link href="/generate" className="block">
                <Button className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Tailored Resume
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Other Templates */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Explore Other Templates</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TEMPLATES.filter((t) => t.slug !== validSlug).map((t) => (
              <Link key={t.slug} href={`/resume-template/${t.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} ResuTailor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
