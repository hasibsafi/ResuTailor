import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { TailoredResume, DesignOptions, TemplateSlug } from "@/types/resume";
import { generateResumeHTML } from "@/components/resume-templates/ResumeTemplateServer";

export async function POST(request: NextRequest) {
  try {
    const { resume, designOptions, template, fileName } = await request.json();
    
    if (!resume) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    const options: DesignOptions = designOptions || {
      headerAlignment: 'left',
      marginSize: 'medium',
      fontFamily: 'sans',
      fontSize: 13.5,
      lineHeight: 1.4,
      headingColor: 'black',
    };

    // Generate HTML using the server template (mirrors React template exactly)
    const fullHTML = generateResumeHTML({
      resume: resume as TailoredResume,
      template: (template || 'classic-ats') as TemplateSlug,
      designOptions: options,
    });

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match the PDF dimensions at 96 DPI (browser standard)
    // 8.5in x 11in = 816px x 1056px
    await page.setViewport({
      width: 816,
      height: 1056,
      deviceScaleFactor: 1,
    });
    
    // Set content with the generated HTML
    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
    
    // Generate PDF - margins are handled by @page CSS rules in the HTML
    // Use preferCSSPageSize: true to respect our @page { size: Letter } rule
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    
    await browser.close();
    
    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBuffer);
    
    // Return PDF as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'resume.pdf'}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
