"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResumeTemplate, ACCENT_COLORS, AccentColor } from "@/components/resume-templates";
import { PagedResumePreview } from "@/components/PagedResumePreview";
import MatchInsights from "@/components/generator/MatchInsights";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { 
  TailoredResume, 
  ParsedResume, 
  TemplateSlug, 
  TEMPLATES,
  DesignOptions,
  DEFAULT_DESIGN_OPTIONS,
  FONT_FAMILIES
} from "@/types/resume";
import { ArrowLeft, Download, FileText, ChevronDown, ArrowRight, Eye, RotateCcw, Loader2, Pencil, FileSignature, UserCircle } from "lucide-react";
import { buildCoverLetterFields, CoverLetterFields, CoverLetterStyles, generateCoverLetterHTML } from "@/lib/cover-letter";

export default function PreviewPage() {
  const params = useParams();
  const generationId = params.generationId as string;
  
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [originalResume, setOriginalResume] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSlug>("classic-ats");
  const [selectedAccentColor, setSelectedAccentColor] = useState<AccentColor>("purple");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"tailored" | "compare" | "insights" | "cover-letter">("compare");
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [designOptions, setDesignOptions] = useState<DesignOptions>(DEFAULT_DESIGN_OPTIONS);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isCoverLetterGenerating, setIsCoverLetterGenerating] = useState(false);
  const [isCoverLetterExporting, setIsCoverLetterExporting] = useState(false);
  const [coverLetterFields, setCoverLetterFields] = useState<CoverLetterFields | null>(null);
  const [coverLetterStyles, setCoverLetterStyles] = useState<CoverLetterStyles>({
    name: { fontFamily: FONT_FAMILIES[1].css, fontSize: 18 },
    contactLine: { fontFamily: FONT_FAMILIES[1].css, fontSize: 11 },
    dateLine: { fontFamily: FONT_FAMILIES[1].css, fontSize: 11 },
    salutation: { fontFamily: FONT_FAMILIES[1].css, fontSize: 12 },
    body: { fontFamily: FONT_FAMILIES[1].css, fontSize: 12 },
  });

  useEffect(() => {
    // Get the resumes from sessionStorage (set during generation)
    const storedResume = sessionStorage.getItem(`resume-${generationId}`);
    const storedOriginal = sessionStorage.getItem(`original-${generationId}`);
    const storedTemplate = sessionStorage.getItem(`template-${generationId}`);
    const storedAccent = sessionStorage.getItem(`accent-${generationId}`);
    const storedAdded = sessionStorage.getItem(`added-${generationId}`);
    const storedDesignOptions = sessionStorage.getItem(`designOptions-${generationId}`);
    
    if (storedResume) {
      try {
        setTailoredResume(JSON.parse(storedResume));
        if (storedOriginal) {
          setOriginalResume(JSON.parse(storedOriginal));
        }
        if (storedTemplate) {
          setSelectedTemplate(storedTemplate as TemplateSlug);
        }
        if (storedAccent) {
          setSelectedAccentColor(storedAccent as AccentColor);
        }
        if (storedAdded) {
          setAddedKeywords(JSON.parse(storedAdded));
        }
        if (storedDesignOptions) {
          setDesignOptions(JSON.parse(storedDesignOptions));
        }
        const storedCoverLetter = sessionStorage.getItem(`coverLetter-${generationId}`);
        if (storedCoverLetter) {
          setCoverLetter(storedCoverLetter);
        }
        const storedCoverFields = sessionStorage.getItem(`coverLetterFields-${generationId}`);
        if (storedCoverFields) {
          setCoverLetterFields(JSON.parse(storedCoverFields));
        }
        const storedCoverStyles = sessionStorage.getItem(`coverLetterStyles-${generationId}`);
        if (storedCoverStyles) {
          setCoverLetterStyles(JSON.parse(storedCoverStyles));
        }
      } catch {
        setError("Failed to load resume data");
      }
    } else {
      setError("Resume not found. Please generate a new resume.");
    }
    setIsLoading(false);
  }, [generationId]);

  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateCoverLetter = async () => {
    if (!tailoredResume) {
      setError("Resume content not found. Please refresh and try again.");
      return;
    }
    const storedJobDescription = sessionStorage.getItem(`jobDescription-${generationId}`);
    if (!storedJobDescription) {
      setError("Job description not found. Please generate a new resume.");
      return;
    }

    setIsCoverLetterGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredResume,
          jobDescription: storedJobDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      sessionStorage.setItem(`coverLetter-${generationId}`, data.coverLetter);
      if (tailoredResume) {
        const fields = buildCoverLetterFields({
          resume: tailoredResume,
          coverLetter: data.coverLetter,
        });
        setCoverLetterFields(fields);
        sessionStorage.setItem(`coverLetterFields-${generationId}`, JSON.stringify(fields));
      }
      sessionStorage.setItem(`coverLetterStyles-${generationId}`, JSON.stringify(coverLetterStyles));
      setActiveTab("cover-letter");
    } catch (err) {
      console.error("Cover letter error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setIsCoverLetterGenerating(false);
    }
  };

  const handleExportCoverLetter = async () => {
    if (!tailoredResume || (!coverLetter && !coverLetterFields)) {
      setError("Cover letter not found. Generate it first.");
      return;
    }

    setIsCoverLetterExporting(true);
    setError(null);

    try {
      const fileName = tailoredResume?.contact?.name
        ? `${tailoredResume.contact.name.replace(/\s+/g, "_")}_Cover_Letter.pdf`
        : "Cover_Letter.pdf";

      const response = await fetch("/api/cover-letter/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: tailoredResume,
          coverLetter,
          coverLetterFields,
          coverLetterStyles,
          fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Cover letter download error:", err);
      setError(err instanceof Error ? err.message : "Failed to download cover letter");
    } finally {
      setIsCoverLetterExporting(false);
    }
  };

  const saveCoverLetterFields = (next: CoverLetterFields) => {
    setCoverLetterFields(next);
    sessionStorage.setItem(`coverLetterFields-${generationId}`, JSON.stringify(next));
  };

  const saveCoverLetterStyles = (next: CoverLetterStyles) => {
    setCoverLetterStyles(next);
    sessionStorage.setItem(`coverLetterStyles-${generationId}`, JSON.stringify(next));
  };

  const handleExportPDF = async () => {
    if (!tailoredResume) {
      alert("Resume content not found. Please refresh and try again.");
      return;
    }
    
    setIsExporting(true);
    
    try {
      const fileName = tailoredResume?.contact?.name 
        ? `${tailoredResume.contact.name.replace(/\s+/g, '_')}_Resume.pdf`
        : "Tailored_Resume.pdf";
      
      // Call the PDF generation API with resume data
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: tailoredResume,
          designOptions,
          template: selectedTemplate,
          accentColor: selectedAccentColor,
          fileName,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to generate PDF');
      }
      
      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`There was an error generating the PDF: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle adding a keyword to the resume skills
  const handleAddKeyword = (keyword: string) => {
    if (!tailoredResume || addedKeywords.includes(keyword)) return;
    
    // Add to added keywords list
    const newAddedKeywords = [...addedKeywords, keyword];
    setAddedKeywords(newAddedKeywords);
    
    // Create the updated resume
    const updated = {
      ...tailoredResume,
      skills: {
        ...tailoredResume.skills,
        other: [...(tailoredResume.skills?.other || []), keyword],
      },
      // Move keyword from missing to matched
      matchedKeywords: [...(tailoredResume.matchedKeywords || []), keyword],
      missingKeywords: (tailoredResume.missingKeywords || []).filter(k => k !== keyword),
    };
    
    // Update state
    setTailoredResume(updated);
    
    // Update sessionStorage with the updated values
    sessionStorage.setItem(`resume-${generationId}`, JSON.stringify(updated));
  };

  // Handle removing a keyword from the resume skills
  const handleRemoveKeyword = (keyword: string) => {
    if (!tailoredResume || !addedKeywords.includes(keyword)) return;
    
    // Remove from added keywords list
    const newAddedKeywords = addedKeywords.filter(k => k !== keyword);
    setAddedKeywords(newAddedKeywords);
    
    // Create the updated resume
    const updated = {
      ...tailoredResume,
      skills: {
        ...tailoredResume.skills,
        other: (tailoredResume.skills?.other || []).filter(k => k !== keyword),
      },
      // Move keyword back from matched to missing
      matchedKeywords: (tailoredResume.matchedKeywords || []).filter(k => k !== keyword),
      missingKeywords: [...(tailoredResume.missingKeywords || []), keyword],
    };
    
    // Update state
    setTailoredResume(updated);
    
    // Update sessionStorage with the updated values
    sessionStorage.setItem(`resume-${generationId}`, JSON.stringify(updated));
  };

  // Handle regenerating the resume with newly added keywords
  const handleRegenerate = async () => {
    if (!originalResume || !tailoredResume || addedKeywords.length === 0) return;
    
    setIsRegenerating(true);
    
    try {
      // Get the current matched keywords (which includes added keywords)
      const allKeywords = tailoredResume.matchedKeywords || [];
      
      // Get job description from sessionStorage (we need to store this during initial generation)
      const storedJobDescription = sessionStorage.getItem(`jobDescription-${generationId}`);
      
      if (!storedJobDescription) {
        alert("Job description not found. Please generate a new resume from scratch.");
        return;
      }
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parsedResume: originalResume,
          jobDescription: storedJobDescription,
          templateSlug: selectedTemplate,
          selectedKeywords: allKeywords,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate resume");
      }

      const data = await response.json();
      
      if (data.tailoredResume) {
        // Override the LLM's keyword lists with user's selections
        const resumeWithUserKeywords = {
          ...data.tailoredResume,
          matchedKeywords: allKeywords,
          missingKeywords: tailoredResume.missingKeywords || [],
        };
        
        setTailoredResume(resumeWithUserKeywords);
        sessionStorage.setItem(`resume-${generationId}`, JSON.stringify(resumeWithUserKeywords));
        
        // Clear added keywords since they're now integrated
        setAddedKeywords([]);
        sessionStorage.setItem(`added-${generationId}`, JSON.stringify([]));
        
        // Switch to compare tab to show the updated resume
        setActiveTab("compare");
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      alert(err instanceof Error ? err.message : "Failed to regenerate resume");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Convert ParsedResume to TailoredResume format for display
  const originalAsTailored: TailoredResume | null = originalResume ? {
    ...originalResume,
    summary: originalResume.summary || "",
    skills: originalResume.skills || {},
  } : null;

  return (
    <RequireAuth>
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[800px] w-full" />
          </div>
        </div>
      ) : error || !tailoredResume ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Resume Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The resume you're looking for doesn't exist."}</p>
            <Link href="/generate">
              <Button>Generate New Resume</Button>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/generate" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Resu<span className="text-blue-600">Tailor</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Template Selector */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-2"
              >
                {TEMPLATES.find(t => t.slug === selectedTemplate)?.name || "Template"}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showTemplateDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.slug}
                      onClick={() => {
                        setSelectedTemplate(template.slug);
                        sessionStorage.setItem(`template-${generationId}`, template.slug);
                        setShowTemplateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedTemplate === template.slug ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Accent Color Picker - Only for Accent template */}
            {selectedTemplate === "tech-focused" && (
              <div className="flex items-center gap-2 border-l pl-3">
                {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedAccentColor(color);
                      sessionStorage.setItem(`accent-${generationId}`, color);
                    }}
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedAccentColor === color 
                        ? "ring-2 ring-offset-1 ring-gray-400 scale-110" 
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: ACCENT_COLORS[color].primary }}
                    title={ACCENT_COLORS[color].name}
                  />
                ))}
              </div>
            )}
            
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Save PDF
                </>
              )}
            </Button>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">Profile</span>
              <UserCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Design edits live in the editor */}

      {/* Tab Navigation */}
      <div className="bg-white border-b print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("tailored")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "tailored"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Tailored Resume
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "compare"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowRight className="h-4 w-4 inline mr-2" />
              Before & After
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "insights"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Match Insights
            </button>
            <button
              onClick={() => setActiveTab("cover-letter")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "cover-letter"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Edit Cover Letter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        {/* Tailored Resume View */}
        {activeTab === "tailored" && (
          <div className="flex flex-col items-center">
            {/* Edit Button */}
            <div className="w-full max-w-[612px] flex justify-end mb-4 print:hidden">
              <Link href={`/editor/${generationId}`}>
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit in Editor
                </Button>
              </Link>
            </div>
            
            <PagedResumePreview scale={1} showPageNumbers={true}>
              <ResumeTemplate
                resume={tailoredResume}
                template={selectedTemplate}
                accentColor={selectedAccentColor}
                designOptions={designOptions}
              />
            </PagedResumePreview>
          </div>
        )}

        {/* Before & After Comparison */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Before & After Comparison</h2>
              <p className="text-gray-600 mt-1">See how your resume was tailored for the job</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Original Resume */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-gray-200">Original</Badge>
                  <span className="text-sm text-gray-600">Your uploaded resume</span>
                </div>
                <div className="max-h-[900px] overflow-y-auto">
                  {originalAsTailored ? (
                    <PagedResumePreview scale={0.75} showPageNumbers={true}>
                      <ResumeTemplate
                        resume={originalAsTailored}
                        template={selectedTemplate}
                        accentColor={selectedAccentColor}
                        designOptions={designOptions}
                      />
                    </PagedResumePreview>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Original resume not available
                    </div>
                  )}
                </div>
              </div>

              {/* Tailored Resume */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Tailored</Badge>
                    <span className="text-sm text-gray-600">Optimized for the job</span>
                    <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800 text-xs">
                      Keywords Highlighted
                    </Badge>
                  </div>
                  <Link href={`/editor/${generationId}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3 w-3 mr-1.5" />
                      Edit in Editor
                    </Button>
                  </Link>
                </div>
                <div className="max-h-[900px] overflow-y-auto ring-2 ring-green-500 rounded-lg">
                  <PagedResumePreview scale={0.75} showPageNumbers={true}>
                    <ResumeTemplate
                      resume={tailoredResume}
                      template={selectedTemplate}
                      accentColor={selectedAccentColor}
                      designOptions={designOptions}
                      highlightKeywords={tailoredResume.matchedKeywords || []}
                    />
                  </PagedResumePreview>
                </div>
              </div>
            </div>

            {/* Keywords Added Section */}
            {tailoredResume.matchedKeywords && tailoredResume.matchedKeywords.length > 0 && (
              <Card className="p-6 bg-green-50 border-green-200">
                <h3 className="font-semibold text-lg mb-3 text-green-800">✨ Keywords Added to Tailored Resume</h3>
                <div className="flex flex-wrap gap-2">
                  {tailoredResume.matchedKeywords.map((keyword, idx) => (
                    <Badge key={idx} className="bg-green-600 text-white">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-green-700 mt-3">
                  These keywords from the job description have been incorporated into your tailored resume.
                </p>
              </Card>
            )}

            {/* Key Changes Summary */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Key Changes Made</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📝 Summary</h4>
                  <p className="text-sm text-gray-600">
                    {originalResume?.summary !== tailoredResume.summary
                      ? "Rewritten to highlight relevant experience and match job keywords"
                      : "No changes made"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💼 Experience</h4>
                  <p className="text-sm text-gray-600">
                    Bullet points reworded to emphasize skills mentioned in the job description
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎯 Skills</h4>
                  <p className="text-sm text-gray-600">
                    Skills reordered to prioritize those matching job requirements
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Match Insights View */}
        {activeTab === "insights" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Keyword Match Analysis</h2>
              <MatchInsights
                matchedKeywords={tailoredResume.matchedKeywords || []}
                missingKeywords={tailoredResume.missingKeywords || []}
                onAddKeyword={handleAddKeyword}
                onRemoveKeyword={handleRemoveKeyword}
                addedKeywords={addedKeywords}
              />
              
              {addedKeywords.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        {addedKeywords.length} keyword{addedKeywords.length > 1 ? 's' : ''} added
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Add more missing keyword to naturally integrate these keywords into your bullet points and summary. 
                        Click regenerate to rewrite your resume with these keywords woven in.
                      </p>
                    </div>
                    <Button 
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-4">What This Means</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong className="text-gray-900">Matched Keywords:</strong> These are skills and terms 
                    from the job description that appear in your tailored resume. ATS systems will recognize these.
                  </p>
                  <p>
                    <strong className="text-gray-900">Missing Keywords:</strong> Click on any missing keyword to add it 
                    to your skills section. Only add skills you genuinely have.
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-6 flex justify-center gap-4">
              <Link href="/generate">
                <Button variant="outline">Generate Another</Button>
              </Link>
              <Button onClick={() => setActiveTab("tailored")}>
                View Tailored Resume
              </Button>
            </div>
          </div>
        )}

        {/* Cover Letter Editor */}
        {activeTab === "cover-letter" && (
          <div className="flex gap-6">
            <div className="w-1/2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Edit Cover Letter</h2>
                    <p className="text-sm text-gray-600">
                      Edit each section and customize font and size.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateCoverLetter}
                      disabled={isCoverLetterGenerating}
                    >
                      {isCoverLetterGenerating ? "Generating..." : "Regenerate"}
                    </Button>
                    <Button
                      onClick={handleExportCoverLetter}
                      disabled={!coverLetterFields || isCoverLetterExporting}
                    >
                      {isCoverLetterExporting ? "Preparing..." : "Download PDF"}
                    </Button>
                  </div>
                </div>

                {!coverLetterFields ? (
                  <div className="text-gray-500">
                    Generate a cover letter to start editing.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Name</Label>
                        <Input
                          value={coverLetterFields.name}
                          onChange={(e) => saveCoverLetterFields({ ...coverLetterFields, name: e.target.value })}
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={coverLetterStyles.name.fontFamily}
                            onChange={(e) =>
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                name: { ...coverLetterStyles.name, fontFamily: e.target.value },
                              })
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.css}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={9}
                            max={24}
                            value={coverLetterStyles.name.fontSize}
                            onChange={(e) => {
                              const size = Number(e.target.value);
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                name: {
                                  ...coverLetterStyles.name,
                                  fontSize: Number.isNaN(size) ? coverLetterStyles.name.fontSize : size,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Contact line</Label>
                        <Input
                          value={coverLetterFields.contactLine}
                          onChange={(e) =>
                            saveCoverLetterFields({ ...coverLetterFields, contactLine: e.target.value })
                          }
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={coverLetterStyles.contactLine.fontFamily}
                            onChange={(e) =>
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                contactLine: { ...coverLetterStyles.contactLine, fontFamily: e.target.value },
                              })
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.css}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={9}
                            max={24}
                            value={coverLetterStyles.contactLine.fontSize}
                            onChange={(e) => {
                              const size = Number(e.target.value);
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                contactLine: {
                                  ...coverLetterStyles.contactLine,
                                  fontSize: Number.isNaN(size)
                                    ? coverLetterStyles.contactLine.fontSize
                                    : size,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Date</Label>
                        <Input
                          value={coverLetterFields.dateLine}
                          onChange={(e) => saveCoverLetterFields({ ...coverLetterFields, dateLine: e.target.value })}
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={coverLetterStyles.dateLine.fontFamily}
                            onChange={(e) =>
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                dateLine: { ...coverLetterStyles.dateLine, fontFamily: e.target.value },
                              })
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.css}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={9}
                            max={24}
                            value={coverLetterStyles.dateLine.fontSize}
                            onChange={(e) => {
                              const size = Number(e.target.value);
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                dateLine: {
                                  ...coverLetterStyles.dateLine,
                                  fontSize: Number.isNaN(size) ? coverLetterStyles.dateLine.fontSize : size,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Salutation</Label>
                        <Input
                          value={coverLetterFields.salutation}
                          onChange={(e) =>
                            saveCoverLetterFields({ ...coverLetterFields, salutation: e.target.value })
                          }
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={coverLetterStyles.salutation.fontFamily}
                            onChange={(e) =>
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                salutation: { ...coverLetterStyles.salutation, fontFamily: e.target.value },
                              })
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font.value} value={font.css}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={9}
                            max={24}
                            value={coverLetterStyles.salutation.fontSize}
                            onChange={(e) => {
                              const size = Number(e.target.value);
                              saveCoverLetterStyles({
                                ...coverLetterStyles,
                                salutation: {
                                  ...coverLetterStyles.salutation,
                                  fontSize: Number.isNaN(size)
                                    ? coverLetterStyles.salutation.fontSize
                                    : size,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Body</Label>
                      <Textarea
                        value={coverLetterFields.body.join("\n\n")}
                        onChange={(e) => {
                          const paragraphs = e.target.value
                            .split(/\n\s*\n/)
                            .map((line) => line.trim())
                            .filter(Boolean);
                          saveCoverLetterFields({ ...coverLetterFields, body: paragraphs });
                        }}
                        rows={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate paragraphs with blank lines.</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <select
                          value={coverLetterStyles.body.fontFamily}
                          onChange={(e) =>
                            saveCoverLetterStyles({
                              ...coverLetterStyles,
                              body: { ...coverLetterStyles.body, fontFamily: e.target.value },
                            })
                          }
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        >
                          {FONT_FAMILIES.map((font) => (
                            <option key={font.value} value={font.css}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min={9}
                          max={24}
                          value={coverLetterStyles.body.fontSize}
                          onChange={(e) => {
                            const size = Number(e.target.value);
                            saveCoverLetterStyles({
                              ...coverLetterStyles,
                              body: {
                                ...coverLetterStyles.body,
                                fontSize: Number.isNaN(size) ? coverLetterStyles.body.fontSize : size,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>

                  </div>
                )}
              </Card>
            </div>
            <div className="w-1/2">
              <div className="sticky top-24">
                <div className="text-sm text-gray-600 mb-2">Live Preview</div>
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                  {tailoredResume && coverLetterFields ? (
                    <iframe
                      title="Cover letter preview"
                      className="w-full h-[900px]"
                      srcDoc={generateCoverLetterHTML({
                        resume: tailoredResume,
                        fields: coverLetterFields,
                        styles: coverLetterStyles,
                        preview: true,
                      })}
                    />
                  ) : (
                    <div className="p-6 text-gray-500">
                      Generate a cover letter to see the preview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
      )}
    </RequireAuth>
  );
}
