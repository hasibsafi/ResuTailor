import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS } from "@/types/resume";

interface ClassicATSProps {
  resume: TailoredResume;
  designOptions?: DesignOptions;
  highlightKeywords?: string[];
}

// Helper function to highlight keywords in text
function highlightText(text: string, keywords: string[]): React.ReactNode {
  if (!keywords || keywords.length === 0) return text;
  
  // Filter out single-character keywords and escape special regex chars
  const validKeywords = keywords.filter(k => k.length > 1);
  if (validKeywords.length === 0) return text;
  
  // Use word boundaries to match whole words only
  const pattern = new RegExp(`\\b(${validKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);
  
  return parts.map((part, idx) => {
    const isKeyword = validKeywords.some(k => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) {
      return (
        <span 
          key={idx} 
          className="relative inline-block"
          style={{
            background: 'linear-gradient(120deg, #a7f3d0 0%, #6ee7b7 100%)',
            padding: '0 4px',
            borderRadius: '3px',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)',
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function ClassicATS({ resume, designOptions = DEFAULT_DESIGN_OPTIONS, highlightKeywords = [] }: ClassicATSProps) {
  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };
  const fontFamily = FONT_FAMILIES.find(f => f.value === designOptions.fontFamily)?.css || FONT_FAMILIES[1].css;
  const padding = MARGIN_SIZES.find(m => m.value === designOptions.marginSize)?.padding || "2rem";
  const headingColor = HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.hex || "#111827";
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[designOptions.headerAlignment];

  // Scale font sizes based on the base font size
  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 12; // Name is 12px larger
  const defaultSectionTitleSize = baseFontSize + 4; // Section titles are 4px larger
  const bodyFontSize = baseFontSize;
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
  const experienceCompanySize = sectionFonts.experienceCompany || (baseFontSize + 2);
  const experienceRoleSize = sectionFonts.experienceRole || baseFontSize;
  const experienceTextSize = sectionFonts.experienceText || defaultSmallFontSize;
  const educationTitleSize = sectionFonts.educationTitle || defaultSectionTitleSize;
  const educationTextSize = sectionFonts.educationText || defaultSmallFontSize;

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (key: keyof NonNullable<typeof designOptions.sectionFontFamilies>) => {
    const familyValue = sectionFontFamilies[key] || designOptions.fontFamily;
    return FONT_FAMILIES.find(f => f.value === familyValue)?.css || fontFamily;
  };

  // Get section order with defaults
  const sectionOrder = designOptions.sectionOrder || ["summary", "skills", "projects", "experience", "education", "certifications"];

  // Get subsection ordering (order of items within sections)
  const getOrderedItems = <T,>(items: T[], orderArray?: number[]): T[] => {
    if (!orderArray || orderArray.length === 0) return items;
    // Map order indices to items, filtering out invalid indices
    return orderArray
      .filter(idx => idx >= 0 && idx < items.length)
      .map(idx => items[idx]);
  };

  // Render individual sections
  const renderSection = (sectionKey: string) => {
    // Handle custom sections (format: custom-{id})
    if (sectionKey.startsWith('custom-')) {
      const customId = sectionKey.replace('custom-', '');
      const customSection = resume.customSections?.find(s => s.id === customId);
      if (!customSection) return null;
      
      return (
        <section key={sectionKey} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
          <h2 
            className="font-bold uppercase mb-1.5 pb-0.5"
            style={{ fontSize: `${defaultSectionTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}` }}
          >
            {customSection.title}
          </h2>
          {customSection.type === 'text' ? (
            <p style={{ fontSize: `${defaultSmallFontSize}px` }}>{customSection.content}</p>
          ) : (
            <ul className="list-disc" style={{ fontSize: `${defaultSmallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.2em' }}>
              {customSection.bullets?.map((bullet, idx) => (
                <li key={idx} style={{ paddingLeft: '0.3em' }}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    switch (sectionKey) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <section key={sectionKey} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${summaryTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('summaryTitle') }}
            >
              Professional Summary
            </h2>
            <p style={{ fontSize: `${summaryTextSize}px`, fontFamily: getFontFamily('summaryText') }}>{highlightText(resume.summary, highlightKeywords)}</p>
          </section>
        );

      case "skills":
        if (!resume.skills) return null;
        // Combine all technical skills into a single comma-separated list (exclude soft skills - they're woven into content)
        const allSkills = [
          ...(resume.skills.technical || []),
          ...(resume.skills.frameworks || []),
          ...(resume.skills.tools || []),
          ...(resume.skills.languages || []),
          ...(resume.skills.other || []),
        ].filter(Boolean);
        
        if (allSkills.length === 0) return null;
        
        return (
          <section key={sectionKey} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${skillsTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('skillsTitle') }}
            >
              Skills
            </h2>
            <p style={{ fontSize: `${skillsTextSize}px`, fontFamily: getFontFamily('skillsText') }}>
              {highlightText(allSkills.join(", "), highlightKeywords)}
            </p>
          </section>
        );

      case "projects":
        if (!resume.projects || resume.projects.length === 0) return null;
        const orderedProjects = getOrderedItems(resume.projects, designOptions.projectOrder);
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${projectSectionTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('projectSectionTitle') }}
            >
              Projects
            </h2>
            {orderedProjects.map((project, idx) => (
              <div key={idx} data-resume-section className="mb-1.5" style={{ breakInside: 'avoid' }}>
                <span className="font-bold" style={{ fontSize: `${projectTitleSize}px`, fontFamily: getFontFamily('projectTitle') }}>
                  {project.name}
                </span>
                {project.description && (
                  <div className="mt-0.5" style={{ fontSize: `${projectDescSize}px`, fontFamily: getFontFamily('projectDescription') }}>
                    {highlightText(project.description, highlightKeywords)}
                  </div>
                )}
                {project.url && (
                  <div className="mt-0.5" style={{ fontSize: `${projectDescSize}px`, fontFamily: getFontFamily('projectDescription') }}>
                    Link:{" "}
                    <a href={normalizeUrl(project.url)} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                      {project.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case "experience":
        if (!resume.experience || resume.experience.length === 0) return null;
        const orderedExperience = getOrderedItems(resume.experience, designOptions.experienceOrder);
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${experienceTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('experienceTitle') }}
            >
              Professional Experience
            </h2>
            {orderedExperience.map((exp, idx) => (
              <div key={idx} data-resume-section className="mb-2" style={{ breakInside: 'avoid' }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ fontSize: `${experienceCompanySize}px`, fontFamily: getFontFamily('experienceCompany') }}>{exp.company}</span>
                  <span style={{ fontSize: `${experienceTextSize}px`, fontFamily: getFontFamily('experienceText') }}>{exp.startDate} - {exp.endDate || "Present"}</span>
                </div>
                <div className="font-semibold" style={{ fontSize: `${experienceRoleSize}px`, fontFamily: getFontFamily('experienceRole') }}>
                  {exp.title}
                  {exp.location && (" | " + exp.location)}
                </div>
                <ul className="mt-0.5 list-disc" style={{ fontSize: `${experienceTextSize}px`, fontFamily: getFontFamily('experienceText'), listStylePosition: 'outside', paddingLeft: '1.2em' }}>
                  {exp.highlights?.map((highlight, hidx) => (
                    <li key={hidx} style={{ paddingLeft: '0.3em' }}>{highlightText(highlight, highlightKeywords)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );

      case "education":
        if (!resume.education || resume.education.length === 0) return null;
        const orderedEducation = getOrderedItems(resume.education, designOptions.educationOrder);
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${educationTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('educationTitle') }}
            >
              Education
            </h2>
            {orderedEducation.map((edu, idx) => {
              const eduFontStyle = designOptions.educationFontStyles?.[idx];
              const eduTextSize = eduFontStyle?.size || educationTextSize;
              const eduFontFam = eduFontStyle?.family ? FONT_FAMILIES.find(f => f.value === eduFontStyle.family)?.css : getFontFamily('educationText');
              return (
                <div key={idx} data-resume-section className="mb-1.5" style={{ breakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontFamily: eduFontFam }}>
                      {edu.degree}
                      {edu.field && (", " + edu.field)}
                    </span>
                    <span style={{ fontSize: `${eduTextSize}px`, fontFamily: eduFontFam }}>{edu.endDate || edu.startDate}</span>
                  </div>
                  <div className="italic" style={{ fontSize: `${eduTextSize}px`, fontFamily: eduFontFam }}>
                    {edu.institution}
                    {edu.location && (", " + edu.location)}
                  </div>
                  {edu.gpa && <div style={{ fontSize: `${eduTextSize}px`, fontFamily: eduFontFam }}>GPA: {edu.gpa}</div>}
                </div>
              );
            })}
          </section>
        );

      case "certifications":
        if (!resume.certifications || resume.certifications.length === 0) return null;
        return (
          <section key={sectionKey} data-resume-section style={{ breakInside: 'avoid' }}>
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${defaultSectionTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}` }}
            >
              Certifications
            </h2>
            <ul className="list-disc" style={{ fontSize: `${defaultSmallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.2em' }}>
              {resume.certifications.map((cert, idx) => (
                <li key={idx} style={{ paddingLeft: '0.3em' }}>
                  {cert.name}
                  {cert.issuer && (" - " + cert.issuer)}
                  {cert.date && (" (" + cert.date + ")")}
                </li>
              ))}
            </ul>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="mx-auto bg-white text-black print:p-0 max-w-[8.5in]"
      style={{ 
        fontFamily,
        padding,
        fontSize: `${bodyFontSize}px`,
        lineHeight: designOptions.lineHeight,
      }}
    >
      {/* Header - ATS optimized with clear text */}
      <header className={`${alignmentClass} mb-4 pb-3`} style={{ borderBottom: `2px solid ${headingColor}` }}>
        <h1 
          className="font-bold uppercase tracking-wide"
          style={{ fontSize: `${nameFontSize}px`, color: headingColor }}
        >
          {resume.contact.name}
        </h1>
        <div className="mt-1 space-x-2" style={{ fontSize: `${defaultSmallFontSize}px` }}>
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>| {resume.contact.phone}</span>}
          {resume.contact.location && <span>| {resume.contact.location}</span>}
          {resume.contact.linkedin && <span>| {resume.contact.linkedin}</span>}
          {resume.contact.github && <span>| {resume.contact.github}</span>}
        </div>
      </header>

      {/* Render sections in custom order */}
      {sectionOrder.map(sectionKey => renderSection(sectionKey))}
    </div>
  );
}
