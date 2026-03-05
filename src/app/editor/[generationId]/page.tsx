"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeTemplate } from "@/components/resume-templates";
import { PagedResumePreview } from "@/components/PagedResumePreview";
import { AiBulletRewriter } from "@/components/AiBulletRewriter";
import { BoldToggleButton } from "@/components/BoldToggleButton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { 
  TailoredResume, 
  Experience, 
  Education, 
  Project, 
  TemplateSlug, 
  DEFAULT_DESIGN_OPTIONS, 
  DesignOptions, 
  MARGIN_SIZES, 
  MarginSize, 
  HEADING_COLORS, 
  HeadingColor,
  FONT_FAMILIES,
  FontFamily
} from "@/types/resume";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderOpen, 
  Award, 
  ChevronDown, 
  ChevronRight, 
  Settings2, 
  Minus,
  Type,
  ArrowUp,
  ArrowDown,
  BookOpen,
  FileText,
  List,
  UserCircle,
  Users
} from "lucide-react";

// Font family select component
function FontFamilySelect({ 
  value, 
  onChange,
  className = ""
}: { 
  value: FontFamily; 
  onChange: (val: FontFamily) => void;
  className?: string;
}) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as FontFamily)}
      className={`text-xs border rounded px-1 py-0.5 h-5 ${className}`}
    >
      {FONT_FAMILIES.map(f => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  );
}

// Combined font control component
function FontControl({ 
  label, 
  size, 
  onSizeChange, 
  family, 
  onFamilyChange,
  min = 8,
  max = 30,
  step = 0.5
}: { 
  label: string; 
  size: number; 
  onSizeChange: (val: number) => void;
  family: FontFamily;
  onFamilyChange: (val: FontFamily) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-50 rounded border">
      <Type className="h-3 w-3 text-gray-400" />
      <span className="text-xs text-gray-600 min-w-12">{label}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
          onClick={() => onSizeChange(Math.max(min, Math.round((size - step) * 10) / 10))}
          disabled={size <= min}
        ><Minus className="h-2 w-2" /></Button>
        <span className="text-xs min-w-[2.5rem] text-center">{size}</span>
        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
          onClick={() => onSizeChange(Math.min(max, Math.round((size + step) * 10) / 10))}
          disabled={size >= max}
        ><Plus className="h-2 w-2" /></Button>
      </div>
      <FontFamilySelect value={family} onChange={onFamilyChange} />
    </div>
  );
}

// Section types for ordering
type SectionKey = "summary" | "education" | "coursework" | "experience" | "projects" | "skills" | "leadership" | "certifications";

const SECTION_ICONS: Record<SectionKey, React.ElementType> = {
  summary: Briefcase,
  education: GraduationCap,
  coursework: BookOpen,
  experience: Briefcase,
  projects: FolderOpen,
  skills: Wrench,
  leadership: Users,
  certifications: Award
};

// Collapsible Section Component with drag handles
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  action,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  action?: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center">
        {/* Drag/Reorder controls */}
        <div className="flex flex-col border-r p-1 bg-gray-50">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move section up"
          >
            <ArrowUp className="h-3 w-3 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move section down"
          >
            <ArrowDown className="h-3 w-3 text-gray-500" />
          </button>
        </div>
        
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="flex-1 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <Icon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {action && (
            <div onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </Card>
  );
}

