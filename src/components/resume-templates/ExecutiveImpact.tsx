import { TailoredResume, DesignOptions, DEFAULT_DESIGN_OPTIONS, FONT_FAMILIES, MARGIN_SIZES, HEADING_COLORS } from "@/types/resume";

interface TemplateProps {
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

export default function ExecutiveImpact({ resume, designOptions = DEFAULT_DESIGN_OPTIONS, highlightKeywords = [] }: TemplateProps) {
  const fontFamily = FONT_FAMILIES.find(f => f.value === designOptions.fontFamily)?.css || "Georgia, serif";
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
  const dividerAlignment = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[designOptions.headerAlignment];
  const headingColor = HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.hex || "#92400e";

  // Scale font sizes based on the base font size
  const baseFontSize = designOptions.fontSize;
  const nameFontSize = baseFontSize + 18; // Name is much larger for executive
  const sectionTitleSize = baseFontSize + 6; // Section titles
  const subheadingSize = baseFontSize + 3;
  const smallFontSize = baseFontSize - 2;

  return (
    <div 
      className="bg-white text-gray-900 mx-auto print:p-0 max-w-[8.5in]" 
      style={{ 
        fontFamily,
        padding,
        fontSize: `${baseFontSize}px`,
        lineHeight: designOptions.lineHeight,
      }}
    >
      {/* Header - Bold executive style */}
      <header className={`mb-4 ${alignmentClass}`}>
        <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: `${nameFontSize}px`, color: headingColor }}>{resume.contact.name}</h1>
        <div className={`w-16 h-0.5 mb-2 ${dividerAlignment}`} style={{ backgroundColor: headingColor }}></div>
        <div className={`flex gap-4 text-gray-600 ${contactFlexClass}`} style={{ fontSize: `${smallFontSize}px` }}>
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
        <div className={`flex gap-4 text-amber-700 mt-1 ${contactFlexClass}`} style={{ fontSize: `${smallFontSize}px` }}>
          {resume.contact.linkedin && <a href={resume.contact.linkedin} className="hover:underline">LinkedIn</a>}
          {resume.contact.website && <a href={resume.contact.website} className="hover:underline">Website</a>}
        </div>
      </header>

      {/* Executive Summary */}
      {resume.summary && (
        <section data-resume-section className="mb-4" style={{ breakInside: 'avoid' }}>
          <h2 className="font-bold mb-1.5 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>EXECUTIVE SUMMARY</h2>
          <p className="text-gray-700 italic pl-3" style={{ fontSize: `${smallFontSize}px`, borderLeft: `2px solid ${headingColor}` }}>
            {highlightText(resume.summary, highlightKeywords)}
          </p>
        </section>
      )}

      {/* Key Competencies / Skills */}
      {resume.skills && (
        <section data-resume-section className="mb-4" style={{ breakInside: 'avoid' }}>
          <h2 className="font-bold mb-2 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>KEY COMPETENCIES</h2>
          <div className="grid grid-cols-3 gap-3">
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontSize: `${smallFontSize}px` }}>Strategic</h3>
                <ul style={{ fontSize: `${smallFontSize}px` }}>
                  {resume.skills.technical.slice(0, 5).map((skill, idx) => (
                    <li key={idx} className="text-gray-700">• {highlightText(skill, highlightKeywords)}</li>
                  ))}
                </ul>
              </div>
            )}
            {resume.skills.frameworks && resume.skills.frameworks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontSize: `${smallFontSize}px` }}>Technical</h3>
                <ul style={{ fontSize: `${smallFontSize}px` }}>
                  {resume.skills.frameworks.slice(0, 5).map((skill, idx) => (
                    <li key={idx} className="text-gray-700">• {highlightText(skill, highlightKeywords)}</li>
                  ))}
                </ul>
              </div>
            )}
            {resume.skills.soft && resume.skills.soft.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontSize: `${smallFontSize}px` }}>Leadership</h3>
                <ul style={{ fontSize: `${smallFontSize}px` }}>
                  {resume.skills.soft.slice(0, 5).map((skill, idx) => (
                    <li key={idx} className="text-gray-700">• {highlightText(skill, highlightKeywords)}</li>
                  ))}
                </ul>
              </div>
            )}
            {resume.skills.other && resume.skills.other.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontSize: `${smallFontSize}px` }}>Additional</h3>
                <ul style={{ fontSize: `${smallFontSize}px` }}>
                  {resume.skills.other.slice(0, 5).map((skill, idx) => (
                    <li key={idx} className="text-gray-700">• {highlightText(skill, highlightKeywords)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Notable Achievements / Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section data-resume-section className="mb-4">
          <h2 className="font-bold mb-2 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>NOTABLE ACHIEVEMENTS</h2>
          <div className="grid grid-cols-2 gap-3">
            {resume.projects.map((project, idx) => (
              <div key={idx} data-resume-section className="bg-amber-50 p-3 rounded border-l-2 border-amber-600" style={{ breakInside: 'avoid' }}>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: `${smallFontSize}px` }}>{project.name}</h3>
                {project.description && <p className="text-gray-700 mt-0.5" style={{ fontSize: `${smallFontSize}px` }}>{highlightText(project.description, highlightKeywords)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section data-resume-section className="mb-4">
          <h2 className="font-bold mb-2 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>PROFESSIONAL EXPERIENCE</h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} data-resume-section className="mb-3" style={{ breakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline border-b border-gray-200 pb-0.5 mb-1">
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: `${subheadingSize}px` }}>{exp.title}</h3>
                  <p className="text-amber-700 font-semibold" style={{ fontSize: `${smallFontSize}px` }}>{exp.company}</p>
                </div>
                <span className="text-gray-600 font-medium" style={{ fontSize: `${smallFontSize}px` }}>
                  {exp.startDate} – {exp.endDate || "Present"}
                </span>
              </div>
              <ul className="space-y-0.5">
                {exp.highlights?.map((highlight, hidx) => (
                  <li key={hidx} className="pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-amber-600" style={{ fontSize: `${smallFontSize}px` }}>
                    {highlightText(highlight, highlightKeywords)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education & Credentials */}
      <div className="grid grid-cols-2 gap-4" data-resume-section style={{ breakInside: 'avoid' }}>
        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="font-bold mb-1.5 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>EDUCATION</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2" style={{ breakInside: 'avoid' }}>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: `${smallFontSize}px` }}>{edu.degree}</h3>
                {edu.field && <p className="text-gray-700" style={{ fontSize: `${smallFontSize}px` }}>{edu.field}</p>}
                <p className="text-gray-600" style={{ fontSize: `${smallFontSize}px` }}>{edu.institution}</p>
                <p className="text-gray-500" style={{ fontSize: `${smallFontSize}px` }}>{edu.endDate || edu.startDate}</p>
              </div>
            ))}
          </section>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <section data-resume-section style={{ breakInside: 'avoid' }}>
            <h2 className="font-bold mb-1.5 tracking-wide" style={{ fontSize: `${sectionTitleSize}px`, color: headingColor }}>CERTIFICATIONS</h2>
            <ul className="space-y-1">
              {resume.certifications.map((cert, idx) => (
                <li key={idx} style={{ fontSize: `${smallFontSize}px` }}>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> – {cert.issuer}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
