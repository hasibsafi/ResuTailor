import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/openai";
import { TailoredResumeSchema } from "@/types/resume";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tailoredResume, jobDescription } = body;

    if (!tailoredResume) {
      return NextResponse.json(
        { error: "Tailored resume is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: "Job description must be at least 50 characters" },
        { status: 400 }
      );
    }

    const resumeResult = TailoredResumeSchema.safeParse(tailoredResume);
    if (!resumeResult.success) {
      return NextResponse.json(
        { error: "Invalid tailored resume data" },
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
