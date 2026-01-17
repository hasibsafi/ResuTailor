import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";

export default function PricingPage() {
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
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Preview unlimited resumes for free. Only pay when you want to download.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Try before you buy</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Unlimited resume previews",
                  "All 4 templates",
                  "Match insights",
                  "Watermarked PDF",
                  "Basic support",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/generate" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Single Export */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Single Export</CardTitle>
              <CardDescription>Perfect for one application</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Everything in Free",
                  "1 clean PDF download",
                  "No watermark",
                  "Print-ready quality",
                  "Email support",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/generate" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Monthly */}
          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <CardHeader>
              <CardTitle>Monthly Unlimited</CardTitle>
              <CardDescription>For active job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Everything in Single",
                  "Unlimited exports",
                  "Unlimited generations",
                  "Priority support",
                  "Cancel anytime",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/generate" className="block mt-6">
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Lifetime */}
        <div className="max-w-xl mx-auto mt-8">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">Lifetime Access</CardTitle>
                  <CardDescription className="text-gray-300">
                    Pay once, use forever
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-400 ml-2">one-time</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {[
                  "Unlimited exports forever",
                  "All future features",
                  "Premium support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/generate" className="block mt-6">
                <Button variant="secondary" className="w-full">
                  Get Lifetime Access
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I preview my resume before paying?",
                a: "Yes! You can generate and preview unlimited resumes for free. You only pay when you want to download a clean, watermark-free PDF.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe payment processor.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel your monthly subscription at any time. You'll continue to have access until the end of your billing period.",
              },
              {
                q: "Is my resume data secure?",
                a: "Absolutely. Your resume data is encrypted in transit and at rest. We never share your personal information with third parties.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
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
