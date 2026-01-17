"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeTemplate, AccentColor } from "@/components/resume-templates";
import { PagedResumePreview } from "@/components/PagedResumePreview";
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
  FileText,
  List
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
  max = 24
}: { 
  label: string; 
  size: number; 
  onSizeChange: (val: number) => void;
  family: FontFamily;
  onFamilyChange: (val: FontFamily) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded border">
      <Type className="h-3 w-3 text-gray-400" />
      <span className="text-xs text-gray-600 min-w-16">{label}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
          onClick={() => onSizeChange(Math.max(min, size - 1))}
          disabled={size <= min}
        ><Minus className="h-2 w-2" /></Button>
        <span className="text-xs w-5 text-center">{size}</span>
        <Button variant="outline" size="sm" className="h-5 w-5 p-0"
          onClick={() => onSizeChange(Math.min(max, size + 1))}
          disabled={size >= max}
        ><Plus className="h-2 w-2" /></Button>
      </div>
      <FontFamilySelect value={family} onChange={onFamilyChange} />
    </div>
  );
}

// Section types for ordering
type SectionKey = "summary" | "skills" | "projects" | "experience" | "education" | "certifications";

const SECTION_ICONS: Record<SectionKey, React.ElementType> = {
  summary: Briefcase,
  skills: Wrench,
  projects: FolderOpen,
  experience: Briefcase,
  education: GraduationCap,
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
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
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
        </button>
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
  const [selectedAccentColor, setSelectedAccentColor] = useState<AccentColor>("purple");
  const [designOptions, setDesignOptions] = useState<DesignOptions>(DEFAULT_DESIGN_OPTIONS);

  useEffect(() => {
    const storedResume = sessionStorage.getItem(`resume-${generationId}`);
    const storedTemplate = sessionStorage.getItem(`template-${generationId}`);
    const storedAccent = sessionStorage.getItem(`accent-${generationId}`);
    const storedDesignOptions = sessionStorage.getItem(`designOptions-${generationId}`);
    
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
    if (storedAccent) {
      setSelectedAccentColor(storedAccent as AccentColor);
    }
    if (storedDesignOptions) {
      try {
        setDesignOptions(JSON.parse(storedDesignOptions));
      } catch {
        console.error("Failed to parse design options");
      }
    }
    setIsLoading(false);
  }, [generationId]);

  // Get section order with defaults
  const sectionOrder = designOptions.sectionOrder || DEFAULT_DESIGN_OPTIONS.sectionOrder || ["summary", "skills", "projects", "experience", "education", "certifications"];

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
    router.push(`/preview/${generationId}`);
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
    const Icon = SECTION_ICONS[sectionKey as SectionKey] || FileText;
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    switch (sectionKey) {
      case "summary":
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Professional Summary" 
            icon={Icon}
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Font controls for summary */}
            <div className="mb-3 space-y-2 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-2 gap-2">
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
            <Textarea
              value={resume.summary}
              onChange={(e) => updateResume({ summary: e.target.value })}
              rows={4}
              placeholder="Write a compelling professional summary (max 4 sentences)..."
            />
            <p className="text-xs text-gray-500 mt-1">Keep it brief: 2-4 sentences maximum</p>
          </CollapsibleSection>
        );

      case "skills":
        const skillCategories = ['technical', 'frameworks', 'tools', 'languages', 'soft', 'other'] as const;
        
        return (
          <CollapsibleSection 
            key={sectionKey}
            title="Skills" 
            icon={Icon}
            defaultOpen={false}
            onMoveUp={() => moveSection(sectionKey, 'up')}
            onMoveDown={() => moveSection(sectionKey, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            {/* Section heading font control */}
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700 mb-1">Typography</div>
              <div className="grid grid-cols-2 gap-2">
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
            
            <p className="text-sm text-gray-500 mb-3">Enter your technical skills separated by commas. Soft skills are woven into your experience bullets.</p>
            <Textarea
              value={[
                ...(resume.skills?.technical || []),
                ...(resume.skills?.frameworks || []),
                ...(resume.skills?.tools || []),
                ...(resume.skills?.languages || []),
                ...(resume.skills?.other || []),
              ].join(", ")}
              onChange={(e) => {
                const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                setResume(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    skills: {
                      ...prev.skills,
                      technical: skills,
                      frameworks: [],
                      tools: [],
                      languages: [],
                      soft: [],
                      other: [],
                    }
                  };
                });
                setHasChanges(true);
              }}
              placeholder="React, TypeScript, Node.js, Python, AWS, Docker..."
              className="min-h-[80px]"
            />
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
              <div className="grid grid-cols-3 gap-2">
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
                    <div>
                      <Label className="text-sm">Technologies (comma-separated)</Label>
                      <Input
                        value={proj.technologies?.join(", ") || ""}
                        onChange={(e) => updateProject(projIndex, { 
                          technologies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                        })}
                        className="mt-1"
                        placeholder="React, Node.js, PostgreSQL..."
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Description</Label>
                      <Textarea
                        value={proj.description || ""}
                        onChange={(e) => updateProject(projIndex, { description: e.target.value })}
                        className="mt-1"
                        rows={2}
                        placeholder="Brief description (will appear after technologies)"
                      />
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
              <div className="grid grid-cols-2 gap-2">
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
                            value={highlight}
                            onChange={(e) => updateExperienceHighlight(expIndex, hIndex, e.target.value)}
                            rows={2}
                            className="flex-1 text-sm"
                            placeholder="Describe your achievement..."
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
                    <Textarea
                      value={customSection.content || ""}
                      onChange={(e) => updateCustomSection(customId, { content: e.target.value })}
                      rows={4}
                      className="mt-1"
                      placeholder="Enter your content..."
                    />
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
                            value={bullet}
                            onChange={(e) => updateCustomBullet(customId, bIndex, e.target.value)}
                            rows={2}
                            className="flex-1 text-sm"
                            placeholder="Enter bullet point..."
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
            <Link href={`/preview/${generationId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Preview
              </Button>
            </Link>
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
              Save & Preview
            </Button>
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
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={resume.contact.linkedin || ""}
                      onChange={(e) => updateContact("linkedin", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-sm">GitHub URL</Label>
                    <Input
                      id="github"
                      value={resume.contact.github || ""}
                      onChange={(e) => updateContact("github", e.target.value)}
                      className="mt-1"
                    />
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
                  accentColor={selectedAccentColor}
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
