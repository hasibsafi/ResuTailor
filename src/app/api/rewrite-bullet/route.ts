import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REWRITE_SYSTEM_PROMPT = `You are an expert resume bullet point writer. Your job is to rewrite a single resume bullet point based on the user's instructions.

Rules:
- Return ONLY the rewritten bullet point text. No quotes, no explanation, no preamble.
- Start with a strong action verb.
- Keep it concise (ideally one sentence, max two).
- Use specific, measurable language when possible.
- If job description context is provided, align terminology and keywords to it.
- Preserve the truthful content — do not invent metrics, tools, or accomplishments that weren't implied.
- Do not add bullet markers (•, -, *) — return plain text only.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bulletText, userPrompt, jobDescription } = body;

    if (!bulletText || typeof bulletText !== "string") {
      return NextResponse.json(
        { error: "bulletText is required" },
        { status: 400 }
      );
    }

    if (!userPrompt || typeof userPrompt !== "string") {
      return NextResponse.json(
        { error: "userPrompt is required" },
        { status: 400 }
      );
    }

    let userMessage = `Current bullet point:\n"${bulletText}"\n\nRewrite instruction:\n${userPrompt}`;

    if (jobDescription && typeof jobDescription === "string" && jobDescription.length > 30) {
      userMessage += `\n\nJob description context (align keywords/terminology to this):\n${jobDescription}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      temperature: 0.5,
      max_completion_tokens: 300,
      messages: [
        { role: "system", content: REWRITE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const rewrittenBullet = completion.choices[0]?.message?.content?.trim() || "";

    if (!rewrittenBullet) {
      return NextResponse.json(
        { error: "Failed to generate rewritten bullet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rewrittenBullet });
  } catch (error) {
    console.error("Rewrite bullet error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to rewrite bullet",
      },
      { status: 500 }
    );
  }
}
