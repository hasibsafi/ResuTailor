import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS, FontFamily } from "@/types/resume";

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
  // Scale font sizes based on the base font size
  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 10;
  const defaultSectionTitleSize = baseFontSize + 4; // Heading ~18 when base is 14
  const subheadingSize = baseFontSize + 2; // Subheading ~16 when base is 14
  const bodyFontSize = baseFontSize;
  const defaultSmallFontSize = baseFontSize;

  // Section-specific font sizes (with fallbacks to defaults)
  const sectionFonts = designOptions.sectionFontSizes || {};
  const summaryTitleSize = sectionFonts.summaryTitle || defaultSectionTitleSize;
  const summaryTextSize = sectionFonts.summaryText || bodyFontSize;
  const skillsTitleSize = sectionFonts.skillsTitle || defaultSectionTitleSize;
  const skillsTextSize = sectionFonts.skillsText || bodyFontSize;
  const contactInfoSize = sectionFonts.contactInfo || bodyFontSize + 1;
  const contactNameSize = sectionFonts.contactName || nameFontSize;
  const contactEmailSize = sectionFonts.contactInfo || contactInfoSize;
  const contactPhoneSize = sectionFonts.contactInfo || contactInfoSize;
  const contactLocationSize = sectionFonts.contactInfo || contactInfoSize;
  const contactLinkedinSize = sectionFonts.contactInfo || contactInfoSize;
  const contactGithubSize = sectionFonts.contactInfo || contactInfoSize;
  const contactWebsiteSize = sectionFonts.contactInfo || contactInfoSize;
  const projectSectionTitleSize = sectionFonts.projectSectionTitle || defaultSectionTitleSize;
  const projectTitleSize = sectionFonts.projectTitle || subheadingSize;
  const projectDescSize = sectionFonts.projectDescription || bodyFontSize;
  const experienceTitleSize = sectionFonts.experienceTitle || defaultSectionTitleSize;
  const experienceCompanySize = sectionFonts.experienceCompany || subheadingSize;
  const experienceRoleSize = sectionFonts.experienceRole || subheadingSize;
  const experienceTextSize = sectionFonts.experienceText || bodyFontSize;
  const educationTitleSize = sectionFonts.educationTitle || defaultSectionTitleSize;
  const educationTextSize = sectionFonts.educationText || bodyFontSize;

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (key: keyof NonNullable<typeof designOptions.sectionFontFamilies>) => {
    const familyValue = (sectionFontFamilies[key] || effectiveFontFamily) as FontFamily;
    return FONT_FAMILIES.find(f => f.value === familyValue)?.css || fontFamily;
  };

  // Get section order with defaults (append missing new sections)
  const defaultSectionOrder = ["summary", "skills", "coursework", "experience", "projects", "leadership", "certifications", "education"];
  const legacySectionOrder = ["summary", "education", "coursework", "experience", "projects", "skills", "leadership", "certifications"];
  const hasLegacyOrder =
    designOptions.sectionOrder &&
    JSON.stringify(designOptions.sectionOrder) === JSON.stringify(legacySectionOrder);
  const baseOrder = hasLegacyOrder ? defaultSectionOrder : designOptions.sectionOrder;
  const sectionOrder = baseOrder && baseOrder.length > 0
    ? [...baseOrder, ...defaultSectionOrder.filter(s => !baseOrder.includes(s))]
    : defaultSectionOrder;

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
            <ul className="list-disc" style={{ fontSize: `${defaultSmallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.7em' }}>
              {customSection.bullets?.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
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
              Summary
            </h2>
            <p style={{ fontSize: `${summaryTextSize}px`, fontFamily: getFontFamily('summaryText') }}>{highlightText(resume.summary, highlightKeywords)}</p>
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
            <div style={{ fontFamily: getFontFamily('educationText') }}>
              {orderedEducation.map((edu, idx) => {
                const eduFontStyle = designOptions.educationFontStyles?.[idx];
                const eduTextSize = eduFontStyle?.size || educationTextSize;
                const eduFontFam = eduFontStyle?.family
                  ? FONT_FAMILIES.find(f => f.value === eduFontStyle.family)?.css
                  : getFontFamily('educationText');
                const institutionSize = eduFontStyle?.size || experienceCompanySize;
                return (
                  <div key={idx} className="mb-2" style={{ breakInside: 'avoid' }}>
                    <div className="flex justify-between">
                      <span className="font-bold" style={{ fontSize: `${institutionSize}px`, fontFamily: eduFontFam }}>
                        {edu.institution}
                      </span>
                      <span className="font-bold" style={{ fontSize: `${eduTextSize}px`, fontFamily: eduFontFam }}>
                        {edu.endDate || edu.startDate || ""}
                      </span>
                    </div>
                    <div className="flex justify-between italic" style={{ fontSize: `${eduTextSize}px`, fontFamily: eduFontFam }}>
                      <span>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
                      <span>{edu.location || ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "coursework":
        if (!resume.coursework || resume.coursework.length === 0) return null;
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${defaultSectionTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}` }}
            >
              Relevant Coursework
            </h2>
            <div
              className="text-sm"
              style={{ columnCount: 4, columnGap: "0.5rem", fontSize: `${defaultSmallFontSize}px` }}
            >
              <ul
                className="list-disc space-y-1"
                style={{ breakInside: "avoid", listStylePosition: "outside", paddingLeft: "1.7em" }}
              >
                {resume.coursework.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            </div>
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
              Experience
            </h2>
            {orderedExperience.map((exp, idx) => (
              <div key={idx} data-resume-section className="mb-2" style={{ breakInside: 'avoid' }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ fontSize: `${experienceCompanySize}px`, fontFamily: getFontFamily('experienceCompany') }}>{exp.company}</span>
                  <span className="font-bold" style={{ fontSize: `${experienceTextSize}px`, fontFamily: getFontFamily('experienceText') }}>{exp.startDate} - {exp.endDate || "Present"}</span>
                </div>
                <div className="italic" style={{ fontSize: `${experienceRoleSize}px`, fontFamily: getFontFamily('experienceRole') }}>
                  {exp.title}
                  {exp.location && (" | " + exp.location)}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily('experienceText'),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx}>{highlightText(highlight, highlightKeywords)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
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
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ fontSize: `${projectTitleSize}px`, fontFamily: getFontFamily('projectTitle') }}>
                    {project.name}
                    {project.technologies && project.technologies.length > 0 && (
                      <span
                        className="font-normal italic"
                        style={{ fontSize: `${projectDescSize}px`, fontFamily: getFontFamily('projectDescription') }}
                      >
                        {" | "}{project.technologies.join(", ")}
                      </span>
                    )}
                  </span>
                </div>
                {project.highlights && project.highlights.length > 0 ? (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${projectDescSize}px`,
                      fontFamily: getFontFamily('projectDescription'),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {project.highlights.map((item, itemIdx) => (
                      <li key={itemIdx}>{highlightText(item, highlightKeywords)}</li>
                    ))}
                  </ul>
                ) : project.description ? (
                  <ul
                    className="list-disc mt-0.5"
                    style={{
                      fontSize: `${projectDescSize}px`,
                      fontFamily: getFontFamily('projectDescription'),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    <li>{highlightText(project.description, highlightKeywords)}</li>
                  </ul>
                ) : null}
                {project.url && (
                  <div
                    className="mt-1"
                    style={{
                      fontSize: `${projectDescSize + 1}px`,
                      fontFamily: getFontFamily('projectDescription'),
                      paddingLeft: "1.7em",
                    }}
                  >
                    Live demo:{" "}
                    <a href={toHref(project.url)} target="_blank" rel="noreferrer" className="underline">
                      {project.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case "skills":
        if (!resume.skills) return null;
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
        if (normalizedLanguages.length === 0 && frameworkSkills.length === 0 && developerTools.length === 0) return null;
        return (
          <section key={sectionKey} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${skillsTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('skillsTitle') }}
            >
              Technical Skills
            </h2>
            <div style={{ fontSize: `${skillsTextSize}px`, fontFamily: getFontFamily('skillsText') }}>
              {normalizedLanguages.length > 0 && (
                <div>
                  <span className="font-bold">Languages:</span>{" "}
                  {highlightText(normalizedLanguages.join(", "), highlightKeywords)}
                </div>
              )}
              {frameworkSkills.length > 0 && (
                <div>
                  <span className="font-bold">Frameworks:</span>{" "}
                  {highlightText(frameworkSkills.join(", "), highlightKeywords)}
                </div>
              )}
              {developerTools.length > 0 && (
                <div>
                  <span className="font-bold">Tools:</span>{" "}
                  {highlightText(developerTools.join(", "), highlightKeywords)}
                </div>
              )}
            </div>
          </section>
        );

      case "leadership":
        if (!resume.leadership || resume.leadership.length === 0) return null;
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2 
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{ fontSize: `${experienceTitleSize}px`, color: headingColor, borderBottom: `1px solid ${headingColor}`, fontFamily: getFontFamily('experienceTitle') }}
            >
              Leadership / Extracurricular
            </h2>
            {resume.leadership.map((exp, idx) => (
              <div key={idx} data-resume-section className="mb-2" style={{ breakInside: 'avoid' }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ fontSize: `${experienceCompanySize}px`, fontFamily: getFontFamily('experienceCompany') }}>{exp.company}</span>
                  <span className="font-bold" style={{ fontSize: `${experienceTextSize}px`, fontFamily: getFontFamily('experienceText') }}>{exp.startDate} - {exp.endDate || "Present"}</span>
                </div>
                <div className="italic" style={{ fontSize: `${experienceRoleSize}px`, fontFamily: getFontFamily('experienceRole') }}>
                  {exp.title}
                  {exp.location && (" | " + exp.location)}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily('experienceText'),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx}>{highlightText(highlight, highlightKeywords)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
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
            <ul className="list-disc" style={{ fontSize: `${defaultSmallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.7em' }}>
              {resume.certifications.map((cert, idx) => (
                <li key={idx}>
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
      <header className="text-center mb-4">
        <h1 
          className="font-bold uppercase tracking-wide"
          style={{ fontSize: `${contactNameSize}px`, color: headingColor, fontFamily: getFontFamily('contactName') }}
        >
          {resume.contact.name}
        </h1>
        {resume.contact.location && (
          <div className="mt-1" style={{ fontSize: `${contactLocationSize}px`, fontFamily: getFontFamily('contactInfo') }}>
            {resume.contact.location}
          </div>
        )}
        <div className="mt-1">
          {resume.contact.phone && (
            <span style={{ fontSize: `${contactPhoneSize}px`, fontFamily: getFontFamily('contactInfo') }}>
              {resume.contact.phone}
            </span>
          )}
          {resume.contact.email && (
            <span style={{ fontSize: `${contactEmailSize}px`, fontFamily: getFontFamily('contactInfo') }}>
              {resume.contact.phone ? " • " : ""}
              <a href={`mailto:${resume.contact.email}`}>
                {resume.contact.email}
              </a>
            </span>
          )}
          {resume.contact.linkedin && (
            <span style={{ fontSize: `${contactLinkedinSize}px`, fontFamily: getFontFamily('contactInfo') }}>
              {(resume.contact.phone || resume.contact.email) ? " • " : ""}
              <a href={toHref(resume.contact.linkedin)} target="_blank" rel="noreferrer">
                {resume.contact.linkedin}
              </a>
            </span>
          )}
          {resume.contact.github && (
            <span style={{ fontSize: `${contactGithubSize}px`, fontFamily: getFontFamily('contactInfo') }}>
              {(resume.contact.phone || resume.contact.email || resume.contact.linkedin) ? " • " : ""}
              <a href={toHref(resume.contact.github)} target="_blank" rel="noreferrer">
                {resume.contact.github}
              </a>
            </span>
          )}
          {resume.contact.website && (
            <span style={{ fontSize: `${contactWebsiteSize}px`, fontFamily: getFontFamily('contactInfo') }}>
              {(resume.contact.phone || resume.contact.email || resume.contact.linkedin || resume.contact.github) ? " • " : ""}
              <a href={toHref(resume.contact.website)} target="_blank" rel="noreferrer">
                {resume.contact.website}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Render sections in custom order */}
      {sectionOrder.map(sectionKey => renderSection(sectionKey))}
    </div>
  );
}