// Simple collapsible for non-reorderable sections
function SimpleCollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  action
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <Icon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {action && (
          <div onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </Card>
  );
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params.generationId as string;
  
  const [resume, setResume] = useState<TailoredResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSlug>("classic-ats");
  const [designOptions, setDesignOptions] = useState<DesignOptions>(DEFAULT_DESIGN_OPTIONS);
  const [projectTechInputs, setProjectTechInputs] = useState<Record<number, string>>({});
  const [jobDescription, setJobDescription] = useState<string>("");
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    const storedResume = sessionStorage.getItem(`resume-${generationId}`);
    const storedTemplate = sessionStorage.getItem(`template-${generationId}`);
    const storedDesignOptions = sessionStorage.getItem(`designOptions-${generationId}`);
    const storedJobDescription = sessionStorage.getItem(`jobDescription-${generationId}`);
    
    if (storedResume) {
      try {
        setResume(JSON.parse(storedResume));
      } catch {
        console.error("Failed to parse resume");
      }
    }
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate as TemplateSlug);
    }
    if (storedDesignOptions) {
      try {
        setDesignOptions(JSON.parse(storedDesignOptions));
      } catch {
        console.error("Failed to parse design options");
      }
    }
    if (storedJobDescription) {
      setJobDescription(storedJobDescription);
    }
    setIsLoading(false);
  }, [generationId]);

  // Get section order with defaults
  const defaultSectionOrder = DEFAULT_DESIGN_OPTIONS.sectionOrder || ["summary", "skills", "coursework", "experience", "projects", "leadership", "certifications", "education"];
  const legacySectionOrder = ["summary", "education", "coursework", "experience", "projects", "skills", "leadership", "certifications"];
  const hasLegacyOrder =
    designOptions.sectionOrder &&
    JSON.stringify(designOptions.sectionOrder) === JSON.stringify(legacySectionOrder);
  const baseOrder = hasLegacyOrder ? defaultSectionOrder : designOptions.sectionOrder;
  const sectionOrder = baseOrder && baseOrder.length > 0
    ? [...baseOrder, ...defaultSectionOrder.filter(s => !baseOrder.includes(s))]
    : defaultSectionOrder;

  // Move section up/down
  const moveSection = useCallback((sectionKey: SectionKey, direction: 'up' | 'down') => {
    const currentOrder = [...sectionOrder];
    const idx = currentOrder.indexOf(sectionKey);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    
    // Swap
    [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
    
    setDesignOptions(prev => ({ ...prev, sectionOrder: currentOrder }));
    setHasChanges(true);
  }, [sectionOrder]);

  const handleSave = () => {
    if (!resume) return;
    setIsSaving(true);
    
    sessionStorage.setItem(`resume-${generationId}`, JSON.stringify(resume));
    sessionStorage.setItem(`designOptions-${generationId}`, JSON.stringify(designOptions));
    
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleSaveAndPreview = () => {
    handleSave();
    if (generationId === "parsed-draft") {
      router.push("/generate");
    } else {
      router.push(`/preview/${generationId}`);
    }
  };

  const updateResume = (updates: Partial<TailoredResume>) => {
    if (!resume) return;
    setResume({ ...resume, ...updates });
    setHasChanges(true);
  };

  const updateContact = (field: string, value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      contact: { ...resume.contact, [field]: value },
    });
    setHasChanges(true);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    if (!resume) return;
    const newExperience = [...resume.experience];
    newExperience[index] = { ...newExperience[index], ...updates };
    setResume({ ...resume, experience: newExperience });
    setHasChanges(true);
  };

  const updateExperienceHighlight = (expIndex: number, highlightIndex: number, value: string) => {
    if (!resume) return;
    const newExperience = [...resume.experience];
    const newHighlights = [...(newExperience[expIndex].highlights || [])];
    newHighlights[highlightIndex] = value;
    newExperience[expIndex] = { ...newExperience[expIndex], highlights: newHighlights };
    setResume({ ...resume, experience: newExperience });
    setHasChanges(true);
  };

  const addExperienceHighlight = (expIndex: number) => {
    if (!resume) return;
    const newExperience = [...resume.experience];
    const newHighlights = [...(newExperience[expIndex].highlights || []), ""];
    newExperience[expIndex] = { ...newExperience[expIndex], highlights: newHighlights };
    setResume({ ...resume, experience: newExperience });
    setHasChanges(true);
  };

  const removeExperienceHighlight = (expIndex: number, highlightIndex: number) => {
    if (!resume) return;
    const newExperience = [...resume.experience];
    const newHighlights = [...(newExperience[expIndex].highlights || [])];
    newHighlights.splice(highlightIndex, 1);
    newExperience[expIndex] = { ...newExperience[expIndex], highlights: newHighlights };
    setResume({ ...resume, experience: newExperience });
    setHasChanges(true);
  };

  const addExperience = () => {
    if (!resume) return;
    const newExp: Experience = {
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      highlights: [""],
    };
    setResume({ ...resume, experience: [...resume.experience, newExp] });
    setHasChanges(true);
  };

  const removeExperience = (index: number) => {
    if (!resume) return;
    const newExperience = [...resume.experience];
    newExperience.splice(index, 1);
    setResume({ ...resume, experience: newExperience });
    setHasChanges(true);
  };

  const updateLeadership = (index: number, updates: Partial<Experience>) => {
    if (!resume) return;
    const current = resume.leadership || [];
    const next = [...current];
    next[index] = { ...next[index], ...updates };
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const updateLeadershipHighlight = (expIndex: number, highlightIndex: number, value: string) => {
    if (!resume) return;
    const current = resume.leadership || [];
    const next = [...current];
    const newHighlights = [...(next[expIndex]?.highlights || [])];
    newHighlights[highlightIndex] = value;
    next[expIndex] = { ...next[expIndex], highlights: newHighlights };
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const addLeadershipHighlight = (expIndex: number) => {
    if (!resume) return;
    const current = resume.leadership || [];
    const next = [...current];
    const newHighlights = [...(next[expIndex]?.highlights || []), ""];
    next[expIndex] = { ...next[expIndex], highlights: newHighlights };
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const removeLeadershipHighlight = (expIndex: number, highlightIndex: number) => {
    if (!resume) return;
    const current = resume.leadership || [];
    const next = [...current];
    const newHighlights = [...(next[expIndex]?.highlights || [])];
    newHighlights.splice(highlightIndex, 1);
    next[expIndex] = { ...next[expIndex], highlights: newHighlights };
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const addLeadership = () => {
    if (!resume) return;
    const next = [
      ...(resume.leadership || []),
      { company: "", title: "", startDate: "", endDate: "", highlights: [""] },
    ];
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const removeLeadership = (index: number) => {
    if (!resume) return;
    const next = [...(resume.leadership || [])];
    next.splice(index, 1);
    setResume({ ...resume, leadership: next });
    setHasChanges(true);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    if (!resume) return;
    const newEducation = [...resume.education];
    newEducation[index] = { ...newEducation[index], ...updates };
    setResume({ ...resume, education: newEducation });
    setHasChanges(true);
  };

  const addEducation = () => {
    if (!resume) return;
    const newEdu: Education = {
      institution: "",
      degree: "",
      field: "",
      endDate: "",
    };
    setResume({ ...resume, education: [...resume.education, newEdu] });
    setHasChanges(true);
  };

  const removeEducation = (index: number) => {
    if (!resume) return;
    const newEducation = [...resume.education];
    newEducation.splice(index, 1);
    setResume({ ...resume, education: newEducation });
    setHasChanges(true);
  };

  const updateSkills = (category: string, value: string) => {
    if (!resume) return;
    const skills = value.split(",").map(s => s.trim()).filter(Boolean);
    setResume({
      ...resume,
      skills: { ...resume.skills, [category]: skills },
    });
    setHasChanges(true);
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    if (!resume?.projects) return;
    const newProjects = [...resume.projects];
    newProjects[index] = { ...newProjects[index], ...updates };
    setResume({ ...resume, projects: newProjects });
    setHasChanges(true);
  };

  const addProject = () => {
    if (!resume) return;
    const newProj: Project = {
      name: "",
      description: "",
      technologies: [],
    };
    setResume({ ...resume, projects: [...(resume.projects || []), newProj] });
    setHasChanges(true);
  };

  const removeProject = (index: number) => {
    if (!resume?.projects) return;
    const newProjects = [...resume.projects];
    newProjects.splice(index, 1);
    setResume({ ...resume, projects: newProjects });
    setHasChanges(true);
  };

  // Subsection ordering helpers
  const moveExperience = useCallback((index: number, direction: 'up' | 'down') => {
    if (!resume) return;
    const items = [...resume.experience];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    // Swap items
    [items[index], items[newIdx]] = [items[newIdx], items[index]];
    setResume({ ...resume, experience: items });
    setHasChanges(true);
  }, [resume]);

  const moveLeadership = useCallback((index: number, direction: 'up' | 'down') => {
    if (!resume) return;
    const current = resume.leadership || [];
    const newOrder = [...current];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setResume({ ...resume, leadership: newOrder });
    setHasChanges(true);
  }, [resume]);

  const moveEducation = useCallback((index: number, direction: 'up' | 'down') => {
    if (!resume) return;
    const items = [...resume.education];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    // Swap items
    [items[index], items[newIdx]] = [items[newIdx], items[index]];
    setResume({ ...resume, education: items });
    setHasChanges(true);
  }, [resume]);

  const moveProject = useCallback((index: number, direction: 'up' | 'down') => {
    if (!resume?.projects) return;
    const items = [...resume.projects];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    
    // Swap items
    [items[index], items[newIdx]] = [items[newIdx], items[index]];
    setResume({ ...resume, projects: items });
    setHasChanges(true);
  }, [resume]);

  // Font size/family update helpers
  const updateSectionFontSize = (key: string, value: number) => {
    setDesignOptions(prev => ({
      ...prev,
      sectionFontSizes: { ...prev.sectionFontSizes, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateSectionFontFamily = (key: string, value: FontFamily) => {
    setDesignOptions(prev => ({
      ...prev,
      sectionFontFamilies: { ...prev.sectionFontFamilies, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateSkillCategoryName = (category: string, name: string) => {
    setDesignOptions(prev => ({
      ...prev,
      skillCategoryNames: { ...prev.skillCategoryNames, [category]: name }
    }));
    setHasChanges(true);
  };

  const updateSkillCategoryFontStyle = (category: string, updates: { size?: number; family?: FontFamily }) => {
    setDesignOptions(prev => ({
      ...prev,
      skillCategoryFontStyles: { 
        ...prev.skillCategoryFontStyles, 
        [category]: { ...prev.skillCategoryFontStyles?.[category], ...updates }
      }
    }));
    setHasChanges(true);
  };

  const updateEducationFontStyle = (index: number, updates: { size?: number; family?: FontFamily }) => {
    setDesignOptions(prev => ({
      ...prev,
      educationFontStyles: {
        ...prev.educationFontStyles,
        [index]: { ...prev.educationFontStyles?.[index], ...updates }
      }
    }));
    setHasChanges(true);
  };

  // Get font size/family with defaults
  const getFontSize = (key: string, defaultOffset: number = 0) => {
    return (designOptions.sectionFontSizes as Record<string, number | undefined>)?.[key] || (designOptions.fontSize + defaultOffset);
  };

  const getFontFamily = (key: string) => {
    return (designOptions.sectionFontFamilies as Record<string, FontFamily | undefined>)?.[key] || designOptions.fontFamily;
  };

  const getSkillCategoryName = (category: string) => {
    const defaults: Record<string, string> = {
      technical: "Technical Skills",
      frontend: "Frontend",
      backend: "Backend",
      databases: "Databases",
      infrastructure: "Infrastructure & DevOps",
      security: "Security & Web Standards",
      concepts: "Concepts",
      frameworks: "Frameworks",
      tools: "Tools",
      languages: "Languages",
      soft: "Soft Skills",
      other: "Additional Skills"
    };
    return designOptions.skillCategoryNames?.[category as keyof typeof designOptions.skillCategoryNames] || defaults[category] || category;
  };

  // Custom section management
  const addCustomSection = () => {
    if (!resume) return;
    const newId = `section-${Date.now()}`;
    const newSection = {
      id: newId,
      title: "New Section",
      type: "bullets" as const,
      content: "",
      bullets: [""],
    };
    const newSections = [...(resume.customSections || []), newSection];
    setResume({ ...resume, customSections: newSections });
    
    // Add to section order
    setDesignOptions(prev => ({
      ...prev,
      sectionOrder: [...(prev.sectionOrder || []), `custom-${newId}`]
    }));
    setHasChanges(true);
  };

  const updateCustomSection = (id: string, updates: Partial<{ title: string; type: "text" | "bullets"; content: string; bullets: string[] }>) => {
    if (!resume?.customSections) return;
    const newSections = resume.customSections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setResume({ ...resume, customSections: newSections });
    setHasChanges(true);
  };

  const removeCustomSection = (id: string) => {
    if (!resume?.customSections) return;
    const newSections = resume.customSections.filter(s => s.id !== id);
    setResume({ ...resume, customSections: newSections });
    
    // Remove from section order
    setDesignOptions(prev => ({
      ...prev,
      sectionOrder: (prev.sectionOrder || []).filter(s => s !== `custom-${id}`)
    }));
    setHasChanges(true);
  };

  const addCustomBullet = (sectionId: string) => {
    if (!resume?.customSections) return;
    const newSections = resume.customSections.map(s => {
      if (s.id === sectionId) {
        return { ...s, bullets: [...(s.bullets || []), ""] };
      }
      return s;
    });
    setResume({ ...resume, customSections: newSections });
    setHasChanges(true);
  };

  const updateCustomBullet = (sectionId: string, bulletIndex: number, value: string) => {
    if (!resume?.customSections) return;
    const newSections = resume.customSections.map(s => {
      if (s.id === sectionId) {
        const newBullets = [...(s.bullets || [])];
        newBullets[bulletIndex] = value;
        return { ...s, bullets: newBullets };
      }
      return s;
    });
    setResume({ ...resume, customSections: newSections });
    setHasChanges(true);
  };

  const removeCustomBullet = (sectionId: string, bulletIndex: number) => {
    if (!resume?.customSections) return;
    const newSections = resume.customSections.map(s => {
      if (s.id === sectionId) {
        const newBullets = [...(s.bullets || [])];
        newBullets.splice(bulletIndex, 1);
        return { ...s, bullets: newBullets };
      }
      return s;
    });
    setResume({ ...resume, customSections: newSections });
    setHasChanges(true);
  };

  // Render sections based on order
  const renderSection = (sectionKey: string, index: number) => {
    if (!resume) return null;
    const Icon = SECTION_ICONS[sectionKey as SectionKey] || FileText;
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    switch (sectionKey) {
      case "summary":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Summary" 
            icon={Icon}
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Font controls for summary */}
            <div className="mb-3 space-y-2 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FontControl 
                  label="Heading"
                  size={getFontSize('summaryTitle', 4)}
                  onSizeChange={(v) => updateSectionFontSize('summaryTitle', v)}
                  family={getFontFamily('summaryTitle')}
                  onFamilyChange={(v) => updateSectionFontFamily('summaryTitle', v)}
                />
                <FontControl 
                  label="Text"
                  size={getFontSize('summaryText', -2)}
                  onSizeChange={(v) => updateSectionFontSize('summaryText', v)}
                  family={getFontFamily('summaryText')}
                  onFamilyChange={(v) => updateSectionFontFamily('summaryText', v)}
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Textarea
                ref={(el) => { textareaRefs.current["summary"] = el; }}
                value={resume.summary}
                onChange={(e) => updateResume({ summary: e.target.value })}
                rows={4}
                className="flex-1"
                placeholder="Write a compelling professional summary (max 4 sentences)..."
              />
              <BoldToggleButton
                textareaRef={{ get current() { return textareaRefs.current["summary"] ?? null; } }}
                value={resume.summary}
                onChange={(v) => updateResume({ summary: v })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Keep it brief: 2-4 sentences maximum</p>
          </CollapsibleSection>
        );

      case "skills":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Technical Skills" 
            icon={Icon}
            defaultOpen={false}
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Section heading font control */}
            <div className="mb-3 space-y-2 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FontControl 
                  label="Section"
                  size={getFontSize('skillsTitle', 4)}
                  onSizeChange={(v) => updateSectionFontSize('skillsTitle', v)}
                  family={getFontFamily('skillsTitle')}
                  onFamilyChange={(v) => updateSectionFontFamily('skillsTitle', v)}
                />
                <FontControl 
                  label="Text"
                  size={getFontSize('skillsText', -2)}
                  onSizeChange={(v) => updateSectionFontSize('skillsText', v)}
                  family={getFontFamily('skillsText')}
                  onFamilyChange={(v) => updateSectionFontFamily('skillsText', v)}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">Comma-separated lists that map to the Classic ATS layout.</p>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Frontend</Label>
                <Input
                  value={(resume.skills?.frontend || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, frontend: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="TypeScript, JavaScript (ES6+), React, Next.js, Angular, HTML5, CSS3, Tailwind CSS"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Backend</Label>
                <Input
                  value={(resume.skills?.backend || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, backend: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="Node.js, Python, FastAPI, RESTful API development"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Databases</Label>
                <Input
                  value={(resume.skills?.databases || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, databases: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="PostgreSQL, Firebase Firestore"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Infrastructure & DevOps</Label>
                <Input
                  value={(resume.skills?.infrastructure || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, infrastructure: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="Docker, GitHub Actions (CI/CD), Git"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Security & Web Standards</Label>
                <Input
                  value={(resume.skills?.security || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, security: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="RBAC, secure headers (CSP, HSTS), Google reCAPTCHA"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Concepts</Label>
                <Input
                  value={(resume.skills?.concepts || []).join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setResume(prev => prev ? { ...prev, skills: { ...prev.skills, concepts: values } } : prev);
                    setHasChanges(true);
                  }}
                  placeholder="Authentication flows, real-time systems, performance profiling"
                />
              </div>
            </div>
          </CollapsibleSection>
        );

      case "projects":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Projects" 
            icon={Icon}
            defaultOpen={false}
            action={
              <Button variant="outline" size="sm" onClick={addProject}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            }
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Section heading font control */}
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                <FontControl 
                  label="Section"
                  size={getFontSize('projectSectionTitle', 4)}
                  onSizeChange={(v) => updateSectionFontSize('projectSectionTitle', v)}
                  family={getFontFamily('projectSectionTitle')}
                  onFamilyChange={(v) => updateSectionFontFamily('projectSectionTitle', v)}
                />
                <FontControl 
                  label="Name"
                  size={getFontSize('projectTitle', 0)}
                  onSizeChange={(v) => updateSectionFontSize('projectTitle', v)}
                  family={getFontFamily('projectTitle')}
                  onFamilyChange={(v) => updateSectionFontFamily('projectTitle', v)}
                />
                <FontControl 
                  label="Desc"
                  size={getFontSize('projectDescription', -2)}
                  onSizeChange={(v) => updateSectionFontSize('projectDescription', v)}
                  family={getFontFamily('projectDescription')}
                  onFamilyChange={(v) => updateSectionFontFamily('projectDescription', v)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {resume.projects?.map((proj, projIndex) => (
                <div key={projIndex} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Up/Down reorder controls */}
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveProject(projIndex, 'up')}
                          disabled={projIndex === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProject(projIndex, 'down')}
                          disabled={projIndex === (resume.projects?.length || 1) - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Project {projIndex + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(projIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Project Name</Label>
                      <Input
                        value={proj.name}
                        onChange={(e) => updateProject(projIndex, { name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    {/* Live Link */}
                    <div className="rounded-md border border-gray-200 p-3 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Live
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Display Text</Label>
                          <Input
                            value={proj.liveText || ""}
                            onChange={(e) => updateProject(projIndex, { liveText: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="Live Demo"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <Input
                            value={proj.liveUrl || ""}
                            onChange={(e) => updateProject(projIndex, { liveUrl: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                    {/* GitHub Link */}
                    <div className="rounded-md border border-gray-200 p-3 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        GitHub
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Display Text</Label>
                          <Input
                            value={proj.githubText || ""}
                            onChange={(e) => updateProject(projIndex, { githubText: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="View Code"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <Input
                            value={proj.githubUrl || ""}
                            onChange={(e) => updateProject(projIndex, { githubUrl: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Other Link */}
                    <div className="rounded-md border border-gray-200 p-3 space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Other
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Display Text</Label>
                          <Input
                            value={proj.otherText || ""}
                            onChange={(e) => updateProject(projIndex, { otherText: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="Documentation"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <Input
                            value={proj.otherUrl || ""}
                            onChange={(e) => updateProject(projIndex, { otherUrl: e.target.value || undefined })}
                            className="mt-0.5"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Technologies (comma-separated)</Label>
                      <Input
                        value={projectTechInputs[projIndex] ?? proj.technologies?.join(", ") ?? ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          setProjectTechInputs((prev) => ({ ...prev, [projIndex]: rawValue }));
                          const parsed = rawValue
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updateProject(projIndex, { technologies: parsed });
                        }}
                        onBlur={() => {
                          const rawValue = projectTechInputs[projIndex] ?? proj.technologies?.join(", ") ?? "";
                          const parsed = rawValue
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updateProject(projIndex, { technologies: parsed });
                          setProjectTechInputs((prev) => ({ ...prev, [projIndex]: parsed.join(", ") }));
                        }}
                        className="mt-1"
                        placeholder="React, Node.js, PostgreSQL..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Project Bullets</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProject(projIndex, {
                              highlights: [...(proj.highlights || []), ""],
                            })
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Bullet
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {(proj.highlights && proj.highlights.length > 0
                          ? proj.highlights
                          : proj.description
                          ? [proj.description]
                          : [""]).map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex items-start gap-2">
                            <Textarea
                              ref={(el) => { textareaRefs.current[`proj-${projIndex}-${bulletIndex}`] = el; }}
                              value={bullet}
                              onChange={(e) => {
                                const next = [...(proj.highlights || [])];
                                if (next.length === 0 && proj.description) {
                                  next.push(proj.description);
                                }
                                if (next.length === 0) next.push("");
                                next[bulletIndex] = e.target.value;
                                updateProject(projIndex, { highlights: next });
                              }}
                              className="flex-1 text-sm"
                              rows={2}
                              placeholder="Describe an achievement or feature..."
                            />
                            <BoldToggleButton
                              textareaRef={{ get current() { return textareaRefs.current[`proj-${projIndex}-${bulletIndex}`] ?? null; } }}
                              value={bullet}
                              onChange={(v) => {
                                const next = [...(proj.highlights || [])];
                                if (next.length === 0 && proj.description) {
                                  next.push(proj.description);
                                }
                                if (next.length === 0) next.push("");
                                next[bulletIndex] = v;
                                updateProject(projIndex, { highlights: next });
                              }}
                            />
                            <AiBulletRewriter
                              currentBullet={bullet}
                              jobDescription={jobDescription}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const next = [...(proj.highlights || [])];
                                if (next.length === 0 && proj.description) {
                                  next.push(proj.description);
                                }
                                next.splice(bulletIndex, 1);
                                updateProject(projIndex, { highlights: next });
                              }}
                              className="text-gray-400 hover:text-red-600 mt-1 h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!resume.projects || resume.projects.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No projects yet. Click &quot;Add&quot; to add one.</p>
              )}
            </div>
          </CollapsibleSection>
        );

      case "experience":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Experience" 
            icon={Icon}
            action={
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            }
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Section font controls */}
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FontControl 
                  label="Heading"
                  size={getFontSize('experienceTitle', 4)}
                  onSizeChange={(v) => updateSectionFontSize('experienceTitle', v)}
                  family={getFontFamily('experienceTitle')}
                  onFamilyChange={(v) => updateSectionFontFamily('experienceTitle', v)}
                />
                <FontControl 
                  label="Company"
                  size={getFontSize('experienceCompany', 2)}
                  onSizeChange={(v) => updateSectionFontSize('experienceCompany', v)}
                  family={getFontFamily('experienceCompany')}
                  onFamilyChange={(v) => updateSectionFontFamily('experienceCompany', v)}
                />
                <FontControl 
                  label="Role"
                  size={getFontSize('experienceRole', 0)}
                  onSizeChange={(v) => updateSectionFontSize('experienceRole', v)}
                  family={getFontFamily('experienceRole')}
                  onFamilyChange={(v) => updateSectionFontFamily('experienceRole', v)}
                />
                <FontControl 
                  label="Bullets"
                  size={getFontSize('experienceText', -2)}
                  onSizeChange={(v) => updateSectionFontSize('experienceText', v)}
                  family={getFontFamily('experienceText')}
                  onFamilyChange={(v) => updateSectionFontFamily('experienceText', v)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {resume.experience.map((exp, expIndex) => (
                <div key={expIndex} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Up/Down reorder controls */}
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveExperience(expIndex, 'up')}
                          disabled={expIndex === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExperience(expIndex, 'down')}
                          disabled={expIndex === resume.experience.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Position {expIndex + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(expIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm">Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(expIndex, { company: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Job Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(expIndex, { title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIndex, { startDate: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., Jan 2020"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">End Date</Label>
                      <Input
                        value={exp.endDate || ""}
                        onChange={(e) => updateExperience(expIndex, { endDate: e.target.value || undefined })}
                        className="mt-1"
                        placeholder="e.g., Present"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm">Location</Label>
                      <Input
                        value={exp.location || ""}
                        onChange={(e) => updateExperience(expIndex, { location: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                  </div>
                  
                  {/* Bullet Points */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Bullet Points</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addExperienceHighlight(expIndex)}
                        className="text-blue-600 h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {exp.highlights?.map((highlight, hIndex) => (
                        <div key={hIndex} className="flex items-start gap-2">
                          <span className="mt-2.5 text-gray-400">•</span>
                          <Textarea
                            ref={(el) => { textareaRefs.current[`exp-${expIndex}-${hIndex}`] = el; }}
                            value={highlight}
                            onChange={(e) => updateExperienceHighlight(expIndex, hIndex, e.target.value)}
                            rows={2}
                            className="flex-1 text-sm"
                            placeholder="Describe your achievement..."
                          />
                          <BoldToggleButton
                            textareaRef={{ get current() { return textareaRefs.current[`exp-${expIndex}-${hIndex}`] ?? null; } }}
                            value={highlight}
                            onChange={(v) => updateExperienceHighlight(expIndex, hIndex, v)}
                          />
                          <AiBulletRewriter
                            currentBullet={highlight}
                            jobDescription={jobDescription}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperienceHighlight(expIndex, hIndex)}
                            className="text-gray-400 hover:text-red-600 mt-1 h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        );

      case "education":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Education" 
            icon={Icon}
            action={
              <Button variant="outline" size="sm" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            }
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Section heading font control */}
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Section Heading</div>
              <FontControl 
                label="Title"
                size={getFontSize('educationTitle', 4)}
                onSizeChange={(v) => updateSectionFontSize('educationTitle', v)}
                family={getFontFamily('educationTitle')}
                onFamilyChange={(v) => updateSectionFontFamily('educationTitle', v)}
              />
            </div>
            
            <div className="space-y-3">
              {resume.education.map((edu, eduIndex) => (
                <div key={eduIndex} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Up/Down reorder controls */}
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveEducation(eduIndex, 'up')}
                          disabled={eduIndex === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEducation(eduIndex, 'down')}
                          disabled={eduIndex === resume.education.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Education {eduIndex + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Per-education font controls */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Size:</span>
                        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
                          onClick={() => {
                            const current = designOptions.educationFontStyles?.[eduIndex]?.size || (designOptions.fontSize - 2);
                            updateEducationFontStyle(eduIndex, { size: Math.max(8, current - 1) });
                          }}
                        ><Minus className="h-2 w-2" /></Button>
                        <span className="text-xs w-5 text-center">
                          {designOptions.educationFontStyles?.[eduIndex]?.size || (designOptions.fontSize - 2)}
                        </span>
                        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
                          onClick={() => {
                            const current = designOptions.educationFontStyles?.[eduIndex]?.size || (designOptions.fontSize - 2);
                            updateEducationFontStyle(eduIndex, { size: Math.min(20, current + 1) });
                          }}
                        ><Plus className="h-2 w-2" /></Button>
                        <FontFamilySelect 
                          value={designOptions.educationFontStyles?.[eduIndex]?.family || designOptions.fontFamily}
                          onChange={(v) => updateEducationFontStyle(eduIndex, { family: v })}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(eduIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(eduIndex, { institution: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(eduIndex, { degree: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Field of Study</Label>
                      <Input
                        value={edu.field || ""}
                        onChange={(e) => updateEducation(eduIndex, { field: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Graduation Date</Label>
                      <Input
                        value={edu.endDate || ""}
                        onChange={(e) => updateEducation(eduIndex, { endDate: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., May 2020"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        );

      case "coursework":
        return (
          <CollapsibleSection
            key={sectionKey}
            title="Relevant Coursework"
            icon={Icon}
            defaultOpen={false}
            onMoveUp={() => moveSection(sectionKey, "up")}
            onMoveDown={() => moveSection(sectionKey, "down")}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <p className="text-sm text-gray-500 mb-3">One course per line. These will render in columns.</p>
            <Textarea
              value={(resume.coursework || []).join("\n")}
              onChange={(e) => {
                const items = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                setResume(prev => prev ? { ...prev, coursework: items } : prev);
                setHasChanges(true);
              }}
              rows={6}
              placeholder="Data Structures&#10;Algorithms Analysis&#10;Database Management"
            />
          </CollapsibleSection>
        );

      case "leadership":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Leadership / Extracurricular" 
            icon={Icon}
            defaultOpen={false}
            action={
              <Button variant="outline" size="sm" onClick={addLeadership}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            }
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <div className="space-y-3">
              {(resume.leadership || []).map((exp, expIndex) => (
                <div key={expIndex} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveLeadership(expIndex, 'up')}
                          disabled={expIndex === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLeadership(expIndex, 'down')}
                          disabled={expIndex === (resume.leadership || []).length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Leadership {expIndex + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLeadership(expIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm">Organization</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateLeadership(expIndex, { company: e.target.value })}
                        placeholder="Fraternity / Club / Organization"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Role</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateLeadership(expIndex, { title: e.target.value })}
                        placeholder="President, Captain, Volunteer"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateLeadership(expIndex, { startDate: e.target.value })}
                        placeholder="Spring 2020"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">End Date</Label>
                      <Input
                        value={exp.endDate || ""}
                        onChange={(e) => updateLeadership(expIndex, { endDate: e.target.value || undefined })}
                        placeholder="Present"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm">Location (optional)</Label>
                      <Input
                        value={exp.location || ""}
                        onChange={(e) => updateLeadership(expIndex, { location: e.target.value })}
                        placeholder="University Name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Highlights</Label>
                      <Button variant="outline" size="sm" onClick={() => addLeadershipHighlight(expIndex)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Bullet
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(exp.highlights || []).map((highlight, hIndex) => (
                        <div key={hIndex} className="flex items-start gap-2">
                          <Textarea
                            ref={(el) => { textareaRefs.current[`lead-${expIndex}-${hIndex}`] = el; }}
                            value={highlight}
                            onChange={(e) => updateLeadershipHighlight(expIndex, hIndex, e.target.value)}
                            rows={2}
                            className="flex-1 text-sm"
                            placeholder="Describe your impact..."
                          />
                          <BoldToggleButton
                            textareaRef={{ get current() { return textareaRefs.current[`lead-${expIndex}-${hIndex}`] ?? null; } }}
                            value={highlight}
                            onChange={(v) => updateLeadershipHighlight(expIndex, hIndex, v)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLeadershipHighlight(expIndex, hIndex)}
                            className="text-gray-400 hover:text-red-600 mt-1 h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        );

      case "certifications":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Certifications" 
            icon={Icon} 
            defaultOpen={false}
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <Textarea
              value={resume.certifications?.map(c => typeof c === 'string' ? c : c.name).join("\n") || ""}
              onChange={(e) => {
                const certs = e.target.value.split("\n").filter(Boolean);
                updateResume({ certifications: certs.map(name => ({ name })) });
              }}
              rows={4}
              placeholder="Enter each certification on a new line..."
            />
            <p className="text-sm text-gray-500 mt-2">Enter each certification on a new line</p>
          </CollapsibleSection>
        );

      default:
        // Handle custom sections
        if (sectionKey.startsWith('custom-')) {
          const customId = sectionKey.replace('custom-', '');
          const customSection = resume.customSections?.find(s => s.id === customId);
          if (!customSection) return null;

          return (
            <CollapsibleSection
              key={sectionKey}
              title={customSection.title}
              icon={FileText}
              action={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeCustomSection(customId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              onMoveUp={() => moveSection(sectionKey as SectionKey, 'up')}
              onMoveDown={() => moveSection(sectionKey as SectionKey, 'down')}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            >
              <div className="space-y-4">
                {/* Section Title */}
                <div>
                  <Label className="text-sm">Section Title</Label>
                  <Input
                    value={customSection.title}
                    onChange={(e) => updateCustomSection(customId, { title: e.target.value })}
                    className="mt-1"
                    placeholder="Enter section title..."
                  />
                </div>
                
                {/* Content Type Toggle */}
                <div>
                  <Label className="text-sm mb-2 block">Content Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={customSection.type === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCustomSection(customId, { type: "text" })}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button
                      variant={customSection.type === "bullets" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCustomSection(customId, { type: "bullets" })}
                      className="flex-1"
                    >
                      <List className="h-4 w-4 mr-1" />
                      Bullets
                    </Button>
                  </div>
                </div>

                {/* Content based on type */}
                {customSection.type === "text" ? (
                  <div>
                    <Label className="text-sm">Content</Label>
                    <div className="flex items-start gap-2 mt-1">
                      <Textarea
                        ref={(el) => { textareaRefs.current[`custom-${customId}-text`] = el; }}
                        value={customSection.content || ""}
                        onChange={(e) => updateCustomSection(customId, { content: e.target.value })}
                        rows={4}
                        className="flex-1"
                        placeholder="Enter your content..."
                      />
                      <BoldToggleButton
                        textareaRef={{ get current() { return textareaRefs.current[`custom-${customId}-text`] ?? null; } }}
                        value={customSection.content || ""}
                        onChange={(v) => updateCustomSection(customId, { content: v })}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Bullet Points</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addCustomBullet(customId)}
                        className="text-blue-600 h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {customSection.bullets?.map((bullet, bIndex) => (
                        <div key={bIndex} className="flex items-start gap-2">
                          <span className="mt-2.5 text-gray-400">•</span>
                          <Textarea
                            ref={(el) => { textareaRefs.current[`custom-${customId}-${bIndex}`] = el; }}
                            value={bullet}
                            onChange={(e) => updateCustomBullet(customId, bIndex, e.target.value)}
                            rows={2}
                            className="flex-1 text-sm"
                            placeholder="Enter bullet point..."
                          />
                          <BoldToggleButton
                            textareaRef={{ get current() { return textareaRefs.current[`custom-${customId}-${bIndex}`] ?? null; } }}
                            value={bullet}
                            onChange={(v) => updateCustomBullet(customId, bIndex, v)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomBullet(customId, bIndex)}
                            className="text-gray-400 hover:text-red-600 mt-1 h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          );
        }
        return null;
    }
  };

  return (
    <RequireAuth>
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      ) : !resume ? (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h1>
            <p className="text-gray-600 mb-6">The resume you&apos;re looking for doesn&apos;t exist or has expired.</p>
            <Link href="/generate">
              <Button>Generate New Resume</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {generationId === "parsed-draft" ? (
              <Link href="/generate">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generate
                </Button>
              </Link>
            ) : (
              <Link href={`/preview/${generationId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Preview
                </Button>
              </Link>
            )}
            <h1 className="text-lg font-semibold text-gray-900">Resume Editor</h1>
            {hasChanges && (
              <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={!hasChanges || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleSaveAndPreview}>
              {generationId === "parsed-draft" ? "Save & Return to Generate" : "Save & Preview"}
            </Button>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">Profile</span>
              <UserCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Split Layout: Editor + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-1/2 border-r bg-gray-50">
          <ScrollArea className="h-[calc(100vh-57px)]">
            <div className="p-4 space-y-4">
              
              {/* Global Design Options */}
              <SimpleCollapsibleSection title="Design Options" icon={Settings2} defaultOpen={true}>
                <div className="space-y-4">
                  {/* Base Font Size */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Base Font Size</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setDesignOptions({ 
                            ...designOptions, 
                            fontSize: Math.max(10, designOptions.fontSize - 1) 
                          })}
                          disabled={designOptions.fontSize <= 10}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{designOptions.fontSize}px</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setDesignOptions({ 
                            ...designOptions, 
                            fontSize: Math.min(18, designOptions.fontSize + 1) 
                          })}
                          disabled={designOptions.fontSize >= 18}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Default Font Family */}
                  <div>
                    <Label className="text-sm mb-2 block">Default Font Family</Label>
                    <select
                      value={designOptions.fontFamily}
                      onChange={(e) => {
                        // Clear section-specific font families so they all use the new default
                        setDesignOptions({ 
                          ...designOptions, 
                          fontFamily: e.target.value as FontFamily,
                          sectionFontFamilies: undefined
                        });
                        setHasChanges(true);
                      }}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      {FONT_FAMILIES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Margin Size */}
                  <div>
                    <Label className="text-sm mb-2 block">Margin Size</Label>
                    <div className="flex gap-2">
                      {MARGIN_SIZES.map((margin) => (
                        <Button
                          key={margin.value}
                          variant={designOptions.marginSize === margin.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setDesignOptions({ ...designOptions, marginSize: margin.value as MarginSize });
                            setHasChanges(true);
                          }}
                          className="flex-1"
                        >
                          {margin.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Heading Color */}
                  <div>
                    <Label className="text-sm mb-2 block">Heading Color</Label>
                    <div className="flex gap-2">
                      {HEADING_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setDesignOptions({ ...designOptions, headingColor: color.value as HeadingColor });
                            setHasChanges(true);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            designOptions.headingColor === color.value 
                              ? "ring-2 ring-offset-2 ring-gray-400 scale-110" 
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {HEADING_COLORS.find(c => c.value === designOptions.headingColor)?.label || 'Black'}
                    </p>
                  </div>
                </div>
              </SimpleCollapsibleSection>
              
              {/* Contact Information - not reorderable */}
              <SimpleCollapsibleSection title="Contact Information" icon={User}>
                <div className="mb-3 space-y-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <FontControl
                      label="Name"
                      size={getFontSize('contactName', 10)}
                      onSizeChange={(v) => updateSectionFontSize('contactName', v)}
                      family={getFontFamily('contactName')}
                      onFamilyChange={(v) => updateSectionFontFamily('contactName', v)}
                    />
                    <FontControl
                      label="Other fields"
                      size={getFontSize('contactInfo', 1)}
                      onSizeChange={(v) => updateSectionFontSize('contactInfo', v)}
                      family={getFontFamily('contactInfo')}
                      onFamilyChange={(v) => updateSectionFontFamily('contactInfo', v)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input
                      id="name"
                      value={resume.contact.name}
                      onChange={(e) => updateContact("name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resume.contact.email || ""}
                      onChange={(e) => updateContact("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input
                      id="phone"
                      value={resume.contact.phone || ""}
                      onChange={(e) => updateContact("phone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <Input
                      id="location"
                      value={resume.contact.location || ""}
                      onChange={(e) => updateContact("location", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visaStatus" className="text-sm">Visa Status</Label>
                    <Input
                      id="visaStatus"
                      value={resume.contact.visaStatus || ""}
                      onChange={(e) => updateContact("visaStatus", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-1.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground">Display Text</Label>
                        <Input
                          value={resume.contact.linkedinText || ""}
                          onChange={(e) => updateContact("linkedinText", e.target.value || "")}
                          className="mt-0.5"
                          placeholder="LinkedIn"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <Input
                          value={resume.contact.linkedin || ""}
                          onChange={(e) => updateContact("linkedin", e.target.value)}
                          className="mt-0.5"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-sm font-medium flex items-center gap-1.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground">Display Text</Label>
                        <Input
                          value={resume.contact.githubText || ""}
                          onChange={(e) => updateContact("githubText", e.target.value || "")}
                          className="mt-0.5"
                          placeholder="GitHub"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <Input
                          value={resume.contact.github || ""}
                          onChange={(e) => updateContact("github", e.target.value)}
                          className="mt-0.5"
                          placeholder="github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="portfolio" className="text-sm font-medium flex items-center gap-1.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      Portfolio
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground">Display Text</Label>
                        <Input
                          value={resume.contact.portfolioText || ""}
                          onChange={(e) => updateContact("portfolioText", e.target.value || "")}
                          className="mt-0.5"
                          placeholder="Portfolio"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <Input
                          value={resume.contact.portfolio || ""}
                          onChange={(e) => updateContact("portfolio", e.target.value)}
                          className="mt-0.5"
                          placeholder="myportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleCollapsibleSection>

              {/* Reorderable Sections */}
              {sectionOrder.map((sectionKey, index) => 
                renderSection(sectionKey, index)
              )}

              {/* Add Custom Section Button */}
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 py-6 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                onClick={addCustomSection}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Custom Section
              </Button>

              {/* Bottom padding */}
              <div className="h-4" />
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Live Preview */}
        <div className="w-1/2 bg-gray-200">
          <div className="sticky top-0 bg-gray-200 p-3 border-b flex items-center justify-between z-10">
            <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
            <span className="text-xs text-gray-500">Changes update instantly</span>
          </div>
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="p-4 flex justify-center">
              <PagedResumePreview scale={0.75} showPageNumbers={true}>
                <ResumeTemplate
                  resume={resume}
                  template={selectedTemplate}
                  designOptions={designOptions}
                />
              </PagedResumePreview>
            </div>
          </ScrollArea>
        </div>
      </div>
        </div>
      )}
    </RequireAuth>
  );
}
