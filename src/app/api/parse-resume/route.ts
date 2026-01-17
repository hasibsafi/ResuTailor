import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, cleanResumeText } from "@/lib/resume-parser";
import { parseResumeText } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, file.name);
    const cleanedText = cleanResumeText(rawText);

    if (cleanedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please try a different file or format." },
        { status: 400 }
      );
    }

    // Parse resume using OpenAI - now returns { resume, warnings, needsReview }
    const parseResult = await parseResumeText(cleanedText);

    return NextResponse.json({
      success: true,
      parsedResume: parseResult.resume,
      extractedText: cleanedText,
      warnings: parseResult.warnings,
      needsReview: parseResult.needsReview,
    });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse resume" },
      { status: 500 }
    );
  }
}
