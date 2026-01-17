"use client";

import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES } from "@/types/resume";

// 5 accent color options
export const ACCENT_COLORS = {
  purple: {
    name: "Purple",
    primary: "#8B5CF6",
    bg: "bg-purple-600",
    text: "text-purple-600",
  },
  blue: {
    name: "Blue",
    primary: "#2563EB",
    bg: "bg-blue-600",
    text: "text-blue-600",
  },
  teal: {
    name: "Teal",
    primary: "#0D9488",
    bg: "bg-teal-600",
    text: "text-teal-600",
  },
  rose: {
    name: "Rose",
    primary: "#E11D48",
    bg: "bg-rose-600",
    text: "text-rose-600",
  },
  amber: {
    name: "Amber",
    primary: "#D97706",
    bg: "bg-amber-600",
    text: "text-amber-600",
  },
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

interface TemplateProps {
  resume: TailoredResume;
  accentColor?: AccentColor;
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

export default function TechFocused({ resume, accentColor = "purple", designOptions = DEFAULT_DESIGN_OPTIONS, highlightKeywords = [] }: TemplateProps) {
  const accent = ACCENT_COLORS[accentColor];
  const fontFamily = FONT_FAMILIES.find(f => f.value === designOptions.fontFamily)?.css || FONT_FAMILIES[1].css;
  const padding = MARGIN_SIZES.find(m => m.value === designOptions.marginSize)?.padding || "2rem";
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[designOptions.headerAlignment];

  // Scale font sizes based on the base font size
  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 12; // Name is 12px larger
  const sectionTitleSize = baseFontSize + 4; // Section titles are 4px larger
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
      <section key="summary" data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Professional Summary
        </h2>
        <p style={{ fontSize: `${smallFontSize}px` }}>{highlightText(resume.summary, highlightKeywords)}</p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!resume.skills) return null;
    const defaultLabels = { technical: "Technical Skills", frameworks: "Frameworks", tools: "Tools", languages: "Languages", soft: "Soft Skills", other: "Additional Skills" };
    return (
      <section key="skills" data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Skills
        </h2>
        <div className="space-y-0.5" style={{ fontSize: `${smallFontSize}px` }}>
          {resume.skills.technical && resume.skills.technical.length > 0 && (
            <p><strong>{skillCategoryNames.technical || defaultLabels.technical}:</strong> {highlightText(resume.skills.technical.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.frameworks && resume.skills.frameworks.length > 0 && (
            <p><strong>{skillCategoryNames.frameworks || defaultLabels.frameworks}:</strong> {highlightText(resume.skills.frameworks.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.tools && resume.skills.tools.length > 0 && (
            <p><strong>{skillCategoryNames.tools || defaultLabels.tools}:</strong> {highlightText(resume.skills.tools.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.languages && resume.skills.languages.length > 0 && (
            <p><strong>{skillCategoryNames.languages || defaultLabels.languages}:</strong> {highlightText(resume.skills.languages.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.soft && resume.skills.soft.length > 0 && (
            <p><strong>{skillCategoryNames.soft || defaultLabels.soft}:</strong> {highlightText(resume.skills.soft.join(", "), highlightKeywords)}</p>
          )}
          {resume.skills.other && resume.skills.other.length > 0 && (
            <p><strong>{skillCategoryNames.other || defaultLabels.other}:</strong> {highlightText(resume.skills.other.join(", "), highlightKeywords)}</p>
          )}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!resume.projects || resume.projects.length === 0) return null;
    return (
      <section key="projects" data-resume-section className="mb-3">
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Projects
        </h2>
        {resume.projects.map((project, idx) => (
          <div key={idx} data-resume-section className="mb-1.5" style={{ breakInside: 'avoid' }}>
            <span className="font-bold">{project.name}</span>
            {project.description && (
              <span style={{ fontSize: `${smallFontSize}px` }}>. {highlightText(project.description, highlightKeywords)}</span>
            )}
          </div>
        ))}
      </section>
    );
  };

  const renderExperience = () => {
    if (!resume.experience || resume.experience.length === 0) return null;
    return (
      <section key="experience" data-resume-section className="mb-3">
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Professional Experience
        </h2>
        {resume.experience.map((exp, idx) => (
          <div key={idx} data-resume-section className="mb-2" style={{ breakInside: 'avoid' }}>
            <div className="flex justify-between items-baseline">
              <span className="font-bold">{exp.title}</span>
              <span style={{ fontSize: `${smallFontSize}px` }}>{exp.startDate} - {exp.endDate || "Present"}</span>
            </div>
            <div className="italic" style={{ fontSize: `${smallFontSize}px` }}>
              {exp.company}
              {exp.location && (", " + exp.location)}
            </div>
            <ul className="mt-0.5 list-disc" style={{ fontSize: `${smallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.2em' }}>
              {exp.highlights?.map((highlight, hidx) => (
                <li key={hidx} style={{ paddingLeft: '0.3em' }}>{highlightText(highlight, highlightKeywords)}</li>
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
      <section key="education" data-resume-section className="mb-3">
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Education
        </h2>
        {resume.education.map((edu, idx) => (
          <div key={idx} data-resume-section className="mb-1.5" style={{ breakInside: 'avoid' }}>
            <div className="flex justify-between items-baseline">
              <span className="font-bold">
                {edu.degree}
                {edu.field && (", " + edu.field)}
              </span>
              <span style={{ fontSize: `${smallFontSize}px` }}>{edu.endDate || edu.startDate}</span>
            </div>
            <div className="italic" style={{ fontSize: `${smallFontSize}px` }}>
              {edu.institution}
              {edu.location && (", " + edu.location)}
            </div>
            {edu.gpa && <div style={{ fontSize: `${smallFontSize}px` }}>GPA: {edu.gpa}</div>}
          </div>
        ))}
      </section>
    );
  };

  const renderCertifications = () => {
    if (!resume.certifications || resume.certifications.length === 0) return null;
    return (
      <section key="certifications" data-resume-section style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
          Certifications
        </h2>
        <ul className="list-disc" style={{ fontSize: `${smallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.2em' }}>
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
            <section key={sectionKey} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase mb-1.5" style={{ color: accent.primary, fontSize: `${sectionTitleSize}px` }}>
                {customSection.title}
              </h2>
              {customSection.type === "text" ? (
                <p style={{ fontSize: `${smallFontSize}px` }}>{customSection.content}</p>
              ) : (
                <ul className="list-disc" style={{ fontSize: `${smallFontSize}px`, listStylePosition: 'outside', paddingLeft: '1.2em' }}>
                  {customSection.bullets?.filter(b => b.trim()).map((bullet, idx) => (
                    <li key={idx} style={{ paddingLeft: '0.3em' }}>{bullet}</li>
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
      className="mx-auto bg-white text-black print:p-0 max-w-[8.5in]"
      style={{ 
        fontFamily,
        fontSize: `${baseFontSize}px`,
        lineHeight: designOptions.lineHeight,
      }}
    >
      {/* Header - Full width accent background */}
      <header 
        className={`${alignmentClass} py-4 text-white`}
        style={{ backgroundColor: accent.primary, padding: `1rem ${padding}` }}
      >
        <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: `${nameFontSize}px` }}>{resume.contact.name}</h1>
        <div className="mt-1 space-x-2" style={{ fontSize: `${smallFontSize}px` }}>
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>| {resume.contact.phone}</span>}
          {resume.contact.location && <span>| {resume.contact.location}</span>}
          {resume.contact.linkedin && <span>| {resume.contact.linkedin}</span>}
          {resume.contact.github && <span>| {resume.contact.github}</span>}
        </div>
      </header>

      {/* Content with padding - Dynamic section ordering */}
      <div style={{ padding }}>
        {sectionOrder.map(sectionKey => renderSection(sectionKey))}
      </div>
    </div>
  );
}
