"use client";

import { TailoredResume } from "@/types/resume";

interface HighlightedResumeProps {
  resume: TailoredResume;
  keywords: string[];
}

// Highlight keywords in a text string
function highlightText(text: string, keywords: string[]): React.ReactNode {
  if (!text || keywords.length === 0) return text;
  
  // Create a regex pattern that matches any of the keywords (case insensitive, whole words)
  const pattern = keywords
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
    .join('|');
  
  if (!pattern) return text;
  
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) {
      return (
        <mark key={idx} className="bg-green-200 text-green-900 px-0.5 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export default function HighlightedResume({ resume, keywords }: HighlightedResumeProps) {
  return (
    <div className="p-8 max-w-[8.5in] mx-auto bg-white font-sans text-gray-800 print:p-0">
      {/* Header */}
      <header className="border-b-2 border-green-600 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{resume.contact.name}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
          {resume.contact.linkedin && (
            <a href={resume.contact.linkedin} className="text-green-600 hover:underline">
              LinkedIn
            </a>
          )}
          {resume.contact.github && (
            <a href={resume.contact.github} className="text-green-600 hover:underline">
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-2">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{highlightText(resume.summary, keywords)}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-3">Experience</h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-semibold text-gray-900">{highlightText(exp.title, keywords)}</h3>
                  <p className="text-sm text-gray-600">
                    {exp.company}
                    {exp.location && (" · " + exp.location)}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {exp.startDate} – {exp.endDate || "Present"}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {exp.highlights?.map((highlight, hidx) => (
                  <li key={hidx} className="text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-green-600">
                    {highlightText(highlight, keywords)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-2">Skills</h2>
          <div className="space-y-1 text-sm">
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <p>
                <span className="font-medium">Technical:</span>{" "}
                {resume.skills.technical.map((skill, idx) => (
                  <span key={idx}>
                    {idx > 0 && ", "}
                    {keywords.some(k => k.toLowerCase() === skill.toLowerCase()) ? (
                      <mark className="bg-green-200 text-green-900 px-0.5 rounded">{skill}</mark>
                    ) : skill}
                  </span>
                ))}
              </p>
            )}
            {resume.skills.frameworks && resume.skills.frameworks.length > 0 && (
              <p>
                <span className="font-medium">Frameworks:</span>{" "}
                {resume.skills.frameworks.map((skill, idx) => (
                  <span key={idx}>
                    {idx > 0 && ", "}
                    {keywords.some(k => k.toLowerCase() === skill.toLowerCase()) ? (
                      <mark className="bg-green-200 text-green-900 px-0.5 rounded">{skill}</mark>
                    ) : skill}
                  </span>
                ))}
              </p>
            )}
            {resume.skills.tools && resume.skills.tools.length > 0 && (
              <p>
                <span className="font-medium">Tools:</span>{" "}
                {resume.skills.tools.map((skill, idx) => (
                  <span key={idx}>
                    {idx > 0 && ", "}
                    {keywords.some(k => k.toLowerCase() === skill.toLowerCase()) ? (
                      <mark className="bg-green-200 text-green-900 px-0.5 rounded">{skill}</mark>
                    ) : skill}
                  </span>
                ))}
              </p>
            )}
            {resume.skills.languages && resume.skills.languages.length > 0 && (
              <p>
                <span className="font-medium">Languages:</span>{" "}
                {resume.skills.languages.map((skill, idx) => (
                  <span key={idx}>
                    {idx > 0 && ", "}
                    {keywords.some(k => k.toLowerCase() === skill.toLowerCase()) ? (
                      <mark className="bg-green-200 text-green-900 px-0.5 rounded">{skill}</mark>
                    ) : skill}
                  </span>
                ))}
              </p>
            )}
            {resume.skills.other && resume.skills.other.length > 0 && (
              <p>
                <span className="font-medium">Other:</span>{" "}
                {resume.skills.other.map((skill, idx) => (
                  <span key={idx}>
                    {idx > 0 && ", "}
                    {keywords.some(k => k.toLowerCase() === skill.toLowerCase()) ? (
                      <mark className="bg-green-200 text-green-900 px-0.5 rounded">{skill}</mark>
                    ) : skill}
                  </span>
                ))}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-3">Education</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {edu.degree}
                    {edu.field && (" in " + edu.field)}
                  </h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-500">{edu.endDate || edu.startDate}</span>
              </div>
              {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-3">Projects</h2>
          {resume.projects.map((project, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold text-gray-900">
                {project.name}
                {project.url && (
                  <a href={project.url} className="text-green-600 text-sm ml-2 font-normal hover:underline">
                    [Link]
                  </a>
                )}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-600">{highlightText(project.description, keywords)}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-green-600 uppercase tracking-wide mb-2">Certifications</h2>
          <ul className="text-sm space-y-1">
            {resume.certifications.map((cert, idx) => (
              <li key={idx}>
                {highlightText(cert.name, keywords)}
                {cert.issuer && (" – " + cert.issuer)}
                {cert.date && (" (" + cert.date + ")")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Legend */}
      <div className="mt-8 pt-4 border-t text-xs text-gray-500 flex items-center gap-2">
        <span className="font-medium">Legend:</span>
        <mark className="bg-green-200 text-green-900 px-1 rounded">Highlighted text</mark>
        <span>= Keywords added/matched from job description</span>
      </div>
    </div>
  );
}
