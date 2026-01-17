"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FileUpload from "@/components/generator/FileUpload";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ResumeTemplate, ACCENT_COLORS, AccentColor } from "@/components/resume-templates";
import { PagedResumePreview } from "@/components/PagedResumePreview";
import { 
  TemplateSlug, 
  TailoredResume, 
  ParsedResume, 
  ExtractedJobDescription,
  DesignOptions,
  DEFAULT_DESIGN_OPTIONS,
  FONT_FAMILIES,
  MARGIN_SIZES,
  HeaderAlignment,
  FontFamily,
  TEMPLATES
} from "@/types/resume";
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Check, Plus, RotateCcw, X, AlertTriangle, AlertCircle, UserCircle } from "lucide-react";

type Step = "upload" | "analyze" | "generate";

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsed, setIsParsed] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [needsReview, setNeedsReview] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSlug>("classic-ats");
  const [selectedAccentColor, setSelectedAccentColor] = useState<AccentColor>("purple");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analysis state - categorized keywords
  const [technicalKeywords, setTechnicalKeywords] = useState<{ matched: string[]; missing: string[] }>({ matched: [], missing: [] });
  const [softKeywords, setSoftKeywords] = useState<{ matched: string[]; missing: string[] }>({ matched: [], missing: [] });
  const [selectedMissingKeywords, setSelectedMissingKeywords] = useState<string[]>([]);
  const [selectedOriginalKeywords, setSelectedOriginalKeywords] = useState<string[]>([]);
  const [extractedJd, setExtractedJd] = useState<ExtractedJobDescription | null>(null);

  // Design options state
  const [designOptions, setDesignOptions] = useState<DesignOptions>(DEFAULT_DESIGN_OPTIONS);

  // Handle file upload
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    setError(null);
    setIsParsed(false);
    setParsedResume(null);
    setParseWarnings([]);
    setNeedsReview(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to parse resume");
      }

      const data = await response.json();
      setParsedResume(data.parsedResume);
      setParseWarnings(data.warnings || []);
      setNeedsReview(data.needsReview || false);
      setIsParsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setIsParsed(false);
    setParsedResume(null);
    setParseWarnings([]);
    setNeedsReview(false);
    setError(null);
    setStep("upload");
    setTechnicalKeywords({ matched: [], missing: [] });
    setSoftKeywords({ matched: [], missing: [] });
    setSelectedMissingKeywords([]);
    setSelectedOriginalKeywords([]);
  };

  // Handle analyze - first step after upload
  const handleAnalyze = async () => {
    if (!parsedResume || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parsedResume,
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze resume");
      }

      const data = await response.json();
      setTechnicalKeywords(data.technicalKeywords || { matched: [], missing: [] });
      setSoftKeywords(data.softKeywords || { matched: [], missing: [] });
      setExtractedJd(data.extractedJobDescription);
      setStep("analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle a missing keyword selection - moves it to matched
  const toggleMissingKeyword = (keyword: string, category: 'technical' | 'soft') => {
    if (category === 'technical') {
      setTechnicalKeywords(prev => ({
        matched: [...prev.matched, keyword],
        missing: prev.missing.filter(k => k !== keyword),
      }));
    } else {
      setSoftKeywords(prev => ({
        matched: [...prev.matched, keyword],
        missing: prev.missing.filter(k => k !== keyword),
      }));
    }
    setSelectedMissingKeywords(prev => [...prev, keyword]);
  };

  // Remove a keyword from matched back to missing (only for user-added ones)
  const removeFromMatched = (keyword: string, category: 'technical' | 'soft') => {
    if (!selectedMissingKeywords.includes(keyword)) return;
    
    if (category === 'technical') {
      setTechnicalKeywords(prev => ({
        matched: prev.matched.filter(k => k !== keyword),
        missing: [...prev.missing, keyword],
      }));
    } else {
      setSoftKeywords(prev => ({
        matched: prev.matched.filter(k => k !== keyword),
        missing: [...prev.missing, keyword],
      }));
    }
    setSelectedMissingKeywords(prev => prev.filter(k => k !== keyword));
  };

  // Select all missing keywords for a category
  const selectAllMissing = (category: 'technical' | 'soft') => {
    if (category === 'technical') {
      const missing = technicalKeywords.missing;
      setTechnicalKeywords(prev => ({
        matched: [...prev.matched, ...missing],
        missing: [],
      }));
      setSelectedMissingKeywords(prev => [...prev, ...missing]);
    } else {
      const missing = softKeywords.missing;
      setSoftKeywords(prev => ({
        matched: [...prev.matched, ...missing],
        missing: [],
      }));
      setSelectedMissingKeywords(prev => [...prev, ...missing]);
    }
  };

  // Clear all selected missing keywords for a category
  const clearSelectedMissing = (category: 'technical' | 'soft') => {
    if (category === 'technical') {
      const toMove = technicalKeywords.matched.filter(k => selectedMissingKeywords.includes(k));
      setTechnicalKeywords(prev => ({
        matched: prev.matched.filter(k => !selectedMissingKeywords.includes(k)),
        missing: [...prev.missing, ...toMove],
      }));
      setSelectedMissingKeywords(prev => prev.filter(k => !toMove.includes(k)));
    } else {
      const toMove = softKeywords.matched.filter(k => selectedMissingKeywords.includes(k));
      setSoftKeywords(prev => ({
        matched: prev.matched.filter(k => !selectedMissingKeywords.includes(k)),
        missing: [...prev.missing, ...toMove],
      }));
      setSelectedMissingKeywords(prev => prev.filter(k => !toMove.includes(k)));
    }
  };

  const toggleOriginalKeyword = (keyword: string) => {
    setSelectedOriginalKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      }
      return [...prev, keyword];
    });
  };

  // Handle generate - uses selected keywords
  const handleGenerate = async () => {
    if (!parsedResume || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description");
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Combine all matched keywords plus any original keywords the user kept
    const allMatchedKeywords = [
      ...technicalKeywords.matched,
      ...softKeywords.matched,
      ...selectedOriginalKeywords,
    ];
    const allMissingKeywords = [...technicalKeywords.missing, ...softKeywords.missing];

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parsedResume,
          jobDescription: jobDescription.trim(),
          templateSlug: selectedTemplate,
          selectedKeywords: allMatchedKeywords,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate resume");
      }

      const data = await response.json();
      
      // Store in sessionStorage for the preview page
      if (data.generationId && data.tailoredResume) {
        // Override the LLM's keyword lists with the user's actual selections
        // This ensures consistency between analysis step and final result
        const resumeWithUserKeywords = {
          ...data.tailoredResume,
          matchedKeywords: allMatchedKeywords,
          missingKeywords: allMissingKeywords,
        };

        // Persist resume history to Firestore
        if (user) {
          try {
            const pruneUndefined = (value: unknown): unknown => {
              if (Array.isArray(value)) {
                return value.map(pruneUndefined);
              }
              if (value && typeof value === "object") {
                const entries = Object.entries(value as Record<string, unknown>)
                  .filter(([, v]) => v !== undefined)
                  .map(([k, v]) => [k, pruneUndefined(v)]);
                return Object.fromEntries(entries);
              }
              return value;
            };

            const cleanedDesignOptions = pruneUndefined(designOptions) as DesignOptions;

            await addDoc(collection(db, "users", user.uid, "resumeHistory"), {
              generationId: data.generationId,
              createdAt: serverTimestamp(),
              template: selectedTemplate,
              accentColor: selectedAccentColor,
              designOptions: cleanedDesignOptions,
              jobDescription: jobDescription.trim(),
              originalResume: parsedResume,
              tailoredResume: resumeWithUserKeywords,
              matchedKeywords: allMatchedKeywords,
              missingKeywords: allMissingKeywords,
            });
          } catch (storageError) {
            console.error("Failed to save resume history:", storageError);
          }
        }
        
        sessionStorage.setItem(`resume-${data.generationId}`, JSON.stringify(resumeWithUserKeywords));
        sessionStorage.setItem(`original-${data.generationId}`, JSON.stringify(parsedResume));
        sessionStorage.setItem(`template-${data.generationId}`, selectedTemplate);
        sessionStorage.setItem(`accent-${data.generationId}`, selectedAccentColor);
        // Also store which keywords were user-added for the preview page
        sessionStorage.setItem(`added-${data.generationId}`, JSON.stringify(selectedMissingKeywords));
        // Store job description for potential regeneration
        sessionStorage.setItem(`jobDescription-${data.generationId}`, jobDescription.trim());
        router.push(`/preview/${data.generationId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert ParsedResume to display format
  const parsedAsTailored: TailoredResume | null = parsedResume ? {
    ...parsedResume,
    summary: parsedResume.summary || "",
    skills: parsedResume.skills || {},
    matchedKeywords: [],
    missingKeywords: [],
  } : null;

  const canAnalyze = isParsed && jobDescription.trim().length > 50;

  const originalKeywords = useMemo(() => {
    const skills = parsedResume?.skills;
    if (!skills) return [];

    const allSkills = [
      ...(skills.technical || []),
      ...(skills.frameworks || []),
      ...(skills.tools || []),
      ...(skills.languages || []),
    ]
      .map((k) => k.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    return allSkills.filter((keyword) => {
      const key = keyword.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [parsedResume]);

  useEffect(() => {
    if (selectedOriginalKeywords.length === 0) return;
    const originalSet = new Set(originalKeywords);
    setSelectedOriginalKeywords((prev) => prev.filter((k) => originalSet.has(k)));
  }, [originalKeywords, selectedOriginalKeywords.length]);
  
  // Calculate total matched and missing keywords
  const totalMatched = technicalKeywords.matched.length + softKeywords.matched.length;
  const totalMissing = technicalKeywords.missing.length + softKeywords.missing.length;
  const matchRate = totalMatched + totalMissing > 0
    ? Math.round((totalMatched / (totalMatched + totalMissing)) * 100)
    : 0;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Resu<span className="text-blue-600">Tailor</span>
            </Link>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              step === "upload" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            }`}>
              {step !== "upload" ? <Check className="h-4 w-4" /> : <span className="font-medium">1</span>}
              <span>Upload</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              step === "analyze" ? "bg-blue-100 text-blue-700" : step === "generate" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {step === "generate" ? <Check className="h-4 w-4" /> : <span className="font-medium">2</span>}
              <span>Analyze</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              step === "generate" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}>
              <span className="font-medium">3</span>
              <span>Generate</span>
            </div>
          </div>

          {/* Action Button + Profile */}
          <div className="flex items-center gap-3">
            {step === "upload" && (
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Keywords
                  </>
                )}
              </Button>
            )}
            {step === "analyze" && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tailored Resume
                  </>
                )}
              </Button>
            )}
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">Profile</span>
              <UserCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Inputs */}
            <div className="space-y-6">
              {/* Resume Upload */}
              <div className="bg-white rounded-lg border p-6">
                <Label className="text-lg font-semibold mb-4 block">
                  1. Upload Your Resume
                </Label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  isUploading={isUploading}
                  uploadedFile={file}
                  isParsed={isParsed}
                />
                
                {/* Parse warnings message */}
                {isParsed && needsReview && parseWarnings.length > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Resume parsed with some notes</p>
                        <p className="text-sm text-amber-700 mt-1">
                          We extracted what we could from your resume. You may want to review and edit the following in the editor after generating:
                        </p>
                        <ul className="text-sm text-amber-700 mt-2 list-disc list-inside space-y-1">
                          {parseWarnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg border p-6">
                <Label className="text-lg font-semibold mb-4 block">
                  2. Paste Job Description
                </Label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {jobDescription.length} characters
                  {jobDescription.length < 50 && " (minimum 50)"}
                </p>
              </div>

              {/* Analyze Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isAnalyzing}
                  size="lg"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Keywords
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Panel - Resume Preview */}
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Template Selector - Compact inline */}
              <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">Choose Template</Label>
                  <div className="flex items-center gap-2">
                    {/* Accent Color Picker - Only show for Tech template */}
                    {selectedTemplate === "tech-focused" && (
                      <div className="flex gap-1.5">
                        {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedAccentColor(color)}
                            className={`w-5 h-5 rounded-full transition-all ${
                              selectedAccentColor === color 
                                ? "ring-2 ring-offset-1 ring-gray-400 scale-110" 
                                : "hover:scale-110"
                            }`}
                            style={{ backgroundColor: ACCENT_COLORS[color].primary }}
                            title={ACCENT_COLORS[color].name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {TEMPLATES.map((template) => {
                    const isSelected = selectedTemplate === template.slug;
                    return (
                      <button
                        key={template.slug}
                        onClick={() => setSelectedTemplate(template.slug)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {template.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-700 text-sm">Preview</h3>
              </div>
              
              <div className="min-h-[calc(100vh-250px)] bg-gray-100 p-4 overflow-x-auto">
                <div className="flex justify-center min-w-fit">
                {isUploading ? (
                  <div className="bg-white rounded-lg p-8 space-y-4 w-full max-w-[816px]">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="my-6 border-t" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : parsedAsTailored ? (
                  <PagedResumePreview scale={0.85} showPageNumbers={true}>
                    <ResumeTemplate
                      resume={parsedAsTailored}
                      template={selectedTemplate}
                      accentColor={selectedAccentColor}
                      designOptions={designOptions}
                    />
                  </PagedResumePreview>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 w-full">
                    <div className="text-center">
                      <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Upload a resume to see preview</p>
                      <p className="text-sm mt-2">
                        Your resume will be displayed using the selected template
                      </p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analyze Keywords */}
        {step === "analyze" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Keyword Analysis */}
            <div className="space-y-6">
              {/* Match Overview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Keyword Match Analysis</h2>
                  <Button variant="outline" size="sm" onClick={() => setStep("upload")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Back to Edit
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-blue-600">{matchRate}%</div>
                  <div className="text-sm text-gray-600">
                    <p>{totalMatched} keywords matched</p>
                    <p>{totalMissing} keywords missing</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${matchRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Add missing keywords below to improve your match rate
                </p>
              </Card>

              {/* Technical Skills Section */}
              <Card className="p-6">
                <h3 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Technical Skills
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  These skills will be listed in your Skills section
                </p>
                
                {/* Matched Technical */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-700">Matched ({technicalKeywords.matched.length})</span>
                    {technicalKeywords.matched.filter(k => selectedMissingKeywords.includes(k)).length > 0 && (
                      <span className="text-xs text-gray-500">(click added to remove)</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technicalKeywords.matched.map((keyword, idx) => {
                      const isUserAdded = selectedMissingKeywords.includes(keyword);
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={`bg-green-100 text-green-800 ${
                            isUserAdded 
                              ? "ring-2 ring-green-400 cursor-pointer hover:bg-red-100 hover:text-red-800 hover:ring-red-400 transition-colors pr-1" 
                              : ""
                          }`}
                          onClick={() => isUserAdded && removeFromMatched(keyword, 'technical')}
                        >
                          {keyword}
                          {isUserAdded && <X className="h-3 w-3 ml-1" />}
                        </Badge>
                      );
                    })}
                    {technicalKeywords.matched.length === 0 && (
                      <p className="text-sm text-gray-400 italic">None found</p>
                    )}
                  </div>
                </div>
                
                {/* Missing Technical */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">Missing ({technicalKeywords.missing.length})</span>
                    <div className="flex gap-2">
                      {technicalKeywords.missing.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => selectAllMissing('technical')}>
                          Add All
                        </Button>
                      )}
                      {technicalKeywords.matched.filter(k => selectedMissingKeywords.includes(k)).length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => clearSelectedMissing('technical')}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technicalKeywords.missing.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer transition-all bg-orange-50 text-orange-700 border-orange-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
                        onClick={() => toggleMissingKeyword(keyword, 'technical')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                    {technicalKeywords.missing.length === 0 && (
                      <p className="text-sm text-gray-400 italic">All technical skills covered!</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Soft Skills Section */}
              <Card className="p-6">
                <h3 className="font-semibold text-purple-700 mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Soft Skills
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  These skills will be naturally woven into your summary and experience
                </p>
                
                {/* Matched Soft */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-700">Matched ({softKeywords.matched.length})</span>
                    {softKeywords.matched.filter(k => selectedMissingKeywords.includes(k)).length > 0 && (
                      <span className="text-xs text-gray-500">(click added to remove)</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {softKeywords.matched.map((keyword, idx) => {
                      const isUserAdded = selectedMissingKeywords.includes(keyword);
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={`bg-green-100 text-green-800 ${
                            isUserAdded 
                              ? "ring-2 ring-green-400 cursor-pointer hover:bg-red-100 hover:text-red-800 hover:ring-red-400 transition-colors pr-1" 
                              : ""
                          }`}
                          onClick={() => isUserAdded && removeFromMatched(keyword, 'soft')}
                        >
                          {keyword}
                          {isUserAdded && <X className="h-3 w-3 ml-1" />}
                        </Badge>
                      );
                    })}
                    {softKeywords.matched.length === 0 && (
                      <p className="text-sm text-gray-400 italic">None found</p>
                    )}
                  </div>
                </div>
                
                {/* Missing Soft */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">Missing ({softKeywords.missing.length})</span>
                    <div className="flex gap-2">
                      {softKeywords.missing.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => selectAllMissing('soft')}>
                          Add All
                        </Button>
                      )}
                      {softKeywords.matched.filter(k => selectedMissingKeywords.includes(k)).length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => clearSelectedMissing('soft')}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {softKeywords.missing.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer transition-all bg-orange-50 text-orange-700 border-orange-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
                        onClick={() => toggleMissingKeyword(keyword, 'soft')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                    {softKeywords.missing.length === 0 && (
                      <p className="text-sm text-gray-400 italic">All soft skills covered!</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Original Keywords Section */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-gray-500" />
                  Your Original Keywords
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  These come from your uploaded resume. Click to keep them in your tailored version.
                </p>

                <div className="flex flex-wrap gap-2">
                  {originalKeywords.map((keyword, idx) => {
                    const isSelected = selectedOriginalKeywords.includes(keyword);
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-red-100 hover:text-red-800 hover:border-red-300"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                        }`}
                        onClick={() => toggleOriginalKeyword(keyword)}
                      >
                        {isSelected ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                        {keyword}
                      </Badge>
                    );
                  })}
                  {originalKeywords.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No additional keywords found in your original resume.
                    </p>
                  )}
                </div>
              </Card>

              {/* Generate Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Tailored Resume
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Panel - Resume Preview */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Original Resume</h3>
                  <p className="text-sm text-gray-500">This will be tailored with your selected keywords</p>
                </div>
              </div>
              
              <div className="min-h-[calc(100vh-250px)] bg-gray-100 p-4 overflow-x-auto">
                <div className="flex justify-center min-w-fit">
                {parsedAsTailored && (
                  <PagedResumePreview scale={0.85} showPageNumbers={true}>
                    <ResumeTemplate
                      resume={parsedAsTailored}
                      template={selectedTemplate}
                      accentColor={selectedAccentColor}
                      designOptions={designOptions}
                    />
                  </PagedResumePreview>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </RequireAuth>
  );
}
