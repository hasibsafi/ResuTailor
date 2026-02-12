import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/openai";
import { TailoredResumeSchema, ParsedResumeSchema } from "@/types/resume";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tailoredResume, resume, jobDescription } = body;
    const resumeInput = tailoredResume ?? resume;

    if (!resumeInput) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.length < 30) {
      return NextResponse.json(
        { error: "Job description must be at least 30 characters" },
        { status: 400 }
      );
    }

    const sanitizeContact = (input: Record<string, unknown>) => {
      if (!input || typeof input !== "object") return;
      const contact = input.contact as Record<string, unknown> | undefined;
      if (!contact || typeof contact !== "object") return;
      if (typeof contact.email === "string") {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
        if (!emailOk) delete contact.email;
      }
      ["phone", "location"].forEach((field) => {
        const value = contact[field];
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (!trimmed || trimmed.toLowerCase() === "unknown") {
            delete contact[field];
          } else {
            contact[field] = trimmed;
          }
        }
      });
      const normalizeUrl = (value: unknown) => {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const first = trimmed.split(/[\s|,]+/).filter(Boolean)[0];
        if (!first) return undefined;
        const withoutScheme = first.replace(/^https?:\/\//i, "");
        if (!withoutScheme.includes(".")) return undefined;
        return withoutScheme;
      };
      const linkedin = normalizeUrl(contact.linkedin);
      const github = normalizeUrl(contact.github);
      const website = normalizeUrl(contact.website);
      if (linkedin) contact.linkedin = linkedin; else delete contact.linkedin;
      if (github) contact.github = github; else delete contact.github;
      if (website) contact.website = website; else delete contact.website;
    };

    sanitizeContact(resumeInput as Record<string, unknown>);

    let resumeResult = TailoredResumeSchema.safeParse(resumeInput);
    if (!resumeResult.success) {
      const parsedResult = ParsedResumeSchema.safeParse(resumeInput);
      if (!parsedResult.success) {
        return NextResponse.json(
          {
            error: "Invalid resume data",
            details: parsedResult.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }
      resumeResult = TailoredResumeSchema.safeParse({
        ...parsedResult.data,
        summary: parsedResult.data.summary || "",
        skills: parsedResult.data.skills || {},
      });
    }

    if (!resumeResult.success) {
      return NextResponse.json(
        {
          error: "Invalid resume data",
          details: resumeResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetter(resumeResult.data, jobDescription);

    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
