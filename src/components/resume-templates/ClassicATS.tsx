import React from "react";
import {
  TailoredResume,
  DesignOptions,
  DEFAULT_DESIGN_OPTIONS,
  FONT_FAMILIES,
  MARGIN_SIZES,
  HEADING_COLORS,
  FontFamily,
} from "@/types/resume";

interface ClassicATSProps {
  resume: TailoredResume;
  designOptions?: DesignOptions;
  highlightKeywords?: string[];
}

// Apply keyword highlighting to a plain text string (no bold markers)
function applyKeywordHighlight(text: string, keywords: string[], keyPrefix: string): React.ReactNode {
  if (!keywords || keywords.length === 0) return text;
  const validKeywords = keywords.filter((k) => k.length > 1);
  if (validKeywords.length === 0) return text;

  const pattern = new RegExp(
    `\\b(${validKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi",
  );
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    const isKeyword = validKeywords.some(
      (k) => k.toLowerCase() === part.toLowerCase(),
    );
    if (isKeyword) {
      return (
        <span
          key={`${keyPrefix}-${idx}`}
          className="relative inline-block"
          style={{
            background: "linear-gradient(120deg, #a7f3d0 0%, #6ee7b7 100%)",
            padding: "0 4px",
            borderRadius: "3px",
            fontWeight: 600,
            boxShadow: "0 1px 2px rgba(16, 185, 129, 0.2)",
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

// Parse **bold** markers and keyword highlights together
function highlightText(text: string, keywords: string[]): React.ReactNode {
  const boldRegex = /\*\*(.+?)\*\*/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      segments.push(<React.Fragment key={`p-${lastIndex}`}>{applyKeywordHighlight(plain, keywords, `p${lastIndex}`)}</React.Fragment>);
    }
    segments.push(
      <strong key={`b-${match.index}`}>{applyKeywordHighlight(match[1], keywords, `b${match.index}`)}</strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    segments.push(<React.Fragment key={`p-${lastIndex}`}>{applyKeywordHighlight(remaining, keywords, `p${lastIndex}`)}</React.Fragment>);
  }

  if (segments.length === 0) return applyKeywordHighlight(text, keywords, "t");
  return <>{segments}</>;
}

export default function ClassicATS({
  resume,
  designOptions = DEFAULT_DESIGN_OPTIONS,
  highlightKeywords = [],
}: ClassicATSProps) {
  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed;
  };
  const toHref = (url?: string) => {
    const trimmed = normalizeUrl(url);
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
      return trimmed;
    return `https://${trimmed}`;
  };
  const effectiveFontFamily =
    designOptions.fontFamily === "serif" ? "times" : designOptions.fontFamily;
  const fontFamily =
    FONT_FAMILIES.find((f) => f.value === effectiveFontFamily)?.css ||
    FONT_FAMILIES[1].css;
  const padding =
    MARGIN_SIZES.find((m) => m.value === designOptions.marginSize)?.padding ||
    "2rem";
  const headingColor =
    HEADING_COLORS.find((c) => c.value === designOptions.headingColor)?.hex ||
    "#111827";
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
  const projectSectionTitleSize =
    sectionFonts.projectSectionTitle || defaultSectionTitleSize;
  const projectTitleSize = sectionFonts.projectTitle || subheadingSize;
  const projectDescSize = sectionFonts.projectDescription || bodyFontSize;
  const experienceTitleSize =
    sectionFonts.experienceTitle || defaultSectionTitleSize;
  const experienceCompanySize =
    sectionFonts.experienceCompany || subheadingSize;
  const experienceRoleSize = sectionFonts.experienceRole || subheadingSize;
  const experienceTextSize = sectionFonts.experienceText || bodyFontSize;
  const educationTitleSize =
    sectionFonts.educationTitle || defaultSectionTitleSize;
  const educationTextSize = sectionFonts.educationText || bodyFontSize;

  // Section-specific font families (with fallbacks to global fontFamily)
  const sectionFontFamilies = designOptions.sectionFontFamilies || {};
  const getFontFamily = (
    key: keyof NonNullable<typeof designOptions.sectionFontFamilies>,
  ) => {
    const familyValue = (sectionFontFamilies[key] ||
      effectiveFontFamily) as FontFamily;
    return (
      FONT_FAMILIES.find((f) => f.value === familyValue)?.css || fontFamily
    );
  };

  const contactItems: React.ReactNode[] = [];
  if (resume.contact.phone) {
    contactItems.push(
      <span
        key="phone"
        style={{
          fontSize: `${contactPhoneSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        {resume.contact.phone}
      </span>,
    );
  }
  if (resume.contact.email) {
    contactItems.push(
      <span
        key="email"
        style={{
          fontSize: `${contactEmailSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a>
      </span>,
    );
  }
  if (resume.contact.location) {
    contactItems.push(
      <span
        key="location"
        style={{
          fontSize: `${contactLocationSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        {resume.contact.location}
      </span>,
    );
  }
  if (resume.contact.linkedin) {
    contactItems.push(
      <span
        key="linkedin"
        style={{
          fontSize: `${contactLinkedinSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        <a
          href={toHref(resume.contact.linkedin)}
          target="_blank"
          rel="noreferrer"
        >
          {resume.contact.linkedinText || "LinkedIn"}
        </a>
      </span>,
    );
  }
  if (resume.contact.github) {
    contactItems.push(
      <span
        key="github"
        style={{
          fontSize: `${contactGithubSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        <a
          href={toHref(resume.contact.github)}
          target="_blank"
          rel="noreferrer"
        >
          {resume.contact.githubText || "Github"}
        </a>
      </span>,
    );
  }
  if (resume.contact.portfolio) {
    contactItems.push(
      <span
        key="portfolio"
        style={{
          fontSize: `${contactInfoSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        <a
          href={toHref(resume.contact.portfolio)}
          target="_blank"
          rel="noreferrer"
        >
          {resume.contact.portfolioText || resume.contact.portfolio}
        </a>
      </span>,
    );
  }
  if (resume.contact.website) {
    contactItems.push(
      <span
        key="website"
        style={{
          fontSize: `${contactWebsiteSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        <a
          href={toHref(resume.contact.website)}
          target="_blank"
          rel="noreferrer"
        >
          {resume.contact.website}
        </a>
      </span>,
    );
  }
  if (resume.contact.visaStatus) {
    contactItems.push(
      <span
        key="visaStatus"
        style={{
          fontSize: `${contactInfoSize}px`,
          fontFamily: getFontFamily("contactInfo"),
        }}
      >
        {resume.contact.visaStatus}
      </span>,
    );
  }

  // Get section order with defaults (append missing new sections)
  const defaultSectionOrder = [
    "summary",
    "skills",
    "coursework",
    "experience",
    "projects",
    "leadership",
    "certifications",
    "education",
  ];
  const legacySectionOrder = [
    "summary",
    "education",
    "coursework",
    "experience",
    "projects",
    "skills",
    "leadership",
    "certifications",
  ];
  const hasLegacyOrder =
    designOptions.sectionOrder &&
    JSON.stringify(designOptions.sectionOrder) ===
      JSON.stringify(legacySectionOrder);
  const baseOrder = hasLegacyOrder
    ? defaultSectionOrder
    : designOptions.sectionOrder;
  const sectionOrder =
    baseOrder && baseOrder.length > 0
      ? [
          ...baseOrder,
          ...defaultSectionOrder.filter((s) => !baseOrder.includes(s)),
        ]
      : defaultSectionOrder;

  // Get subsection ordering (order of items within sections)
  const getOrderedItems = <T,>(items: T[], orderArray?: number[]): T[] => {
    if (!orderArray || orderArray.length === 0) return items;
    // Map order indices to items, filtering out invalid indices
    return orderArray
      .filter((idx) => idx >= 0 && idx < items.length)
      .map((idx) => items[idx]);
  };

  // Render individual sections
  const renderSection = (sectionKey: string) => {
    // Handle custom sections (format: custom-{id})
    if (sectionKey.startsWith("custom-")) {
      const customId = sectionKey.replace("custom-", "");
      const customSection = resume.customSections?.find(
        (s) => s.id === customId,
      );
      if (!customSection) return null;

      return (
        <section
          key={sectionKey}
          data-resume-section
          className="mb-3"
          style={{ breakInside: "avoid" }}
        >
          <h2
            className="font-bold uppercase mb-1.5 pb-0.5"
            style={{
              fontSize: `${defaultSectionTitleSize}px`,
              color: headingColor,
              borderBottom: `1px solid ${headingColor}`,
            }}
          >
            {customSection.title}
          </h2>
          {customSection.type === "text" ? (
            <p style={{ fontSize: `${defaultSmallFontSize}px` }}>
              {highlightText(customSection.content || "", highlightKeywords)}
            </p>
          ) : (
            <ul
              className="list-disc"
              style={{
                fontSize: `${defaultSmallFontSize}px`,
                listStylePosition: "outside",
                paddingLeft: "1.7em",
              }}
            >
              {customSection.bullets?.map((bullet, idx) => (
                <li key={idx}>{highlightText(bullet, highlightKeywords)}</li>
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
          <section
            key={sectionKey}
            data-resume-section
            className="mb-3"
            style={{ breakInside: "avoid" }}
          >
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${summaryTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("summaryTitle"),
              }}
            >
              Summary
            </h2>
            <p
              style={{
                fontSize: `${summaryTextSize}px`,
                fontFamily: getFontFamily("summaryText"),
              }}
            >
              {highlightText(resume.summary, highlightKeywords)}
            </p>
          </section>
        );

      case "education":
        if (!resume.education || resume.education.length === 0) return null;
        const orderedEducation = getOrderedItems(
          resume.education,
          designOptions.educationOrder,
        );
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${educationTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("educationTitle"),
              }}
            >
              Education
            </h2>
            <div style={{ fontFamily: getFontFamily("educationText") }}>
              {orderedEducation.map((edu, idx) => {
                const eduFontStyle = designOptions.educationFontStyles?.[idx];
                const eduTextSize = eduFontStyle?.size || educationTextSize;
                const eduFontFam = eduFontStyle?.family
                  ? FONT_FAMILIES.find((f) => f.value === eduFontStyle.family)
                      ?.css
                  : getFontFamily("educationText");
                const institutionSize =
                  eduFontStyle?.size || experienceCompanySize;
                return (
                  <div
                    key={idx}
                    className="mb-2"
                    style={{ breakInside: "avoid" }}
                  >
                    <div className="flex justify-between">
                      <span
                        className="font-bold"
                        style={{
                          fontSize: `${institutionSize}px`,
                          fontFamily: eduFontFam,
                        }}
                      >
                        {edu.institution}
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          fontSize: `${eduTextSize}px`,
                          fontFamily: eduFontFam,
                        }}
                      >
                        {edu.endDate || edu.startDate || ""}
                      </span>
                    </div>
                    <div
                      className="flex justify-between italic"
                      style={{
                        fontSize: `${eduTextSize}px`,
                        fontFamily: eduFontFam,
                      }}
                    >
                      <span>
                        {edu.degree}
                        {edu.field ? ` in ${edu.field}` : ""}
                      </span>
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
              style={{
                fontSize: `${defaultSectionTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
              }}
            >
              Relevant Coursework
            </h2>
            <div
              className="text-sm"
              style={{
                columnCount: 4,
                columnGap: "0.5rem",
                fontSize: `${defaultSmallFontSize}px`,
              }}
            >
              <ul
                className="list-disc space-y-1"
                style={{
                  breakInside: "avoid",
                  listStylePosition: "outside",
                  paddingLeft: "1.7em",
                }}
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
        const orderedExperience = getOrderedItems(
          resume.experience,
          designOptions.experienceOrder,
        );
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${experienceTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("experienceTitle"),
              }}
            >
              Experience
            </h2>
            {orderedExperience.map((exp, idx) => (
              <div
                key={idx}
                data-resume-section
                className="mb-2"
                style={{ breakInside: "avoid" }}
              >
                <div className="flex justify-between items-baseline">
                  <span
                    className="font-bold"
                    style={{
                      fontSize: `${experienceCompanySize}px`,
                      fontFamily: getFontFamily("experienceCompany"),
                    }}
                  >
                    {exp.company}
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily("experienceText"),
                    }}
                  >
                    {exp.startDate} - {exp.endDate || "Present"}
                  </span>
                </div>
                <div
                  className="italic"
                  style={{
                    fontSize: `${experienceRoleSize}px`,
                    fontFamily: getFontFamily("experienceRole"),
                  }}
                >
                  {exp.title}
                  {exp.location && " | " + exp.location}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily("experienceText"),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx}>
                        {highlightText(highlight, highlightKeywords)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        );

      case "projects":
        if (!resume.projects || resume.projects.length === 0) return null;
        const orderedProjects = getOrderedItems(
          resume.projects,
          designOptions.projectOrder,
        );
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${projectSectionTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("projectSectionTitle"),
              }}
            >
              Projects
            </h2>
            {orderedProjects.map((project, idx) => (
              <div
                key={idx}
                data-resume-section
                className="mb-1.5"
                style={{ breakInside: "avoid" }}
              >
                <div className="flex justify-between items-baseline">
                  <span
                    className="font-bold"
                    style={{
                      fontSize: `${projectTitleSize}px`,
                      fontFamily: getFontFamily("projectTitle"),
                    }}
                  >
                    {project.name}
                    {(project.liveUrl || project.githubUrl || project.otherUrl) && (
                      <span
                        className="font-normal"
                        style={{
                          fontSize: `${projectDescSize}px`,
                          fontFamily: getFontFamily("projectDescription"),
                        }}
                      >
                        {project.liveUrl && (
                          <>
                            {" | "}
                            <svg
                              style={{ display: "inline", verticalAlign: "middle", width: `${projectDescSize}px`, height: `${projectDescSize}px`, marginRight: "2px" }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            <a
                              href={toHref(project.liveUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {project.liveText || project.liveUrl}
                            </a>
                          </>
                        )}
                        {project.githubUrl && (
                          <>
                            {" | "}
                            <svg
                              style={{ display: "inline", verticalAlign: "middle", width: `${projectDescSize}px`, height: `${projectDescSize}px`, marginRight: "2px" }}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <a
                              href={toHref(project.githubUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {project.githubText || project.githubUrl}
                            </a>
                          </>
                        )}
                        {project.otherUrl && (
                          <>
                            {" | "}
                            <svg
                              style={{ display: "inline", verticalAlign: "middle", width: `${projectDescSize}px`, height: `${projectDescSize}px`, marginRight: "2px" }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <a
                              href={toHref(project.otherUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {project.otherText || project.otherUrl}
                            </a>
                          </>
                        )}
                      </span>
                    )}
                  </span>
                </div>
                {project.highlights && project.highlights.length > 0 ? (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${projectDescSize}px`,
                      fontFamily: getFontFamily("projectDescription"),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {project.highlights.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {highlightText(item, highlightKeywords)}
                      </li>
                    ))}
                  </ul>
                ) : project.description ? (
                  <ul
                    className="list-disc mt-0.5"
                    style={{
                      fontSize: `${projectDescSize}px`,
                      fontFamily: getFontFamily("projectDescription"),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    <li>
                      {highlightText(project.description, highlightKeywords)}
                    </li>
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        );

      case "skills":
        if (!resume.skills) return null;
        const frontendSkills = resume.skills.frontend || [];
        const backendSkills = resume.skills.backend || [];
        const databaseSkills = resume.skills.databases || [];
        const infraSkills = resume.skills.infrastructure || [];
        const securitySkills = resume.skills.security || [];
        const conceptSkills = resume.skills.concepts || [];
        const skillRows: { label: string; items: string[] }[] = [
          { label: "Frontend", items: frontendSkills },
          { label: "Backend", items: backendSkills },
          { label: "Databases", items: databaseSkills },
          { label: "Infrastructure & DevOps", items: infraSkills },
          { label: "Security & Web Standards", items: securitySkills },
          { label: "Concepts", items: conceptSkills },
        ].filter((r) => r.items.length > 0);
        if (skillRows.length === 0) return null;
        return (
          <section
            key={sectionKey}
            data-resume-section
            className="mb-3"
            style={{ breakInside: "avoid" }}
          >
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${skillsTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("skillsTitle"),
              }}
            >
              Technical Skills
            </h2>
            <div
              style={{
                fontSize: `${skillsTextSize}px`,
                fontFamily: getFontFamily("skillsText"),
              }}
            >
              {skillRows.map((row, idx) => (
                <div key={idx}>
                  <span className="font-bold">{row.label}:</span>{" "}
                  {highlightText(row.items.join(", "), highlightKeywords)}
                </div>
              ))}
            </div>
          </section>
        );

      case "leadership":
        if (!resume.leadership || resume.leadership.length === 0) return null;
        return (
          <section key={sectionKey} data-resume-section className="mb-3">
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${experienceTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
                fontFamily: getFontFamily("experienceTitle"),
              }}
            >
              Leadership / Extracurricular
            </h2>
            {resume.leadership.map((exp, idx) => (
              <div
                key={idx}
                data-resume-section
                className="mb-2"
                style={{ breakInside: "avoid" }}
              >
                <div className="flex justify-between items-baseline">
                  <span
                    className="font-bold"
                    style={{
                      fontSize: `${experienceCompanySize}px`,
                      fontFamily: getFontFamily("experienceCompany"),
                    }}
                  >
                    {exp.company}
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily("experienceText"),
                    }}
                  >
                    {exp.startDate} - {exp.endDate || "Present"}
                  </span>
                </div>
                <div
                  className="italic"
                  style={{
                    fontSize: `${experienceRoleSize}px`,
                    fontFamily: getFontFamily("experienceRole"),
                  }}
                >
                  {exp.title}
                  {exp.location && " | " + exp.location}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul
                    className="list-disc mt-1"
                    style={{
                      fontSize: `${experienceTextSize}px`,
                      fontFamily: getFontFamily("experienceText"),
                      listStylePosition: "outside",
                      paddingLeft: "1.7em",
                    }}
                  >
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx}>
                        {highlightText(highlight, highlightKeywords)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        );

      case "certifications":
        if (!resume.certifications || resume.certifications.length === 0)
          return null;
        return (
          <section
            key={sectionKey}
            data-resume-section
            style={{ breakInside: "avoid" }}
          >
            <h2
              className="font-bold uppercase mb-1.5 pb-0.5"
              style={{
                fontSize: `${defaultSectionTitleSize}px`,
                color: headingColor,
                borderBottom: `1px solid ${headingColor}`,
              }}
            >
              Certifications
            </h2>
            <ul
              className="list-disc"
              style={{
                fontSize: `${defaultSmallFontSize}px`,
                listStylePosition: "outside",
                paddingLeft: "1.7em",
              }}
            >
              {resume.certifications.map((cert, idx) => (
                <li key={idx}>
                  {cert.name}
                  {cert.issuer && " - " + cert.issuer}
                  {cert.date && " (" + cert.date + ")"}
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
          style={{
            fontSize: `${contactNameSize}px`,
            color: headingColor,
            fontFamily: getFontFamily("contactName"),
          }}
        >
          {resume.contact.name}
        </h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
          {contactItems.map((item, idx) => (
            <span
              className="flex flex-wrap gap-x-1 items-center justify-center"
              key={idx}
            >
              {item} {idx >= 0 && idx < contactItems.length - 1 ? " • " : ""}
            </span>
          ))}
        </div>
      </header>

      {/* Render sections in custom order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
