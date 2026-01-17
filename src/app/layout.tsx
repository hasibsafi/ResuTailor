import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResuTailor - Tailor Your Resume to Any Job Instantly",
  description: "Upload your resume, paste a job description, choose a template. Get a perfectly tailored, ATS-friendly resume in seconds.",
  keywords: ["resume", "resume builder", "ATS resume", "job application", "resume tailoring", "AI resume"],
  openGraph: {
    title: "ResuTailor - Tailor Your Resume to Any Job Instantly",
    description: "Upload your resume, paste a job description, choose a template. Get a perfectly tailored, ATS-friendly resume in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
