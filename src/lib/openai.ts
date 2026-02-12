import OpenAI from "openai";
import { TailoredResume, TailoredResumeSchema, ParsedResume, ParsedResumeSchema, ExtractedJobDescription } from "@/types/resume";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const normalizeLocation = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === "unknown") return undefined;
  return trimmed;
};

const stripUrlScheme = (value: string) => value.replace(/^https?:\/\//i, "");

const TAILORING_SYSTEM_PROMPT = `You are an elite professional resume writer with decades of experience crafting resumes that get candidates hired at top companies. Your job is to SIGNIFICANTLY REWRITE and tailor a resume to match a specific job description.

CRITICAL RULES:
1. NEVER invent new employers, job titles, degrees, or certifications that are not in the original resume.
2. NEVER fabricate experience or qualifications.
3. NEVER repeat same keyword all over the resume.

WRITING STYLE - SOUND HUMAN, NOT AI:
- Write in natural, professional language that real humans use - NOT robotic AI-generated text
- Vary sentence structure and length naturally
- Use industry-appropriate terminology without being overly formal
- Avoid buzzwords and clichés like "leverage", "synergy", "cutting-edge", "spearheaded"
- Write like a confident professional describing their accomplishments, not a marketing brochure

ACHIEVEMENT ARCHITECTURE (TAR):
Use this formula for every bullet point:
(Action verb) + (Task) + (Result)

Action verbs (must start with one of these and try not use the same action verb more than once if possible.):
Assembled, Built, Calculated, Computed, Designed, Devised, Maintained, Operated, Pinpointed, Programmed, Remodeled, Repaired, Solved

TASK:
- What you built, improved, or delivered
- Technologies, tools, or methods used (only if accurate)
- Scope of ownership (feature, service, workflow, dataset, system)
- Collaboration or integration points when relevant

RESULT:
- Clear impact or outcome
- Metrics are optional; use qualitative results if numbers are unknown
- Never fabricate metrics or tools

Constraints:
- 1–2 lines per bullet
- No buzzwords without substance
- No invented technologies, responsibilities, or outcomes
- Each bullet must answer: “Why did this matter?”
- Mirror keywords and phrasing from the target job description when truthful

Example:
“Built a feature‑flagged onboarding flow that improved activation and reduced drop‑off.”

BULLET POINT RULES:
- Keep each position to a MAXIMUM of 4 bullet points - quality over quantity
- Focus on the MOST RELEVANT achievements that align with the target job description
- Keep bullets brief and impactful - 1-2 lines max, no fluff
- Start each bullet with a required action verb (list above)
- Prioritize business impact and outcomes over task descriptions
- Write the bullets in the present tense for current jobs, and past tense for previous positions

PROJECT RULES:
- Each project MUST include 3-4 bullet points in "highlights"
- Do NOT leave projects with a single bullet
- Do NOT use the same action verb more than once in a single project. 
- Do NOT include metrics in project bullets
- Use the project's description as the primary source for bullet content
- Weave selected keywords naturally into project bullets when relevant
- DO NOT include metrics and numbers in the project descirption. These are my projects and need to show


SUMMARY WRITING:
- The summary statement is an optional section, however you can utilize this section to tell how your skills and experience make you a fit for the position. A summary should be 3-5 lines long and highlight key skills related to the position
- Write a brief, impactful summary of MAXIMUM 2-4 sentences (no more than 4 sentences)
- Lead with years of experience and core expertise area
- Sound confident and accomplished, not desperate or generic
- Keep it concise - recruiters spend only seconds scanning summaries
- Above all, be human and natural.
- Do not use "known for" or "Brings" in the summary. You must rephrase it in a way that doesn't use "known for" in the summary.

KEYWORD INTEGRATION:
- The user has pre-selected specific keywords in "selectedKeywords" that MUST ALL appear in the final resume
- Weave keywords naturally into context - don't just list them
- Every selectedKeyword MUST appear somewhere: summary, experience bullets, or skills section

SKILLS SECTION RULES:
- The skills section displays as a SINGLE comma-separated list of technical keywords
- Put ALL technical skills (programming languages, frameworks, tools, technologies) into skills.technical, skills.frameworks, skills.tools, or skills.languages
- DO NOT include soft skills (like "communication", "leadership", "teamwork", "problem-solving", "collaboration") in the skills section
- SOFT SKILLS should be naturally woven into the summary instead
- If a technical keyword doesn't fit in a specific category, add it to skills.other


OUTPUT REQUIREMENTS:
- Output ONLY valid JSON matching the schema below. No explanations or markdown.
- matchedKeywords: Should include ALL selectedKeywords plus any additional keywords you incorporated
- missingKeywords: Only keywords NOT in selectedKeywords that could not be incorporated

REQUIRED OUTPUT SCHEMA:
{
  "contact": { "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "url", "github": "url" },
  "summary": "Compelling 2-3 sentence professional summary with key achievements",
  "experience": [{ "company": "string", "title": "string", "startDate": "string", "endDate": "string or omit if current", "location": "string", "highlights": ["Achievement-focused bullets using Result + Metric + Context"] }],
  "education": [{ "institution": "string", "degree": "string", "field": "string", "endDate": "string" }],
  "skills": { "technical": ["skills"], "frameworks": ["frameworks"], "tools": ["tools"], "languages": ["languages"], "soft": [], "other": ["remaining technical keywords"] },
  "projects": [{ "name": "string", "description": "string", "technologies": ["tech"], "highlights": ["3-4 bullets"] }],
  "certifications": [{ "name": "string", "issuer": "string", "date": "string" }],
  "matchedKeywords": ["all selectedKeywords plus extras"],
  "missingKeywords": ["only keywords NOT selected that couldn't be incorporated"]
}

You will receive:
- parsedResume: The candidate's existing resume data
- jobDescription: Extracted signals from the target job description  
- selectedKeywords: Keywords the user EXPLICITLY CHOSE - YOU MUST INCLUDE ALL OF THEM

Your goal: Create the most compelling, ATS-optimized resume that will impress hiring managers and pass automated screening systems. Every selectedKeyword must appear in the final resume.`;

export async function tailorResume(
  parsedResume: ParsedResume,
  jobDescription: ExtractedJobDescription,
  selectedKeywords: string[] = []
): Promise<TailoredResume> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: TAILORING_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          parsedResume,
          jobDescription,
          selectedKeywords,
        }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_completion_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  console.log("OpenAI tailor response:", content.substring(0, 500));
  
  const parsed = JSON.parse(content);
  
  // Sometimes OpenAI wraps the response in an outer object
  const resumeData = parsed.tailoredResume || parsed.resume || parsed;
  
  // Normalize the tailored resume data
  const normalizedResume = {
    contact: resumeData.contact || parsedResume.contact,
    summary: resumeData.summary || parsedResume.summary || "",
    experience: (resumeData.experience || parsedResume.experience || []).map((exp: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        company: exp.company || "Unknown Company",
        title: exp.title || "Unknown Title",
        location: normalizeLocation(exp.location),
        startDate: exp.startDate || "Unknown",
        highlights: exp.highlights || [],
      };
      if (exp.endDate && typeof exp.endDate === 'string') {
        result.endDate = exp.endDate;
      }
      return result;
    }),
    education: (resumeData.education || parsedResume.education || []).map((edu: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        institution: edu.institution || "Unknown Institution",
        degree: edu.degree || "Unknown Degree",
        field: edu.field,
        location: normalizeLocation(edu.location),
        gpa: edu.gpa,
        highlights: edu.highlights,
      };
      if (edu.startDate && typeof edu.startDate === 'string') {
        result.startDate = edu.startDate;
      }
      if (edu.endDate && typeof edu.endDate === 'string') {
        result.endDate = edu.endDate;
      }
      return result;
    }),
    skills: resumeData.skills || parsedResume.skills || {},
    projects: resumeData.projects || parsedResume.projects,
    certifications: resumeData.certifications || parsedResume.certifications,
    matchedKeywords: resumeData.matchedKeywords || [],
    missingKeywords: resumeData.missingKeywords || [],
  };
  
  // POST-PROCESSING: Ensure ALL selectedKeywords are in the resume
  // Check if each selected keyword appears somewhere in the resume
  if (selectedKeywords.length > 0) {
    const resumeText = JSON.stringify(normalizedResume).toLowerCase();
    const missingFromResume: string[] = [];
    
    for (const keyword of selectedKeywords) {
      // Check if keyword appears anywhere in the resume (case-insensitive)
      if (!resumeText.includes(keyword.toLowerCase())) {
        missingFromResume.push(keyword);
      }
    }
    
    // Add missing keywords to skills buckets
    if (missingFromResume.length > 0) {
      console.log("Adding missing selectedKeywords to skills:", missingFromResume);
      const skills = normalizedResume.skills as Record<string, string[] | undefined>;
      skills.languages = skills.languages || [];
      skills.frameworks = skills.frameworks || [];
      skills.tools = skills.tools || [];
      skills.other = skills.other || [];

      const languageSet = new Set([
        "javascript",
        "typescript",
        "python",
        "java",
        "c",
        "c++",
        "c#",
        "go",
        "golang",
        "ruby",
        "php",
        "swift",
        "kotlin",
        "rust",
        "scala",
        "sql",
        "bash",
        "shell",
      ]);
      const frameworkSet = new Set([
        "react",
        "next.js",
        "nextjs",
        "angular",
        "vue",
        "svelte",
        "tailwind",
        "tailwind css",
        "fastapi",
        "django",
        "flask",
        "spring",
        "node.js",
        "nodejs",
        "express",
        "nestjs",
      ]);
      const toolSet = new Set([
        "git",
        "github",
        "git workflow",
        "docker",
        "firebase",
        "firestore",
        "firebase admin sdk",
        "google recaptcha",
        "ci/cd",
        "serverless",
        "serverless api routes",
        "restful apis",
        "api integrations",
        "postgresql",
        "nosql",
      ]);

      const pushUnique = (arr: string[], value: string) => {
        if (!arr.includes(value)) arr.push(value);
      };

      missingFromResume.forEach((keyword) => {
        const key = keyword.trim().toLowerCase();
        if (!key) return;
        if (languageSet.has(key)) pushUnique(skills.languages as string[], keyword);
        else if (frameworkSet.has(key)) pushUnique(skills.frameworks as string[], keyword);
        else if (toolSet.has(key)) pushUnique(skills.tools as string[], keyword);
        else pushUnique(skills.other as string[], keyword);
      });
    }
  }
  
  // Clean up contact - remove empty strings and invalid URLs
  if (normalizedResume.contact) {
    const contact = normalizedResume.contact as Record<string, unknown>;
    // Remove empty strings
    Object.keys(contact).forEach(key => {
      if (contact[key] === "" || contact[key] === null || contact[key] === undefined) {
        delete contact[key];
      }
    });
    // Ensure name exists
    if (!contact.name) {
      contact.name = "Unknown";
    }
    // Clean up and validate URLs
    ['linkedin', 'github', 'website'].forEach(field => {
      const value = contact[field];
      if (value && typeof value === 'string') {
        let url = value.trim();
        
        // If it's just a username, profile name, or placeholder text, remove it
        if (!url.includes('.') || url.length < 10) {
          delete contact[field];
          return;
        }
        
        // Only validate URLs that already include a scheme
        if (url.startsWith("http://") || url.startsWith("https://")) {
          try {
            new URL(url);
            contact[field] = stripUrlScheme(url);
          } catch {
            // Invalid URL, remove the field
            delete contact[field];
          }
        } else {
          contact[field] = stripUrlScheme(url);
        }
      } else if (value) {
        // Non-string value, remove it
        delete contact[field];
      }
    });
  }
  
  console.log("Normalized tailored resume:", JSON.stringify(normalizedResume, null, 2).substring(0, 1000));
  
  // Validate with Zod schema
  const result = TailoredResumeSchema.safeParse(normalizedResume);
  if (!result.success) {
    console.error("Tailor validation error:", JSON.stringify(result.error.issues, null, 2));
    throw new Error(`Failed to tailor resume: ${result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
  }
  
  return result.data;
}

const PARSE_RESUME_PROMPT = `You are an expert resume parser. Your job is to extract ALL structured data from the resume text provided.

SECTION IDENTIFICATION:
Look for common section headers like:
- EDUCATION, Education, ACADEMIC BACKGROUND
- WORK EXPERIENCE, EXPERIENCE, PROFESSIONAL EXPERIENCE, EMPLOYMENT
- SKILLS, TECHNICAL SKILLS, CORE COMPETENCIES
- PROJECTS, PERSONAL PROJECTS
- CERTIFICATIONS, CERTIFICATES, LICENSES

PARSING RULES:
1. ALWAYS output valid JSON - never fail
2. Extract EVERYTHING you can find - don't skip sections
3. For work experience entries, look for:
   - Company names (often followed by dates or location)
   - Job titles (like "Software Engineer", "Developer", "Manager")
   - Date ranges (e.g., "Aug 2023 - Present", "2019-2023")
   - Bullet points describing responsibilities/achievements
4. For education entries, look for:
   - University/college/school names
   - Degree types (Bachelor's, Master's, Associate, etc.)
   - Fields of study
   - Graduation dates
5. Parse ALL bullet points as highlights for each position/education
6. If information is missing, use "Unknown" for required fields

Output ONLY valid JSON matching this schema:
{
  "contact": {
    "name": "string (REQUIRED - the person's full name)",
    "email": "string (optional)",
    "phone": "string (optional)",
    "location": "string (optional)",
    "linkedin": "string URL (optional)",
    "github": "string URL (optional)",
    "website": "string URL (optional)"
  },
  "summary": "string - the professional summary/objective paragraph if present",
  "experience": [
    {
      "company": "string - company/organization name",
      "title": "string - job title/position",
      "location": "string (optional)",
      "startDate": "string - e.g., 'Aug 2023', 'Jan 2020'",
      "endDate": "string or null - use null or omit for 'Present'/'Current'",
      "highlights": ["array of bullet point achievements/responsibilities"]
    }
  ],
  "education": [
    {
      "institution": "string - school/university name",
      "degree": "string - e.g., 'Bachelor's in Computer Science'",
      "field": "string (optional) - field of study if separate",
      "location": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional) - graduation date",
      "gpa": "string (optional)",
      "highlights": ["optional array of achievements"]
    }
  ],
  "skills": {
    "technical": ["programming languages, technical skills"],
    "languages": ["spoken languages like English, Spanish"],
    "frameworks": ["frameworks like React, Django"],
    "tools": ["tools like Git, Docker"],
    "soft": ["soft skills"],
    "other": ["any other skills"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string (optional)",
      "url": "string URL (optional)",
      "technologies": ["tech used"],
      "highlights": ["achievements/details"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string (optional)",
      "date": "string (optional)"
    }
  ],
  "_parseWarnings": ["List any sections that were unclear or may need review"]
}

IMPORTANT: Extract ALL work experience and education entries. Don't stop at just one. Read the ENTIRE text carefully.`;

export interface ParseResumeResult {
  resume: ParsedResume;
  warnings: string[];
  needsReview: boolean;
}

const extractContactFallback = (resumeText: string) => {
  const lines = resumeText.split("\n").map((line) => line.trim()).filter(Boolean);
  const emailMatch = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = resumeText.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const linkedinMatch = resumeText.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i) || resumeText.match(/linkedin\.com\/[^\s)]+/i);
  const githubMatch = resumeText.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i) || resumeText.match(/github\.com\/[^\s)]+/i);

  const nameCandidate = lines.find((line) => {
    if (line.length < 4) return false;
    if (line.match(/@/)) return false;
    if (line.toUpperCase().startsWith("RESUME")) return false;
    const wordCount = line.split(/\s+/).length;
    return wordCount >= 2 && wordCount <= 4;
  });

  const normalizeUrl = (value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed;
  };

  return {
    name: nameCandidate,
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: normalizeUrl(linkedinMatch?.[0]),
    github: normalizeUrl(githubMatch?.[0]),
  };
};

