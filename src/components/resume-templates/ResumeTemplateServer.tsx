// Server-compatible resume template component for PDF generation
// This is a simplified version without React hooks or client-side features

import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS, TemplateSlug } from "@/types/resume";

type AccentColor = "purple" | "blue" | "teal" | "rose" | "amber";

const ACCENT_COLORS_MAP: Record<AccentColor, { name: string; primary: string; light: string; text: string }> = {
  purple: { name: "Purple", primary: "#8B5CF6", light: "#ede9fe", text: "#5b21b6" },
  blue: { name: "Blue", primary: "#2563EB", light: "#dbeafe", text: "#1e40af" },
  teal: { name: "Teal", primary: "#0D9488", light: "#ccfbf1", text: "#0f766e" },
  rose: { name: "Rose", primary: "#E11D48", light: "#ffe4e6", text: "#be123c" },
  amber: { name: "Amber", primary: "#D97706", light: "#fef3c7", text: "#b45309" },
};

interface ServerTemplateProps {
  resume: TailoredResume;
  template: TemplateSlug;
  accentColor?: AccentColor;
  designOptions?: DesignOptions;
}

export function generateResumeHTML({
  resume,
  template,
  accentColor = "purple",
  designOptions = DEFAULT_DESIGN_OPTIONS,
}: ServerTemplateProps): string {
  const fontFamily = FONT_FAMILIES.find(f => f.value === designOptions.fontFamily)?.css || FONT_FAMILIES[1].css;
  const padding = MARGIN_SIZES.find(m => m.value === designOptions.marginSize)?.padding || "2rem";
  const headingColor = HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.hex || "#111827";
  const accent = ACCENT_COLORS_MAP[accentColor];

  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 12;
  const defaultSectionTitleSize = baseFontSize + 4;
  const defaultSmallFontSize = baseFontSize - 2;

  // Section-specific font sizes (with fallbacks to defaults)
  const sectionFonts = designOptions.sectionFontSizes || {};
  const summaryTitleSize = sectionFonts.summaryTitle || defaultSectionTitleSize;
  const summaryTextSize = sectionFonts.summaryText || defaultSmallFontSize;
  const skillsTitleSize = sectionFonts.skillsTitle || defaultSectionTitleSize;
  const skillsTextSize = sectionFonts.skillsText || defaultSmallFontSize;
  const projectSectionTitleSize = sectionFonts.projectSectionTitle || defaultSectionTitleSize;
  const projectTitleSize = sectionFonts.projectTitle || baseFontSize;
  const projectDescSize = sectionFonts.projectDescription || defaultSmallFontSize;
  const experienceTitleSize = sectionFonts.experienceTitle || defaultSectionTitleSize;
  const experienceTextSize = sectionFonts.experienceText || defaultSmallFontSize;
  const experienceCompanySize = sectionFonts.experienceCompany || baseFontSize + 2;
  const experienceRoleSize = sectionFonts.experienceRole || baseFontSize;
  const educationTitleSize = sectionFonts.educationTitle || defaultSectionTitleSize;
  const educationTextSize = sectionFonts.educationText || defaultSmallFontSize;

  // Section order
  const sectionOrder = designOptions.sectionOrder || ["summary", "skills", "projects", "experience", "education", "certifications"];

  // Skill category custom names
  const skillCategoryNames = designOptions.skillCategoryNames || {};

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (key: keyof NonNullable<typeof designOptions.sectionFontFamilies>): string => {
    const familyValue = sectionFontFamilies[key] || designOptions.fontFamily;
    return FONT_FAMILIES.find(f => f.value === familyValue)?.css || fontFamily;
  };

  // Alignment styles - match Tailwind exactly
  const alignmentStyle = {
    left: "text-align: left;",
    center: "text-align: center;",
    right: "text-align: right;",
  }[designOptions.headerAlignment];

  const contactJustify = {
    left: "justify-content: flex-start;",
    center: "justify-content: center;",
    right: "justify-content: flex-end;",
  }[designOptions.headerAlignment];

  // Template-specific colors
  const templateColors: Record<TemplateSlug, { primary: string; border: string }> = {
    "classic-ats": { primary: headingColor, border: headingColor },
    "modern-professional": { primary: headingColor, border: headingColor },
    "tech-focused": { primary: accent.primary, border: accent.primary },
  };
  const colors = templateColors[template];

  // Generate contact info - matching template exactly
  function generateContactInfo(): string {
    const items: string[] = [];
    if (resume.contact.email) items.push(resume.contact.email);
    if (resume.contact.phone) items.push(`| ${resume.contact.phone}`);
    if (resume.contact.location) items.push(`| ${resume.contact.location}`);
    if (resume.contact.linkedin) items.push(`| ${resume.contact.linkedin}`);
    if (resume.contact.github) items.push(`| ${resume.contact.github}`);
    
    return items.map(item => `<span>${item}</span>`).join(' ');
  }

  // Helper to generate template-specific header - matching ClassicATS exactly
  // Template uses: mb-4 pb-3 = 16px margin-bottom, 12px padding-bottom
  function generateHeader(): string {
    if (template === "tech-focused") {
      return `
        <header style="background: ${accent.primary}; color: white; padding: 16px ${padding}; margin: calc(-1 * ${padding}) calc(-1 * ${padding}) 16px calc(-1 * ${padding});">
          <h1 style="font-size: ${nameFontSize}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; ${alignmentStyle}">
            ${resume.contact.name}
          </h1>
          <div style="margin-top: 4px; ${alignmentStyle} font-size: ${defaultSmallFontSize}px; color: rgba(255,255,255,0.9);">
            ${generateContactInfo()}
          </div>
        </header>
      `;
    }

    const headerBorderStyle = `border-bottom: 2px solid ${colors.border};`;

    // Match template: mb-4 (16px) pb-3 (12px)
    return `
      <header style="${alignmentStyle} margin-bottom: 16px; padding-bottom: 12px; ${headerBorderStyle}">
        <h1 style="font-size: ${nameFontSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 0.05em;">
          ${resume.contact.name}
        </h1>
        <div style="margin-top: 4px; font-size: ${defaultSmallFontSize}px; color: #000;">
          ${generateContactInfo()}
        </div>
      </header>
    `;
  }

  // Helper to generate section title - matching template exactly
  // Template uses: mb-1.5 pb-0.5 = 6px margin-bottom, 2px padding-bottom
  function sectionTitle(title: string, fontSize: number = defaultSectionTitleSize): string {
    let borderStyle = `border-bottom: 1px solid ${colors.border};`;
    if (template === "tech-focused") {
      borderStyle = `border-bottom: 2px solid ${accent.light};`;
    } else if (template === "modern-professional") {
      borderStyle = "";
    }

    return `
      <h2 style="font-size: ${fontSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; ${borderStyle}">
        ${title}
      </h2>
    `;
  }

  // Summary section - matching template mb-3 = 12px
  function generateSummary(): string {
    if (!resume.summary) return "";

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${summaryTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('summaryTitle')}; border-bottom: 1px solid ${colors.border};">
          Professional Summary
        </h2>
        <p style="font-size: ${summaryTextSize}px; font-family: ${getFontFamily('summaryText')};">${resume.summary}</p>
      </section>
    `;
  }

  // Experience section - matching template EXACTLY
  // Template uses: mb-3 section, mb-2 per item (8px), mt-0.5 list (2px), list-disc list-inside
  function generateExperience(): string {
    if (!resume.experience || resume.experience.length === 0) return "";

    const expItems = resume.experience.map(exp => {
      // Use list-style-position: outside so wrapped text aligns with first line text
      const highlights = exp.highlights && exp.highlights.length > 0
        ? `<ul style="margin-top: 2px; font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')}; list-style-type: disc; list-style-position: outside; padding-left: 1.2em;">
            ${exp.highlights.map(h => `<li style="padding-left: 0.3em;">${h}</li>`).join('')}
           </ul>`
        : "";

      if (template === "classic-ats") {
        // Classic ATS: Company first (bigger), Title underneath - matching template exactly
        return `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: 700; font-size: ${experienceCompanySize}px; font-family: ${getFontFamily('experienceCompany')};">${exp.company}</span>
              <span style="font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')};">${exp.startDate} - ${exp.endDate || "Present"}</span>
            </div>
            <div style="font-size: ${experienceRoleSize}px; font-weight: 600; font-family: ${getFontFamily('experienceRole')};">
              ${exp.title}${exp.location ? " | " + exp.location : ""}
            </div>
            ${highlights}
          </div>
        `;
      } else {
        // Other templates: Title | Company format
        const companyStyle = template === "modern-professional"
          ? `color: ${colors.primary}; font-style: italic;`
          : "font-style: italic;";

        return `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <span style="font-weight: 700;">${exp.title}</span>
                <span style="${companyStyle}"> | ${exp.company}</span>
              </div>
              <span style="font-size: ${experienceTextSize}px;">${exp.startDate} - ${exp.endDate || "Present"}</span>
            </div>
            ${highlights}
          </div>
        `;
      }
    }).join('');

    const sectionName = template === "classic-ats" ? "Professional Experience" : "Experience";

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${experienceTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('experienceTitle')}; border-bottom: 1px solid ${colors.border};">
          ${sectionName}
        </h2>
        ${expItems}
      </section>
    `;
  }

  // Education section - matching template mb-1.5 = 6px per item
  function generateEducation(): string {
    if (!resume.education || resume.education.length === 0) return "";

    const eduItems = resume.education.map(edu => `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-weight: 700;">${edu.degree}${edu.field ? ", " + edu.field : ""}</span>
          <span style="font-size: ${educationTextSize}px;">${edu.endDate || edu.startDate || ""}</span>
        </div>
        <div style="font-style: italic; font-size: ${educationTextSize}px;">
          ${edu.institution}${edu.location ? ", " + edu.location : ""}
        </div>
        ${edu.gpa ? `<div style="font-size: ${educationTextSize}px;">GPA: ${edu.gpa}</div>` : ""}
      </div>
    `).join('');

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${educationTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('educationTitle')}; border-bottom: 1px solid ${colors.border};">
          Education
        </h2>
        <div style="font-family: ${getFontFamily('educationText')};">
          ${eduItems}
        </div>
      </section>
    `;
  }

  // Skills section - comma-separated list of all technical skills (soft skills woven into content)
  function generateSkills(): string {
    if (!resume.skills) return "";

    // Combine all technical skills into a single comma-separated list (exclude soft skills)
    const allSkills = [
      ...(resume.skills.technical || []),
      ...(resume.skills.frameworks || []),
      ...(resume.skills.tools || []),
      ...(resume.skills.languages || []),
      ...(resume.skills.other || []),
    ].filter(Boolean);

    if (allSkills.length === 0) return "";

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${skillsTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('skillsTitle')}; border-bottom: 1px solid ${colors.border};">
          Skills
        </h2>
        <p style="font-size: ${skillsTextSize}px; font-family: ${getFontFamily('skillsText')};">
          ${allSkills.join(", ")}
        </p>
      </section>
    `;
  }

  // Projects section - matching template mb-1.5 = 6px per item
  function generateProjects(): string {
    if (!resume.projects || resume.projects.length === 0) return "";

    const projItems = resume.projects.map(proj => `
      <div style="margin-bottom: 6px;">
        <span style="font-weight: 700; font-size: ${projectTitleSize}px; font-family: ${getFontFamily('projectTitle')};">${proj.name}</span>
        ${proj.description ? `<div style="margin-top: 2px; font-size: ${projectDescSize}px; font-family: ${getFontFamily('projectDescription')};">${proj.description}</div>` : ""}
        ${proj.url ? `<div style="margin-top: 2px; font-size: ${projectDescSize}px; font-family: ${getFontFamily('projectDescription')};">
          Live demo: <a href="${proj.url.startsWith('http://') || proj.url.startsWith('https://') ? proj.url : `https://${proj.url}`}" target="_blank" rel="noreferrer" style="color: #1d4ed8; text-decoration: underline;">${proj.url}</a>
        </div>` : ""}
      </div>
    `).join('');

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${projectSectionTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('projectSectionTitle')}; border-bottom: 1px solid ${colors.border};">
          Projects
        </h2>
        ${projItems}
      </section>
    `;
  }

  // Certifications section - using list-inside to match template
  function generateCertifications(): string {
    if (!resume.certifications || resume.certifications.length === 0) return "";

    const certItems = resume.certifications.map(cert => `
      <li style="padding-left: 0.3em;">${cert.name}${cert.issuer ? " - " + cert.issuer : ""}${cert.date ? " (" + cert.date + ")" : ""}</li>
    `).join('');

    return `
      <section style="break-inside: avoid;">
        ${sectionTitle("Certifications", defaultSectionTitleSize)}
        <ul style="font-size: ${defaultSmallFontSize}px; list-style-type: disc; list-style-position: outside; padding-left: 1.2em;">
          ${certItems}
        </ul>
      </section>
    `;
  }

  // Render section based on key
  function renderSection(sectionKey: string): string {
    switch (sectionKey) {
      case "summary":
        return generateSummary();
      case "skills":
        return generateSkills();
      case "projects":
        return generateProjects();
      case "experience":
        return generateExperience();
      case "education":
        return generateEducation();
      case "certifications":
        return generateCertifications();
      default:
        return "";
    }
  }

  // Assemble the full HTML - using dynamic section order
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: Letter;
          margin: 0.4in 0 0.25in 0;
        }
        
        @page :first {
          margin-top: 0;
          margin-bottom: 0.2in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          font-family: ${fontFamily};
          font-size: ${baseFontSize}px;
          line-height: ${designOptions.lineHeight};
          color: #000;
          background: white;
        }
        
        .resume-container {
          padding: ${padding};
          max-width: 8.5in;
          background: white;
        }
        
        /* Allow natural page breaks - content flows naturally across pages */
        /* Only avoid breaks on small atomic elements like contact info */
        .no-break {
          break-inside: avoid;
        }
        
        /* Ensure text wraps properly, filling lines completely with hyphenation */
        p, span, li, div {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          -webkit-hyphens: auto;
          -ms-hyphens: auto;
          text-align: justify;
          text-justify: inter-word;
        }
        
        /* Fix bullet point alignment - text wraps aligned to text start, not bullet */
        ul {
          list-style-position: outside;
          padding-left: 1.2em;
          margin-left: 0;
        }
        
        ul li {
          padding-left: 0.3em;
          text-align: left;
        }
        
        /* Headers should be left aligned */
        h1, h2, h3, header, header * {
          text-align: inherit;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${generateHeader()}
        ${sectionOrder.map(sectionKey => renderSection(sectionKey)).join('')}
      </div>
    </body>
    </html>
  `;
}
