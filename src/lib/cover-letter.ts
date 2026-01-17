import { TailoredResume } from "@/types/resume";

export type CoverLetterFields = {
  name: string;
  contactLine: string;
  dateLine: string;
  salutation: string;
  body: string[];
};

export type CoverLetterStyles = {
  name: { fontFamily: string; fontSize: number };
  contactLine: { fontFamily: string; fontSize: number };
  dateLine: { fontFamily: string; fontSize: number };
  salutation: { fontFamily: string; fontSize: number };
  body: { fontFamily: string; fontSize: number };
};

const DEFAULT_STYLES: CoverLetterStyles = {
  name: { fontFamily: "ui-serif, Georgia, serif", fontSize: 18 },
  contactLine: { fontFamily: "ui-serif, Georgia, serif", fontSize: 11 },
  dateLine: { fontFamily: "ui-serif, Georgia, serif", fontSize: 11 },
  salutation: { fontFamily: "ui-serif, Georgia, serif", fontSize: 12 },
  body: { fontFamily: "ui-serif, Georgia, serif", fontSize: 12 },
};

export function buildCoverLetterFields(params: {
  resume: TailoredResume;
  coverLetter: string;
}): CoverLetterFields {
  const { resume, coverLetter } = params;
  const contactLine = [
    resume.contact.name,
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github,
  ]
    .filter(Boolean)
    .join(" · ");

  const paragraphs = coverLetter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const dropIfStartsWith = (value: string, patterns: RegExp[]) => {
    if (paragraphs.length === 0) return;
    if (patterns.some((pattern) => pattern.test(paragraphs[0]))) {
      paragraphs.shift();
      if (value && paragraphs[0] === value) {
        paragraphs.shift();
      }
    }
  };

  const dropIfEndsWith = (value: string | null, patterns: RegExp[]) => {
    if (paragraphs.length === 0) return;
    const lastIndex = paragraphs.length - 1;
    if (patterns.some((pattern) => pattern.test(paragraphs[lastIndex]))) {
      paragraphs.pop();
      if (value && paragraphs[paragraphs.length - 1] === value) {
        paragraphs.pop();
      }
    }
  };

  const salutation = "Dear Hiring Manager,";
  const signature = resume.contact.name;

  dropIfStartsWith(salutation, [/^dear\s/i]);
  dropIfEndsWith(signature, [
    /^sincerely[,\s]*$/i,
    /^best[,\s]*$/i,
    /^kind regards[,\s]*$/i,
    /^thanks[,\s]*$/i,
  ]);
  dropIfEndsWith(null, [
    /^sincerely[,\s]*$/i,
    /^best[,\s]*$/i,
    /^kind regards[,\s]*$/i,
    /^thanks[,\s]*$/i,
  ]);

  return {
    name: resume.contact.name,
    contactLine,
    dateLine: new Date().toLocaleDateString(),
    salutation,
    body: paragraphs.length > 0 ? paragraphs : ["", ""],
  };
}

export function generateCoverLetterHTML(params: {
  resume: TailoredResume;
  coverLetter?: string;
  fields?: CoverLetterFields;
  styles?: Partial<CoverLetterStyles>;
  preview?: boolean;
}) {
  const { resume, coverLetter, fields, styles } = params;
  const preview = params.preview === true;
  const derivedFields = fields || (coverLetter ? buildCoverLetterFields({ resume, coverLetter }) : null);
  if (!derivedFields) {
    throw new Error("Cover letter content not provided");
  }

  const mergedStyles = {
    ...DEFAULT_STYLES,
    ...styles,
  };

  const bodyHtml = derivedFields.body
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page {
          size: Letter;
          margin: 0.8in 0.8in 0.8in 0.8in;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          color: #111827;
          line-height: 1.5;
          ${preview ? "padding: 48px; background: #f3f4f6;" : "padding: 0; background: white;"}
        }
        .container {
          width: 100%;
          background: white;
          ${preview ? "padding: 48px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);" : ""}
        }
        header {
          margin-bottom: 20px;
        }
        .contact {
          color: #4b5563;
        }
        .letter p {
          margin-bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1 style="font-family: ${mergedStyles.name.fontFamily}; font-size: ${mergedStyles.name.fontSize}pt; font-weight: 700; letter-spacing: 0.03em; margin-bottom: 6px;">
            ${derivedFields.name}
          </h1>
          <div class="contact" style="font-family: ${mergedStyles.contactLine.fontFamily}; font-size: ${mergedStyles.contactLine.fontSize}pt;">
            ${derivedFields.contactLine}
          </div>
        </header>
        <div style="font-family: ${mergedStyles.dateLine.fontFamily}; font-size: ${mergedStyles.dateLine.fontSize}pt; margin-bottom: 16px;">
          ${derivedFields.dateLine}
        </div>
        <div style="font-family: ${mergedStyles.salutation.fontFamily}; font-size: ${mergedStyles.salutation.fontSize}pt; margin-bottom: 12px;">
          ${derivedFields.salutation}
        </div>
        <section class="letter" style="font-family: ${mergedStyles.body.fontFamily}; font-size: ${mergedStyles.body.fontSize}pt;">
          ${bodyHtml}
        </section>
      </div>
    </body>
    </html>
  `;
}