async function parseChunkWithOpenAI(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: PARSE_RESUME_PROMPT,
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_completion_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return JSON.parse(content);
}

function mergeStringArrays(a?: string[], b?: string[]) {
  const combined = [...(a || []), ...(b || [])];
  const seen = new Set<string>();
  return combined.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function parseResumeText(resumeText: string): Promise<ParseResumeResult> {
  const fallbackContact = extractContactFallback(resumeText);
  const parsed = await parseChunkWithOpenAI(resumeText);

  console.log("OpenAI resume parse response:", JSON.stringify(parsed).substring(0, 500));

  // Validate and provide defaults for optional arrays
  const normalizedResume: Record<string, any> = {
    ...parsed,
    contact: parsed.contact || { name: "Unknown" },
    experience: parsed.experience || [],
    education: parsed.education || [],
    skills: parsed.skills || {},
    projects: parsed.projects || [],
    certifications: parsed.certifications || [],
  };
  
  const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  };

  const pruneNulls = (value: unknown): unknown => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) {
      return value.map(pruneNulls).filter((item) => item !== undefined);
    }
    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>)
        .map(([key, val]) => [key, pruneNulls(val)] as const)
        .filter(([, val]) => val !== undefined && val !== "");
      return Object.fromEntries(entries);
    }
    return value;
  };

  // Ensure contact.name exists (use fallback if missing)
  if (!normalizedResume.contact.name) {
    normalizedResume.contact.name = fallbackContact.name || "Unknown";
  }

  // Merge fallback contact details if missing
  const contactRecord = normalizedResume.contact as Record<string, unknown>;
  if (!contactRecord.email || contactRecord.email === "Unknown") {
    contactRecord.email = fallbackContact.email || undefined;
  }
  if (!contactRecord.phone || contactRecord.phone === "Unknown") {
    contactRecord.phone = fallbackContact.phone || undefined;
  }
  if (!contactRecord.linkedin || contactRecord.linkedin === "Unknown") {
    contactRecord.linkedin = fallbackContact.linkedin || undefined;
  }
  if (!contactRecord.github || contactRecord.github === "Unknown") {
    contactRecord.github = fallbackContact.github || undefined;
  }
  if ("location" in contactRecord) {
    const cleanedLocation = normalizeLocation(contactRecord.location);
    if (cleanedLocation) {
      contactRecord.location = cleanedLocation;
    } else {
      delete contactRecord.location;
    }
  }
  
  // Ensure experience entries have required fields and convert null to undefined
  normalizedResume.experience = normalizedResume.experience.map((exp: Record<string, unknown>) => {
    const result: Record<string, unknown> = {
      company: exp.company || "Unknown Company",
      title: exp.title || "Unknown Title",
      location: normalizeLocation(exp.location),
      startDate: exp.startDate || "Unknown",
      highlights: exp.highlights || [],
    };
    // Only include endDate if it's a non-null string
    if (exp.endDate && typeof exp.endDate === 'string') {
      result.endDate = exp.endDate;
    }
    return result;
  });

  // Deduplicate identical experience entries (same company/title/highlights)
  const scoreExperience = (exp: Record<string, unknown>) => {
    const isKnown = (value?: unknown, unknownValue?: string) =>
      typeof value === "string" && value.trim().length > 0 && value !== unknownValue;
    let score = 0;
    if (isKnown(exp.company, "Unknown Company")) score += 2;
    if (isKnown(exp.title, "Unknown Title")) score += 2;
    if (isKnown(exp.startDate, "Unknown")) score += 1;
    if (isKnown(exp.endDate)) score += 1;
    if (isKnown(exp.location, "Unknown")) score += 1;
    return score;
  };

  const dedupeExperience = (items: Record<string, unknown>[]) => {
    const seen = new Map<string, Record<string, unknown>>();
    for (const exp of items) {
      const highlights = Array.isArray(exp.highlights) ? exp.highlights : [];
      const key = `${String(exp.company)}::${String(exp.title)}::${highlights.join("|")}`;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, exp);
        continue;
      }
      const existingScore = scoreExperience(existing);
      const nextScore = scoreExperience(exp);
      if (nextScore > existingScore) {
        seen.set(key, exp);
      }
    }
    return Array.from(seen.values());
  };

  normalizedResume.experience = dedupeExperience(normalizedResume.experience);
  
  // Ensure education entries have required fields and convert null to undefined
  normalizedResume.education = normalizedResume.education.map((edu: Record<string, unknown>) => {
    const result: Record<string, unknown> = {
      institution: edu.institution || "Unknown Institution",
      degree: edu.degree || "Unknown Degree",
      field: edu.field,
      location: normalizeLocation(edu.location),
      gpa: typeof edu.gpa === "number" ? String(edu.gpa) : edu.gpa,
      highlights: edu.highlights,
    };
    // Only include dates if they're non-null strings
    if (edu.startDate && typeof edu.startDate === 'string') {
      result.startDate = edu.startDate;
    }
    if (edu.endDate && typeof edu.endDate === 'string') {
      result.endDate = edu.endDate;
    }
    if (result.gpa === null || result.gpa === "") {
      delete result.gpa;
    }
    return result;
  });
  
  // Normalize projects to avoid nulls and invalid types
  normalizedResume.projects = (normalizedResume.projects || []).map((proj: Record<string, unknown>) => {
    const result: Record<string, unknown> = {
      name: typeof proj.name === "string" && proj.name.trim().length > 0 ? proj.name : "Untitled Project",
      description: typeof proj.description === "string" ? proj.description : undefined,
      url: proj.url,
      technologies: normalizeStringArray(proj.technologies),
      highlights: normalizeStringArray(proj.highlights),
    };
    return result;
  });

  // Clean up project URLs to avoid invalid URL validation errors
  normalizedResume.projects = (normalizedResume.projects || []).map((proj: Record<string, unknown>) => {
    const result: Record<string, unknown> = { ...proj };
    if (result.url === null) {
      delete result.url;
      return result;
    }
    if (result.url && typeof result.url === "string") {
      const url = result.url.trim();
      if (!url) {
        delete result.url;
        return result;
      }
      // Preserve user-provided URL as-is (strip scheme for display consistency)
      result.url = stripUrlScheme(url);
    } else if (result.url) {
      delete result.url;
    }
    return result;
  });

  // Ensure each project has 3-4 highlight bullets
  const ensureProjectHighlights = (proj: Record<string, unknown>) => {
    const highlights = normalizeStringArray(proj.highlights);
    const description = typeof proj.description === "string" ? proj.description : "";
    const sentences = description
      .split(/[.!?]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const merged = [...highlights];
    for (const sentence of sentences) {
      if (merged.length >= 4) break;
      if (!merged.includes(sentence)) merged.push(sentence);
    }

    if (merged.length > 4) return merged.slice(0, 4);
    while (merged.length > 0 && merged.length < 3) {
      merged.push(merged[merged.length - 1]);
    }
    return merged;
  };

  normalizedResume.projects = (normalizedResume.projects || []).map((proj: Record<string, unknown>) => ({
    ...proj,
    highlights: ensureProjectHighlights(proj),
  }));

  // Normalize skills arrays
  normalizedResume.skills = {
    ...normalizedResume.skills,
    technical: normalizeStringArray(normalizedResume.skills?.technical),
    frameworks: normalizeStringArray(normalizedResume.skills?.frameworks),
    tools: normalizeStringArray(normalizedResume.skills?.tools),
    languages: normalizeStringArray(normalizedResume.skills?.languages),
    soft: normalizeStringArray(normalizedResume.skills?.soft),
    other: normalizeStringArray(normalizedResume.skills?.other),
  };

  // Re-bucket skills so Languages only contains actual languages
  const languageSet = new Set([
    "javascript",
    "typescript",
    "python",
    "java",
    "c",
    "c++",
    "c#",
    "go",
    "golang",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "rust",
    "scala",
    "sql",
    "bash",
    "shell",
  ]);
  const frameworkSet = new Set([
    "react",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "svelte",
    "tailwind",
    "tailwind css",
    "fastapi",
    "django",
    "flask",
    "spring",
    "node.js",
    "nodejs",
    "express",
    "nestjs",
  ]);
  const toolSet = new Set([
    "git",
    "github",
    "git workflow",
    "docker",
    "firebase",
    "firestore",
    "firebase admin sdk",
    "google recaptcha",
    "ci/cd",
    "serverless",
    "serverless api routes",
    "restful apis",
    "api integrations",
    "postgresql",
    "nosql",
    "sql",
  ]);

  const bucketSkill = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key) return "other";
    if (languageSet.has(key)) return "languages";
    if (frameworkSet.has(key)) return "frameworks";
    if (toolSet.has(key)) return "tools";
    return "other";
  };

  const combined = [
    ...normalizedResume.skills.languages,
    ...normalizedResume.skills.technical,
  ];

  if (combined.length > 0) {
    const nextLanguages = new Set(normalizedResume.skills.languages);
    const nextFrameworks = new Set(normalizedResume.skills.frameworks);
    const nextTools = new Set(normalizedResume.skills.tools);
    const nextOther = new Set(normalizedResume.skills.other);

    combined.forEach((item) => {
      const bucket = bucketSkill(item);
      if (bucket === "languages") nextLanguages.add(item);
      else if (bucket === "frameworks") nextFrameworks.add(item);
      else if (bucket === "tools") nextTools.add(item);
      else nextOther.add(item);
    });

    normalizedResume.skills.languages = Array.from(nextLanguages);
    normalizedResume.skills.frameworks = Array.from(nextFrameworks);
    normalizedResume.skills.tools = Array.from(nextTools);
    normalizedResume.skills.other = Array.from(nextOther);
    normalizedResume.skills.technical = [];
  }

  // Always include core languages in the Languages row
  const mustHaveLanguages = ["TypeScript", "SQL", "Python", "JavaScript", "C++", "C"];
  mustHaveLanguages.forEach((lang) => {
    if (!normalizedResume.skills.languages.includes(lang)) {
      normalizedResume.skills.languages.push(lang);
    }
  });

  // Drop nulls/empty strings throughout
  const pruned = pruneNulls(normalizedResume) as typeof normalizedResume;
  
  // Re-assign after pruning
  Object.assign(normalizedResume, pruned);
  
  console.log("Normalized resume:", JSON.stringify(normalizedResume, null, 2).substring(0, 1000));
  
  // Clean up contact - remove empty strings and invalid URLs
  if (normalizedResume.contact) {
    const contact = normalizedResume.contact as Record<string, unknown>;
    // Remove empty strings
    Object.keys(contact).forEach(key => {
      if (contact[key] === "" || contact[key] === null || contact[key] === undefined) {
        delete contact[key];
      }
    });
    // Clean up and validate URLs
    ['linkedin', 'github', 'website'].forEach(field => {
      const value = contact[field];
      if (value && typeof value === 'string') {
        let url = value.trim();
        
        // If it's just a username, profile name, or placeholder text, remove it
        if (!url.includes('.') || url.length < 10) {
          delete contact[field];
          return;
        }
        
        // Only validate URLs that already include a scheme
        if (url.startsWith("http://") || url.startsWith("https://")) {
          try {
            new URL(url);
            contact[field] = stripUrlScheme(url);
          } catch {
            // Invalid URL, remove the field
            delete contact[field];
          }
        } else {
          contact[field] = stripUrlScheme(url);
        }
      } else if (value) {
        // Non-string value, remove it
        delete contact[field];
      }
    });
  }
  
  // Extract warnings from the parsed data
  const parseWarnings: string[] = parsed._parseWarnings || [];
  delete normalizedResume._parseWarnings;
  
  // Check for signs that parsing may be incomplete
  const hasContact = Boolean(normalizedResume.contact && normalizedResume.contact.name && normalizedResume.contact.name !== "Unknown");
  const hasSummary = Boolean(normalizedResume.summary && String(normalizedResume.summary).trim().length > 0);
  const hasExperience = Array.isArray(normalizedResume.experience) && normalizedResume.experience.length > 0;
  const hasEducation = Array.isArray(normalizedResume.education) && normalizedResume.education.length > 0;
  const hasSkills = Boolean(normalizedResume.skills && Object.values(normalizedResume.skills).some((val) => Array.isArray(val) && val.length > 0));
  const hasProjects = Array.isArray(normalizedResume.projects) && normalizedResume.projects.length > 0;
  const hasCertifications = Array.isArray(normalizedResume.certifications) && normalizedResume.certifications.length > 0;

  const shouldKeepWarning = (warning: string) => {
    const normalized = warning.toLowerCase();
    if (hasContact && normalized.includes("no contact")) return false;
    if (hasSummary && normalized.includes("no summary")) return false;
    if (hasExperience && normalized.includes("no work experience")) return false;
    if (hasEducation && normalized.includes("no education")) return false;
    if (hasSkills && normalized.includes("no skills")) return false;
    if (hasProjects && normalized.includes("no projects")) return false;
    if (hasCertifications && normalized.includes("no certifications")) return false;
    if ((hasSummary || hasExperience || hasEducation || hasSkills || hasProjects || hasCertifications) && normalized.includes("only contact")) {
      return false;
    }
    if (hasContact && normalized.includes("name not found")) return false;
    if (normalized.includes("no explicit") && (hasSkills || hasProjects || hasExperience || hasEducation)) {
      return false;
    }
    return true;
  };

  const warnings: string[] = [];
  const seenWarnings = new Set<string>();
  for (const warning of parseWarnings) {
    const trimmed = warning.trim();
    if (!trimmed) continue;
    if (!shouldKeepWarning(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (seenWarnings.has(key)) continue;
    seenWarnings.add(key);
    warnings.push(trimmed);
  }
  let needsReview = false;
  
  if (normalizedResume.contact?.name === "Unknown") {
    warnings.push("Could not find your name - please add it in the editor");
    needsReview = true;
  }
  if (!normalizedResume.experience || normalizedResume.experience.length === 0) {
    warnings.push("No work experience found - add it in the editor if applicable");
    needsReview = true;
  }
  if (!normalizedResume.education || normalizedResume.education.length === 0) {
    warnings.push("No education found - add it in the editor if applicable");
    needsReview = true;
  }
  if (normalizedResume.experience?.some((e: Record<string, unknown>) => e.company === "Unknown Company" || e.title === "Unknown Title")) {
    warnings.push("Some job entries may be missing company or title information");
    needsReview = true;
  }
  if (normalizedResume.education?.some((e: Record<string, unknown>) => e.institution === "Unknown Institution" || e.degree === "Unknown Degree")) {
    warnings.push("Some education entries may be missing institution or degree information");
    needsReview = true;
  }
  
  // Validate against schema - but be lenient
  const result = ParsedResumeSchema.safeParse(normalizedResume);
  if (!result.success) {
    console.error("Resume parsing validation error:", JSON.stringify(result.error.issues, null, 2));
    // Instead of throwing, try to fix the issues and continue
    result.error.issues.forEach(issue => {
      warnings.push(`Parsing issue: ${issue.path.join('.')} - ${issue.message}`);
    });
    needsReview = true;
    
    // Return a minimal valid resume structure
    const fallbackResume: ParsedResume = {
      contact: { name: normalizedResume.contact?.name || "Unknown" },
      experience: [],
      education: [],
      skills: normalizedResume.skills || {},
      summary: normalizedResume.summary || "",
      projects: [],
      certifications: [],
    };
    
    return {
      resume: fallbackResume,
      warnings,
      needsReview: true,
    };
  }
  
  return {
    resume: result.data,
    warnings,
    needsReview,
  };
}

const EXTRACT_JD_PROMPT = `Extract key signals from this job description.

Output ONLY valid JSON:
{
  "title": "Job title",
  "company": "Company name (if mentioned)",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "requiredExperience": "e.g., 3+ years",
  "responsibilities": ["responsibility1", "responsibility2"],
  "keywords": ["important", "keywords", "from", "the", "JD"]
}

Focus on actionable signals that help tailor a resume.`;

export async function extractJobDescription(jdText: string): Promise<ExtractedJobDescription> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: EXTRACT_JD_PROMPT,
      },
      {
        role: "user",
        content: jdText,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_completion_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return JSON.parse(content) as ExtractedJobDescription;
}

export { openai };

const COVER_LETTER_PROMPT = `You are a professional career coach and writer. Write a concise, tailored cover letter using the resume data and job description provided.

RULES:
- Keep it to 3-5 short paragraphs.
- Use a professional but warm tone.
- Do NOT invent experience, employers, or qualifications.
- Align the content with the job description and the candidate's real experience.
- Avoid clichés and overly flowery language.
- Output ONLY valid JSON with the schema below.

OUTPUT SCHEMA:
{
  "coverLetter": "string"
}
`;

export async function generateCoverLetter(
  tailoredResume: TailoredResume,
  jobDescription: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: COVER_LETTER_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          resume: tailoredResume,
          jobDescription,
        }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_completion_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content);
  const coverLetter = parsed.coverLetter;
  if (!coverLetter || typeof coverLetter !== "string") {
    throw new Error("Invalid cover letter response");
  }

  return coverLetter.trim();
}
