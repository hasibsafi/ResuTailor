import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS } from "@/types/resume";

interface ModernProfessionalProps {
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

export default function ModernProfessional({ resume, designOptions = DEFAULT_DESIGN_OPTIONS, highlightKeywords = [] }: ModernProfessionalProps) {
  const fontFamily = FONT_FAMILIES.find(f => f.value === designOptions.fontFamily)?.css || FONT_FAMILIES[0].css;
  const padding = MARGIN_SIZES.find(m => m.value === designOptions.marginSize)?.padding || "2rem";
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[designOptions.headerAlignment];
  const contactFlexClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[designOptions.headerAlignment];
  const headingColor = HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.hex || "#2563eb";

  // Scale font sizes based on the base font size
  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 14; // Name is larger
  const sectionTitleSize = baseFontSize + 4; // Section titles
  const subheadingSize = baseFontSize + 1; // Subheadings
  const smallFontSize = baseFontSize - 2;

  // Section order
  const sectionOrder = designOptions.sectionOrder || ["summary", "skills", "projects", "experience", "education", "certifications"];
  const skillCategoryNames = designOptions.skillCategoryNames || {};

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (key: keyof NonNullable<typeof designOptions.sectionFontFamilies>) => {
    const familyValue = sectionFontFamilies[key] || designOptions.fontFamily;
    return FONT_FAMILIES.find(f => f.value === familyValue)?.css || fontFamily;
  };

  // Section renderers
  const renderSummary = () => {
    if (!resume.summary) return null;
    return (
      <section key="summary" data-resume-section className="mb-4" style={{ breakInside: 'avoid' }}>
        <h2 className="font-semibold uppercase tracking-wide mb-1.5" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Summary</h2>
        <p className="text-gray-700">{highlightText(resume.summary, highlightKeywords)}</p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!resume.skills) return null;
    const defaultLabels = { technical: "Technical", frameworks: "Frameworks", tools: "Tools", languages: "Languages", soft: "Soft Skills", other: "Other" };
    return (
      <section key="skills" data-resume-section className="mb-4" style={{ breakInside: 'avoid' }}>
        <h2 className="font-semibold uppercase tracking-wide mb-1.5" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Skills</h2>
        <div className="space-y-0.5" style={{ fontSize: `${smallFontSize}px` }}>
          {resume.skills.technical && resume.skills.technical.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.technical || defaultLabels.technical}:</span> {highlightText(resume.skills.technical.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.frameworks && resume.skills.frameworks.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.frameworks || defaultLabels.frameworks}:</span> {highlightText(resume.skills.frameworks.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.tools && resume.skills.tools.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.tools || defaultLabels.tools}:</span> {highlightText(resume.skills.tools.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.languages && resume.skills.languages.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.languages || defaultLabels.languages}:</span> {highlightText(resume.skills.languages.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.soft && resume.skills.soft.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.soft || defaultLabels.soft}:</span> {highlightText(resume.skills.soft.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.other && resume.skills.other.length > 0 && (
            <p><span className="font-medium">{skillCategoryNames.other || defaultLabels.other}:</span> {highlightText(resume.skills.other.join(", "), highlightKeywords)}</p>
          )}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!resume.projects || resume.projects.length === 0) return null;
    return (
      <section key="projects" data-resume-section className="mb-4">
        <h2 className="font-semibold uppercase tracking-wide mb-2" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Projects</h2>
        {resume.projects.map((project, idx) => (
          <div key={idx} data-resume-section className="mb-2" style={{ breakInside: 'avoid' }}>
            <span className="font-semibold text-gray-900" style={{ fontSize: `${subheadingSize}px` }}>
              {project.name}
            </span>
            {project.url && (
              <a href={project.url} className="text-blue-600 ml-2 font-normal hover:underline" style={{ fontSize: `${smallFontSize}px` }}>
                [Link]
              </a>
            )}
            {project.description && (
              <span className="text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>. {highlightText(project.description, highlightKeywords)}</span>
            )}
          </div>
        ))}
      </section>
    );
  };

  const renderExperience = () => {
    if (!resume.experience || resume.experience.length === 0) return null;
    return (
      <section key="experience" data-resume-section className="mb-4">
        <h2 className="font-semibold uppercase tracking-wide mb-2" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Experience</h2>
        {resume.experience.map((exp, idx) => (
          <div key={idx} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: `${subheadingSize}px` }}>{exp.title}</h3>
                <p className="text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>
                  {exp.company}
                  {exp.location && (" · " + exp.location)}
                </p>
              </div>
              <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: `${smallFontSize}px` }}>
                {exp.startDate} – {exp.endDate || "Present"}
              </span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {exp.highlights?.map((highlight, hidx) => (
                <li key={hidx} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600" style={{ fontSize: `${smallFontSize}px` }}>
                  {highlightText(highlight, highlightKeywords)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    );
  };

  const renderEducation = () => {
    if (!resume.education || resume.education.length === 0) return null;
    return (
      <section key="education" data-resume-section className="mb-4">
        <h2 className="font-semibold uppercase tracking-wide mb-2" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Education</h2>
        {resume.education.map((edu, idx) => (
          <div key={idx} data-resume-section className="mb-1.5" style={{ breakInside: 'avoid' }}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: `${subheadingSize}px` }}>
                  {edu.degree}
                  {edu.field && (", " + edu.field)}
                </h3>
                <p className="text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>{edu.institution}</p>
              </div>
              <span className="text-gray-500" style={{ fontSize: `${smallFontSize}px` }}>{edu.endDate || edu.startDate}</span>
            </div>
            {edu.gpa && <p className="text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>
    );
  };

  const renderCertifications = () => {
    if (!resume.certifications || resume.certifications.length === 0) return null;
    return (
      <section key="certifications" data-resume-section style={{ breakInside: 'avoid' }}>
        <h2 className="font-semibold uppercase tracking-wide mb-1.5" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>Certifications</h2>
        <ul className="space-y-0.5" style={{ fontSize: `${smallFontSize}px` }}>
          {resume.certifications.map((cert, idx) => (
            <li key={idx}>
              {cert.name}
              {cert.issuer && (" – " + cert.issuer)}
              {cert.date && (" (" + cert.date + ")")}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "summary": return renderSummary();
      case "skills": return renderSkills();
      case "projects": return renderProjects();
      case "experience": return renderExperience();
      case "education": return renderEducation();
      case "certifications": return renderCertifications();
      default:
        // Handle custom sections
        if (sectionKey.startsWith('custom-')) {
          const customId = sectionKey.replace('custom-', '');
          const customSection = resume.customSections?.find(s => s.id === customId);
          if (!customSection) return null;

          return (
            <section key={sectionKey} data-resume-section className="mb-4" style={{ breakInside: 'avoid' }}>
              <h2 className="font-semibold uppercase tracking-wide mb-1.5" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>
                {customSection.title}
              </h2>
              {customSection.type === "text" ? (
                <p className="text-gray-700" style={{ fontSize: `${smallFontSize}px` }}>
                  {customSection.content}
                </p>
              ) : (
                <ul className="space-y-0.5" style={{ fontSize: `${smallFontSize}px` }}>
                  {customSection.bullets?.filter(b => b.trim()).map((bullet, idx) => (
                    <li key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        }
        return null;
    }
  };

  return (
    <div 
      className="mx-auto bg-white text-gray-800 print:p-0 max-w-[8.5in]"
      style={{ 
        fontFamily,
        padding,
        fontSize: `${baseFontSize}px`,
        lineHeight: designOptions.lineHeight,
      }}
    >
      {/* Header */}
      <header className={`pb-3 mb-4 ${alignmentClass}`} style={{ borderBottom: `2px solid ${headingColor}` }}>
        <h1 className="font-bold" style={{ fontSize: `${nameFontSize}px`, color: headingColor }}>{resume.contact.name}</h1>
        <div className={`flex flex-wrap gap-x-4 gap-y-1 text-gray-600 mt-2 ${contactFlexClass}`} style={{ fontSize: `${smallFontSize}px` }}>
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
          {resume.contact.linkedin && (
            <a href={resume.contact.linkedin} className="text-blue-600 hover:underline">
              LinkedIn
            </a>
          )}
          {resume.contact.github && (
            <a href={resume.contact.github} className="text-blue-600 hover:underline">
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Dynamic section ordering */}
      {sectionOrder.map(sectionKey => renderSection(sectionKey))}
    </div>
  );
}
