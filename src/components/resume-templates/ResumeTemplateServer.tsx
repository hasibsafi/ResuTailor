// Server-compatible resume template component for PDF generation
// This is a simplified version without React hooks or client-side features

import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS, TemplateSlug } from "@/types/resume";

interface ServerTemplateProps {
  resume: TailoredResume;
  template: TemplateSlug;
  designOptions?: DesignOptions;
}

export function generateResumeHTML({
  resume,
  template: _template,
  designOptions = DEFAULT_DESIGN_OPTIONS,
}: ServerTemplateProps): string {
  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed;
  };
  const toHref = (url?: string) => {
    const trimmed = normalizeUrl(url);
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
  };
  const effectiveFontFamily = designOptions.fontFamily === "serif" ? "times" : designOptions.fontFamily;
  const fontFamily = FONT_FAMILIES.find(f => f.value === effectiveFontFamily)?.css || FONT_FAMILIES[1].css;
  const padding = MARGIN_SIZES.find(m => m.value === designOptions.marginSize)?.padding || "2rem";
  const headingColor = HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.hex || "#111827";

  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 10;
  const defaultSectionTitleSize = baseFontSize + 4;
  const subheadingSize = baseFontSize + 2;
  const defaultSmallFontSize = baseFontSize;

  // Section-specific font sizes (with fallbacks to defaults)
  const sectionFonts = designOptions.sectionFontSizes || {};
  const summaryTitleSize = sectionFonts.summaryTitle || defaultSectionTitleSize;
  const summaryTextSize = sectionFonts.summaryText || baseFontSize;
  const skillsTitleSize = sectionFonts.skillsTitle || defaultSectionTitleSize;
  const skillsTextSize = sectionFonts.skillsText || baseFontSize;
  const contactInfoSize = sectionFonts.contactInfo || baseFontSize + 1;
  const contactNameSize = sectionFonts.contactName || nameFontSize;
  const contactEmailSize = sectionFonts.contactInfo || contactInfoSize;
  const contactPhoneSize = sectionFonts.contactInfo || contactInfoSize;
  const contactLocationSize = sectionFonts.contactInfo || contactInfoSize;
  const contactLinkedinSize = sectionFonts.contactInfo || contactInfoSize;
  const contactGithubSize = sectionFonts.contactInfo || contactInfoSize;
  const contactWebsiteSize = sectionFonts.contactInfo || contactInfoSize;
  const projectSectionTitleSize = sectionFonts.projectSectionTitle || defaultSectionTitleSize;
  const projectTitleSize = sectionFonts.projectTitle || subheadingSize;
  const projectDescSize = sectionFonts.projectDescription || baseFontSize;
  const experienceTitleSize = sectionFonts.experienceTitle || defaultSectionTitleSize;
  const experienceTextSize = sectionFonts.experienceText || baseFontSize;
  const experienceCompanySize = sectionFonts.experienceCompany || subheadingSize;
  const experienceRoleSize = sectionFonts.experienceRole || subheadingSize;
  const educationTitleSize = sectionFonts.educationTitle || defaultSectionTitleSize;
  const educationTextSize = sectionFonts.educationText || baseFontSize;

  // Section order (append missing new sections)
  const defaultSectionOrder = ["summary", "skills", "coursework", "experience", "projects", "leadership", "certifications", "education"];
  const legacySectionOrder = ["summary", "education", "coursework", "experience", "projects", "skills", "leadership", "certifications"];
  const hasLegacyOrder =
    designOptions.sectionOrder &&
    JSON.stringify(designOptions.sectionOrder) === JSON.stringify(legacySectionOrder);
  const baseOrder = hasLegacyOrder ? defaultSectionOrder : designOptions.sectionOrder;
  const sectionOrder = baseOrder && baseOrder.length > 0
    ? [...baseOrder, ...defaultSectionOrder.filter(s => !baseOrder.includes(s))]
    : defaultSectionOrder;

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (key: keyof NonNullable<typeof designOptions.sectionFontFamilies>): string => {
    const familyValue = sectionFontFamilies[key] || effectiveFontFamily;
    return FONT_FAMILIES.find(f => f.value === familyValue)?.css || fontFamily;
  };

  const colors = { primary: headingColor, border: headingColor };

  function generateContactInfo(): string {
    const items: string[] = [];
    if (resume.contact.phone) {
      items.push(`<span style="font-size: ${contactPhoneSize}px; font-family: ${getFontFamily('contactInfo')};">${resume.contact.phone}</span>`);
    }
    if (resume.contact.email) {
      items.push(`<span style="font-size: ${contactEmailSize}px; font-family: ${getFontFamily('contactInfo')};"><a href="mailto:${resume.contact.email}" style="text-decoration: none; color: inherit;">${resume.contact.email}</a></span>`);
    }
    if (resume.contact.linkedin) {
      const linkedinUrl = toHref(resume.contact.linkedin);
      items.push(`<span style="font-size: ${contactLinkedinSize}px; font-family: ${getFontFamily('contactInfo')};"><a href="${linkedinUrl}" target="_blank" rel="noreferrer" style="text-decoration: none; color: inherit;">${resume.contact.linkedin}</a></span>`);
    }
    if (resume.contact.github) {
      const githubUrl = toHref(resume.contact.github);
      items.push(`<span style="font-size: ${contactGithubSize}px; font-family: ${getFontFamily('contactInfo')};"><a href="${githubUrl}" target="_blank" rel="noreferrer" style="text-decoration: none; color: inherit;">${resume.contact.github}</a></span>`);
    }
    if (resume.contact.website) {
      const websiteUrl = toHref(resume.contact.website);
      items.push(`<span style="font-size: ${contactWebsiteSize}px; font-family: ${getFontFamily('contactInfo')};"><a href="${websiteUrl}" target="_blank" rel="noreferrer" style="text-decoration: none; color: inherit;">${resume.contact.website}</a></span>`);
    }
    return items.map(item => `<span>${item}</span>`).join(' • ');
  }

  function generateHeader(): string {
    return `
      <header style="text-align: center; margin-bottom: 16px;">
        <h1 style="font-size: ${contactNameSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 0.05em; font-family: ${getFontFamily('contactName')};">
          ${resume.contact.name}
        </h1>
        ${resume.contact.location ? `<div style="margin-top: 4px; font-size: ${contactLocationSize}px; font-family: ${getFontFamily('contactInfo')};">${resume.contact.location}</div>` : ""}
        <div style="margin-top: 4px;">
          ${generateContactInfo()}
        </div>
      </header>
    `;
  }

  // Helper to generate section title - matching template exactly
  // Template uses: mb-1.5 pb-0.5 = 6px margin-bottom, 2px padding-bottom
  function sectionTitle(title: string, fontSize: number = defaultSectionTitleSize): string {
    return `
      <h2 style="font-size: ${fontSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; border-bottom: 1px solid ${colors.border};">
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
          Summary
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
        ? `<ul style="margin-top: 2px; font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')}; list-style-type: disc; list-style-position: outside; padding-left: 1.7em;">
            ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
           </ul>`
        : "";

      return `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; font-size: ${experienceCompanySize}px; font-family: ${getFontFamily('experienceCompany')};">${exp.company}</span>
            <span style="font-weight: 700; font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')};">${exp.startDate} - ${exp.endDate || "Present"}</span>
          </div>
          <div style="font-size: ${experienceRoleSize}px; font-style: italic; font-family: ${getFontFamily('experienceRole')};">
            ${exp.title}${exp.location ? " | " + exp.location : ""}
          </div>
          ${highlights}
        </div>
      `;
    }).join('');

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${experienceTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('experienceTitle')}; border-bottom: 1px solid ${colors.border};">
          Experience
        </h2>
        ${expItems}
      </section>
    `;
  }

  // Education section - matching LaTeX layout
  function generateEducation(): string {
    if (!resume.education || resume.education.length === 0) return "";

    const eduItems = resume.education.map((edu, idx) => {
      const eduFontStyle = designOptions.educationFontStyles?.[idx];
      const eduTextSize = eduFontStyle?.size || educationTextSize;
      const eduFontFam = eduFontStyle?.family
        ? FONT_FAMILIES.find(f => f.value === eduFontStyle.family)?.css
        : getFontFamily('educationText');
      const institutionSize = eduFontStyle?.size || experienceCompanySize;
      return `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-weight: 700; font-size: ${institutionSize}px; font-family: ${eduFontFam};">${edu.institution}</span>
          <span style="font-weight: 700; font-size: ${eduTextSize}px; font-family: ${eduFontFam};">${edu.endDate || edu.startDate || ""}</span>
        </div>
        <div style="font-style: italic; font-size: ${eduTextSize}px; font-family: ${eduFontFam};">
          ${edu.degree}${edu.field ? " in " + edu.field : ""}${edu.location ? " | " + edu.location : ""}
        </div>
      </div>
    `;
    }).join('');

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

  // Coursework section
  function generateCoursework(): string {
    if (!resume.coursework || resume.coursework.length === 0) return "";

    return `
      <section style="margin-bottom: 12px;">
        ${sectionTitle("Relevant Coursework", defaultSectionTitleSize)}
        <div style="font-size: ${defaultSmallFontSize}px; column-count: 4; column-gap: 8px;">
          <ul style="list-style-type: disc; list-style-position: outside; margin: 0; padding-left: 1.7em;">
            ${resume.coursework.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </section>
    `;
  }

  // Skills section - labeled categories
  function generateSkills(): string {
    if (!resume.skills) return "";

    const languageSkills = resume.skills.languages || [];
    const frameworkSkills = resume.skills.frameworks || [];
    const developerTools = resume.skills.tools || [];
    const otherSkills = resume.skills.other || [];
    const technicalSkills = resume.skills.technical || [];
    const mustHaveLanguages = ["TypeScript", "SQL", "Python", "JavaScript", "C++", "C"];
    const normalizedLanguages = Array.from(
      new Set([
        ...languageSkills,
        ...mustHaveLanguages,
      ])
    );

    if (normalizedLanguages.length === 0 && frameworkSkills.length === 0 && developerTools.length === 0) return "";

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${skillsTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('skillsTitle')}; border-bottom: 1px solid ${colors.border};">
          Technical Skills
        </h2>
        <div style="font-size: ${skillsTextSize}px; font-family: ${getFontFamily('skillsText')};">
          ${normalizedLanguages.length > 0 ? `<div><strong>Languages:</strong> ${normalizedLanguages.join(", ")}</div>` : ""}
          ${frameworkSkills.length > 0 ? `<div><strong>Frameworks:</strong> ${frameworkSkills.join(", ")}</div>` : ""}
          ${developerTools.length > 0 ? `<div><strong>Tools:</strong> ${developerTools.join(", ")}</div>` : ""}
        </div>
      </section>
    `;
  }

  // Projects section - with technologies and bullets
  function generateProjects(): string {
    if (!resume.projects || resume.projects.length === 0) return "";

    const projItems = resume.projects.map(proj => `
      <div style="margin-bottom: 6px;">
        <div style="font-weight: 700; font-size: ${projectTitleSize}px; font-family: ${getFontFamily('projectTitle')};">
          ${proj.name}${proj.technologies && proj.technologies.length > 0 ? ` <span style="font-weight: 400; font-style: italic; font-size: ${projectDescSize}px; font-family: ${getFontFamily('projectDescription')};">| ${proj.technologies.join(", ")}</span>` : ""}
        </div>
        ${proj.highlights && proj.highlights.length > 0
          ? `<ul style="margin-top: 2px; font-size: ${projectDescSize}px; font-family: ${getFontFamily('projectDescription')}; list-style-type: disc; list-style-position: outside; padding-left: 1.7em;">
              ${proj.highlights.map(item => `<li>${item}</li>`).join("")}
            </ul>`
          : proj.description
          ? `<ul style="margin-top: 2px; font-size: ${projectDescSize}px; font-family: ${getFontFamily('projectDescription')}; list-style-type: disc; list-style-position: outside; padding-left: 1.7em;"><li>${proj.description}</li></ul>`
          : ""}
        ${proj.url ? `<div style="margin-top: 4px; font-size: ${projectDescSize + 1}px; font-family: ${getFontFamily('projectDescription')}; padding-left: 1.7em;">
          Live demo: <a href="${toHref(proj.url)}" target="_blank" rel="noreferrer" style="text-decoration: underline; color: inherit;">${proj.url}</a>
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

  function generateLeadership(): string {
    if (!resume.leadership || resume.leadership.length === 0) return "";

    const items = resume.leadership.map(exp => {
      const highlights = exp.highlights && exp.highlights.length > 0
        ? `<ul style="margin-top: 2px; font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')}; list-style-type: disc; list-style-position: outside; padding-left: 1.7em;">
            ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
           </ul>`
        : "";

      return `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; font-size: ${experienceCompanySize}px; font-family: ${getFontFamily('experienceCompany')};">${exp.company}</span>
            <span style="font-weight: 700; font-size: ${experienceTextSize}px; font-family: ${getFontFamily('experienceText')};">${exp.startDate} - ${exp.endDate || "Present"}</span>
          </div>
          <div style="font-size: ${experienceRoleSize}px; font-style: italic; font-family: ${getFontFamily('experienceRole')};">
            ${exp.title}${exp.location ? " | " + exp.location : ""}
          </div>
          ${highlights}
        </div>
      `;
    }).join("");

    return `
      <section style="margin-bottom: 12px;">
        <h2 style="font-size: ${experienceTitleSize}px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; font-family: ${getFontFamily('experienceTitle')}; border-bottom: 1px solid ${colors.border};">
          Leadership / Extracurricular
        </h2>
        ${items}
      </section>
    `;
  }

  // Certifications section - using list-inside to match template
  function generateCertifications(): string {
    if (!resume.certifications || resume.certifications.length === 0) return "";

    const certItems = resume.certifications.map(cert => `
      <li>${cert.name}${cert.issuer ? " - " + cert.issuer : ""}${cert.date ? " (" + cert.date + ")" : ""}</li>
    `).join('');

    return `
      <section style="break-inside: avoid;">
        ${sectionTitle("Certifications", defaultSectionTitleSize)}
        <ul style="font-size: ${defaultSmallFontSize}px; list-style-type: disc; list-style-position: outside; padding-left: 1.7em;">
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
      case "education":
        return generateEducation();
      case "coursework":
        return generateCoursework();
      case "experience":
        return generateExperience();
      case "skills":
        return generateSkills();
      case "projects":
        return generateProjects();
      case "leadership":
        return generateLeadership();
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
          margin-bottom: 0.05in;
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
          text-align: left;
        }
        
        /* Fix bullet point alignment - text wraps aligned to text start, not bullet */
        ul {
          list-style-position: outside;
          padding-left: 1.7em;
          margin-left: 0;
        }
        
        ul li {
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
