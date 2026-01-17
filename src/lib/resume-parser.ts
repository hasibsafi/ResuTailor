import mammoth from "mammoth";

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return extractFromPdf(buffer);
    case "docx":
    case "doc":
      return extractFromDocx(buffer);
    case "txt":
      return buffer.toString("utf-8");
    default:
      throw new Error("Unsupported file format: ." + extension);
  }
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Import the internal module directly to avoid the test file issue
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file. Please ensure it's a valid PDF.");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file. Please ensure it's a valid Word document.");
  }
}

// Clean up extracted text while preserving structure
export function cleanResumeText(text: string): string {
  return text
    // Normalize line breaks first
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Replace tabs with spaces
    .replace(/\t/g, " ")
    // Remove excessive spaces within lines (but not newlines)
    .replace(/[^\S\n]+/g, " ")
    // Remove multiple consecutive newlines (keep max 2)
    .replace(/\n{3,}/g, "\n\n")
    // Trim each line
    .split("\n")
    .map(line => line.trim())
    .join("\n")
    // Final trim
    .trim();
}
