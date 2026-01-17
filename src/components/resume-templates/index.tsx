import { TailoredResume, TemplateSlug, DesignOptions, DEFAULT_DESIGN_OPTIONS } from "@/types/resume";
import ModernProfessional from "./ModernProfessional";
import ClassicATS from "./ClassicATS";
import TechFocused, { AccentColor, ACCENT_COLORS } from "./TechFocused";

interface ResumeTemplateProps {
  resume: TailoredResume;
  template: TemplateSlug;
  accentColor?: AccentColor;
  designOptions?: DesignOptions;
  highlightKeywords?: string[];
}

export function ResumeTemplate({ 
  resume, 
  template, 
  accentColor = "purple",
  designOptions = DEFAULT_DESIGN_OPTIONS,
  highlightKeywords = []
}: ResumeTemplateProps) {
  switch (template) {
    case "modern-professional":
      return <ModernProfessional resume={resume} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
    case "classic-ats":
      return <ClassicATS resume={resume} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
    case "tech-focused":
      return <TechFocused resume={resume} accentColor={accentColor} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
    default:
      return <ClassicATS resume={resume} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
  }
}

export { ModernProfessional, ClassicATS, TechFocused, ACCENT_COLORS };
export type { AccentColor };
