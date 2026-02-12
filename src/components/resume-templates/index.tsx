import { TailoredResume, TemplateSlug, DesignOptions, DEFAULT_DESIGN_OPTIONS } from "@/types/resume";
import ClassicATS from "./ClassicATS";
import type { AccentColor } from "./TechFocused";
import { ACCENT_COLORS } from "./TechFocused";

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
    case "classic-ats":
      return <ClassicATS resume={resume} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
    default:
      return <ClassicATS resume={resume} designOptions={designOptions} highlightKeywords={highlightKeywords} />;
  }
}

export { ClassicATS, ACCENT_COLORS };
export type { AccentColor };
