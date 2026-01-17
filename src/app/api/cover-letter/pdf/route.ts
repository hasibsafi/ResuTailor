import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { TailoredResume } from "@/types/resume";
import { generateCoverLetterHTML, CoverLetterFields, CoverLetterStyles } from "@/lib/cover-letter";

export async function POST(request: NextRequest) {
  try {
    const { resume, coverLetter, fileName, coverLetterFields, coverLetterStyles } = await request.json();

    if (!resume || (!coverLetter && !coverLetterFields)) {
      return NextResponse.json(
        { error: "Resume and cover letter are required" },
        { status: 400 }
      );
    }

    const html = generateCoverLetterHTML({
      resume: resume as TailoredResume,
      coverLetter: coverLetter ? String(coverLetter) : undefined,
      fields: coverLetterFields as CoverLetterFields | undefined,
      styles: coverLetterStyles as Partial<CoverLetterStyles> | undefined,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });

    await browser.close();

    const buffer = Buffer.from(pdfBuffer);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "cover-letter.pdf"}"`,
      },
    });
  } catch (error) {
    console.error("Error generating cover letter PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
