import { NextRequest, NextResponse } from "next/server";
import { tailorResume, extractJobDescription } from "@/lib/openai";
import { ParsedResumeSchema, TemplateSlugSchema } from "@/types/resume";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parsedResume, jobDescription, templateSlug, selectedKeywords } = body;

    // Validate inputs
    if (!parsedResume) {
      return NextResponse.json(
        { error: "Parsed resume is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: "Job description must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Validate template
    const templateResult = TemplateSlugSchema.safeParse(templateSlug);
    if (!templateResult.success) {
      return NextResponse.json(
        { error: "Invalid template selected" },
        { status: 400 }
      );
    }

    // Validate parsed resume structure
    const resumeResult = ParsedResumeSchema.safeParse(parsedResume);
    if (!resumeResult.success) {
      console.error("Resume validation errors:", resumeResult.error.issues);
      const errorMessages = resumeResult.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      ).join("; ");
      return NextResponse.json(
        { error: `Invalid resume data: ${errorMessages}` },
        { status: 400 }
      );
    }

    // Extract job description signals
    const extractedJd = await extractJobDescription(jobDescription);

    // Tailor the resume with selected keywords
    const tailoredResume = await tailorResume(
      resumeResult.data, 
      extractedJd,
      selectedKeywords || []
    );

    // Generate a unique ID for this generation
    const generationId = randomUUID();

    // TODO: Save to database with Firebase user ID
    // For now, return the tailored resume directly

    return NextResponse.json({
      success: true,
      generationId,
      tailoredResume,
      extractedJobDescription: extractedJd,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate resume" },
      { status: 500 }
    );
  }
}
