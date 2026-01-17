import { z } from "zod";

// Contact Information Schema
export const ContactSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

// Work Experience Schema
export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(), // null/undefined means "Present"
  highlights: z.array(z.string()),
});

// Education Schema
export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

// Project Schema
export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

// Certification Schema
export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().optional(),
});

// Custom Section Schema (for user-added sections)
export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["text", "bullets"]),
  content: z.string().optional(), // For text type
  bullets: z.array(z.string()).optional(), // For bullet type
});

// Skills Schema
export const SkillsSchema = z.object({
  technical: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  soft: z.array(z.string()).optional(),
  other: z.array(z.string()).optional(),
});

// Full Resume JSON Schema (parsed from uploaded resume)
export const ParsedResumeSchema = z.object({
  contact: ContactSchema,
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: SkillsSchema.optional(),
  projects: z.array(ProjectSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),
});

// Tailored Resume JSON Schema (output from LLM)
export const TailoredResumeSchema = z.object({
  contact: ContactSchema,
  summary: z.string(), // Tailored summary for the job
  experience: z.array(ExperienceSchema), // Reordered/tailored highlights
  education: z.array(EducationSchema),
  skills: SkillsSchema, // Prioritized skills matching JD
  projects: z.array(ProjectSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),
  customSections: z.array(CustomSectionSchema).optional(), // User-added custom sections
  matchedKeywords: z.array(z.string()).optional(), // Keywords from JD found in resume
  missingKeywords: z.array(z.string()).optional(), // Keywords from JD not in resume
});

// Job Description Extracted Schema
export const ExtractedJobDescriptionSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).optional(),
  requiredExperience: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()),
});

// Template Types
export const TemplateSlugSchema = z.enum([
  "modern-professional",
  "classic-ats",
  "tech-focused",
]);

export type Contact = z.infer<typeof ContactSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type ExtractedJobDescription = z.infer<typeof ExtractedJobDescriptionSchema>;
export type TemplateSlug = z.infer<typeof TemplateSlugSchema>;

// Design Options for resume customization
export type HeaderAlignment = "left" | "center" | "right";
export type MarginSize = "small" | "medium" | "large";
export type FontFamily = "sans" | "serif" | "mono" | "georgia" | "arial" | "times";
export type HeadingColor = "blue" | "black" | "gray" | "navy" | "green";

export const HEADING_COLORS: { value: HeadingColor; label: string; hex: string }[] = [
  { value: "blue", label: "Blue", hex: "#2563eb" },
  { value: "black", label: "Black", hex: "#111827" },
  { value: "gray", label: "Gray", hex: "#4b5563" },
  { value: "navy", label: "Navy", hex: "#1e3a5f" },
  { value: "green", label: "Green", hex: "#166534" },
];

// Font style for individual elements
export interface FontStyle {
  size?: number;
  family?: FontFamily;
}

export interface DesignOptions {
  headerAlignment: HeaderAlignment;
  marginSize: MarginSize;
  fontFamily: FontFamily;
  fontSize: number; // 12-18
  lineHeight: number; // 1-1.7
  headingColor: HeadingColor;
  // Section order for drag-and-drop reordering
  sectionOrder?: string[];
  // Section-specific font styles (optional - will use defaults based on fontSize if not set)
  sectionFontSizes?: {
    summaryTitle?: number;
    summaryText?: number;
    skillsTitle?: number;
    skillsText?: number;
    projectSectionTitle?: number;  // "PROJECTS" section heading
    projectTitle?: number;          // Individual project names
    projectDescription?: number;
    experienceTitle?: number;
    experienceCompany?: number;
    experienceRole?: number;
    experienceText?: number;
    educationTitle?: number;
    educationText?: number;
  };
  // Section-specific font families (optional)
  sectionFontFamilies?: {
    summaryTitle?: FontFamily;
    summaryText?: FontFamily;
    skillsTitle?: FontFamily;
    skillsText?: FontFamily;
    projectSectionTitle?: FontFamily;  // "PROJECTS" section heading
    projectTitle?: FontFamily;
    projectDescription?: FontFamily;
    experienceTitle?: FontFamily;
    experienceCompany?: FontFamily;
    experienceRole?: FontFamily;
    experienceText?: FontFamily;
    educationTitle?: FontFamily;
    educationText?: FontFamily;
  };
  // Per-education font styles (keyed by index)
  educationFontStyles?: Record<number, FontStyle>;
  // Skill category custom names
  skillCategoryNames?: {
    technical?: string;
    frameworks?: string;
    tools?: string;
    languages?: string;
    soft?: string;
    other?: string;
  };
  // Skill category font styles
  skillCategoryFontStyles?: Record<string, FontStyle>;
  // Subsection ordering (order of items within each section)
  experienceOrder?: number[]; // Array of experience indices in display order
  educationOrder?: number[]; // Array of education indices in display order
  projectOrder?: number[]; // Array of project indices in display order
}

export const DEFAULT_DESIGN_OPTIONS: DesignOptions = {
  headerAlignment: "center",
  marginSize: "medium",
  fontFamily: "serif",
  fontSize: 14,
  lineHeight: 1.4,
  headingColor: "black",
  sectionOrder: ["summary", "skills", "projects", "experience", "education", "certifications"],
  sectionFontSizes: undefined, // Uses defaults based on fontSize
  sectionFontFamilies: undefined, // Uses defaults based on fontFamily
  educationFontStyles: undefined,
  skillCategoryNames: undefined, // Uses defaults
  skillCategoryFontStyles: undefined,
};

export const FONT_FAMILIES: { value: FontFamily; label: string; css: string }[] = [
  { value: "sans", label: "Sans Serif", css: "ui-sans-serif, system-ui, sans-serif" },
  { value: "serif", label: "Serif", css: "ui-serif, Georgia, serif" },
  { value: "georgia", label: "Georgia", css: "Georgia, serif" },
  { value: "times", label: "Times New Roman", css: "Times New Roman, Times, serif" },
  { value: "arial", label: "Arial", css: "Arial, Helvetica, sans-serif" },
  { value: "mono", label: "Monospace", css: "ui-monospace, monospace" },
];

export const MARGIN_SIZES: { value: MarginSize; label: string; padding: string }[] = [
  { value: "small", label: "Small", padding: "1rem" },
  { value: "medium", label: "Medium", padding: "2rem" },
  { value: "large", label: "Large", padding: "3rem" },
];

// Template metadata
export interface TemplateInfo {
  slug: TemplateSlug;
  name: string;
  description: string;
  previewImage: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    slug: "modern-professional",
    name: "Modern Professional",
    description: "Clean, contemporary design with subtle accent colors. Perfect for corporate roles.",
    previewImage: "/templates/modern-professional.png",
  },
  {
    slug: "classic-ats",
    name: "Classic ATS",
    description: "Traditional format optimized for applicant tracking systems. Maximum compatibility.",
    previewImage: "/templates/classic-ats.png",
  },
  {
    slug: "tech-focused",
    name: "Accent",
    description: "Elegant design with customizable accent colors. Clean and professional.",
    previewImage: "/templates/tech-focused.png",
  },
];
