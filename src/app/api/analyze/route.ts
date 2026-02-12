import { NextRequest, NextResponse } from "next/server";
import { extractJobDescription } from "@/lib/openai";
import { ParsedResumeSchema } from "@/types/resume";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYZE_KEYWORDS_PROMPT = `You are a keyword matching expert. Analyze the resume against the job description to identify keywords.

CRITICAL RULES:
- ONLY return keywords that ACTUALLY APPEAR in the job description text.
- Do NOT invent or suggest keywords that are not explicitly mentioned in the job description.
- If the job description is vague, short, or nonsensical, return fewer or zero keywords. Do NOT pad the lists.

TWO CATEGORIES:

TECHNICAL KEYWORDS (for the Skills section):
- Programming languages, frameworks, libraries, tools, platforms, databases, methodologies, certifications
- ONLY if they appear in the job description

SOFT SKILLS (to weave into experience/summary):
- Communication, leadership, teamwork, problem-solving, collaboration, etc.
- ONLY if they appear in the job description

For each category, identify:
1. matched: Keywords found in BOTH the resume AND the job description
2. missing: Keywords found in the job description but NOT in the resume

Output ONLY valid JSON:
{
  "technical": {
    "matched": ["React", "TypeScript", ...],
    "missing": ["Kubernetes", ...]
  },
  "soft": {
    "matched": ["collaboration", ...],
    "missing": ["stakeholder management", ...]
  }
}

If the job description contains no identifiable keywords, return empty arrays.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parsedResume, jobDescription } = body;

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

    // Validate parsed resume structure
    const resumeResult = ParsedResumeSchema.safeParse(parsedResume);
    if (!resumeResult.success) {
      console.error("Resume validation errors:", resumeResult.error.issues);
      return NextResponse.json(
        { error: "Invalid resume data structure" },
        { status: 400 }
      );
    }

    // Extract job description signals
    const extractedJd = await extractJobDescription(jobDescription);

    // Analyze keywords
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ANALYZE_KEYWORDS_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            resume: resumeResult.data,
            jobDescription: extractedJd,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const analysis = JSON.parse(content);

    return NextResponse.json({
      success: true,
      // New categorized structure
      technicalKeywords: {
        matched: analysis.technical?.matched || [],
        missing: analysis.technical?.missing || [],
      },
      softKeywords: {
        matched: analysis.soft?.matched || [],
        missing: analysis.soft?.missing || [],
      },
      // Legacy flat arrays for backwards compatibility
      matchedKeywords: [
        ...(analysis.technical?.matched || []),
        ...(analysis.soft?.matched || []),
      ],
      missingKeywords: [
        ...(analysis.technical?.missing || []),
        ...(analysis.soft?.missing || []),
      ],
      extractedJobDescription: extractedJd,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
