import OpenAI from "openai";
import {
  TailoredResume,
  TailoredResumeSchema,
  ParsedResume,
  ParsedResumeSchema,
  ExtractedJobDescription,
} from "@/types/resume";

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

const TAILORING_SYSTEM_PROMPT = `You are a senior-level resume strategist and hiring pipeline expert. Your job is to significantly rewrite and tailor a candidate’s resume to align precisely with a target job description while preserving truth and accuracy.

Your output must improve clarity, impact, keyword alignment, and hiring signal strength — without fabricating experience.

-------------------------------------------------------
CORE INTEGRITY RULES (NON-NEGOTIABLE)
-------------------------------------------------------

1. NEVER invent employers, job titles, degrees, certifications, tools, metrics, or responsibilities not present in the parsedResume.
2. NEVER fabricate metrics. You may improve clarity or rephrase, but not invent.
3. NEVER exaggerate seniority or scope beyond what is supported.
4. Preserve chronological structure and factual integrity.

-------------------------------------------------------
ROLE ANALYSIS (THINK BEFORE WRITING)
-------------------------------------------------------

Before tailoring:
- Identify the job type: Startup, Enterprise, Government Contractor, or Federal.
- Identify required technologies, methodologies, and soft signals.
- Identify primary risk concerns (e.g., scalability, compliance, security, delivery speed, documentation, collaboration).
- Prioritize experience and projects that reduce perceived hiring risk for that role.

Then tailor tone and emphasis accordingly:

Startup:
- Emphasize ownership, speed, autonomy, product thinking.

Enterprise:
- Emphasize reliability, collaboration, maintainability, structured delivery.

Government Contractor:
- Emphasize security, compliance, documentation, structured SDLC, stability, predictability.

Federal (USAJobs-style):
- Emphasize scope, complexity, process adherence, documentation, measurable responsibility.

-------------------------------------------------------
BULLET WRITING STRATEGY
-------------------------------------------------------

Each bullet must follow:

Strong Action Verb + Specific Task/Scope + Why It Mattered

Rules:
- Write as a real person would — avoid sounding like a template or AI. Vary rhythm, sentence length, and structure.
- Use varied, natural action verbs appropriate to context.
- Avoid robotic repetition.
- Focus on ownership and decision-making when truthful.
- Avoid generic phrases that could apply to any engineer.
- Metrics are encouraged when truthful but never fabricated.
- If metrics are unavailable, describe qualitative impact clearly.
- Keep each position to MAX 4 bullets.
- Every bullet must answer: “Why did this matter?”

-------------------------------------------------------
PROJECT RULES
-------------------------------------------------------

- Each project must contain 3–4 strong bullets.
- Projects should reflect engineering depth, architecture decisions, or problem-solving.
- Do NOT downplay projects — treat them as production-grade systems when appropriate.
- Avoid fluff or vague feature descriptions.
- Metrics allowed only if present in original data.
- Avoid keyword stuffing.

-------------------------------------------------------
SUMMARY RULES
-------------------------------------------------------

- 2–4 sentences maximum.
- Lead with years of experience and specialization.
- Position candidate as low-risk and aligned with the target role.
- Avoid clichés, buzzwords, or marketing tone.
- Avoid “known for” and “brings.”
- Sound confident and precise.

-------------------------------------------------------
KEYWORD INTEGRATION
-------------------------------------------------------

The user provides selectedKeywords.

Requirements:
- integrate as many as naturally fit; list the rest in missingKeywords
- Integrate keywords naturally into summary, experience, or skills.
- Avoid unnatural repetition.
- Do not invent context just to force a keyword.
- If a keyword truly cannot fit without fabrication, list it in missingKeywords.

-------------------------------------------------------
SKILLS SECTION STRUCTURE
-------------------------------------------------------

Skills categories must remain:

Frontend: TypeScript, JavaScript (ES6+), React, Next.js, Angular, HTML5, CSS3, Tailwind CSS, and other frontend technologies
Backend: Node.js, Python, FastAPI, RESTful API development, and other backend technologies
Databases: PostgreSQL, Firebase Firestore, MongoDB, MySQL, and other database technologies
Infrastructure & DevOps: Docker, GitHub Actions (CI/CD), Git, AWS, Kubernetes, and other infra/devops tools
Security & Web Standards: RBAC, secure headers (CSP, HSTS), Google reCAPTCHA, structured data (JSON-LD), sitemap/robots configuration, and other security/web standards
Concepts: Authentication flows, real-time systems, performance profiling, API contract validation, and other technical concepts

No soft skills in Skills section — integrate them into summary or bullets.

-------------------------------------------------------
ATS OPTIMIZATION
-------------------------------------------------------

- Mirror phrasing from the job description when truthful.
- Use standard industry terminology.
- Avoid unusual formatting or symbols.
- Ensure important technical terms appear clearly (not buried in vague language).

-------------------------------------------------------
OUTPUT REQUIREMENTS
-------------------------------------------------------

Return ONLY valid JSON matching this schema:

{
  "contact": { "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "url", "github": "url" },
  "summary": "2-4 sentence professional summary",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string or omit if current",
      "location": "string",
      "highlights": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
    }
  ],
  "education": [
    { "institution": "string", "degree": "string", "field": "string", "endDate": "string" }
  ],
  "skills": {
    "frontend": [],
    "backend": [],
    "databases": [],
    "infrastructure": [],
    "security": [],
    "concepts": [],
    "other": []
  },
  "projects": [
    {
      "name": "string",
      "description": "brief 1-2 sentence overview",
      "technologies": [],
      "highlights": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
    }
  ],
  "certifications": [],
  "matchedKeywords": [],
  "missingKeywords": []
}

-------------------------------------------------------

You will receive:
- parsedResume
- jobDescription
- selectedKeywords

Your goal:
Produce a sharply tailored, ATS-optimized, human-sounding resume that improves interview probability while maintaining complete factual integrity.`;

export async function tailorResume(
  parsedResume: ParsedResume,
  jobDescription: ExtractedJobDescription,
  selectedKeywords: string[] = [],
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
        content: `Here is the candidate's current resume, the job they're targeting, and the keywords to integrate. Rewrite the resume to sound natural and human while aligning with the role.\n\n${JSON.stringify({
          parsedResume,
          jobDescription,
          selectedKeywords,
        })}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.65,
    max_completion_tokens: 6000,
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
    experience: (resumeData.experience || parsedResume.experience || []).map(
      (exp: Record<string, unknown>) => {
        const result: Record<string, unknown> = {
          company: exp.company || "Unknown Company",
          title: exp.title || "Unknown Title",
          location: normalizeLocation(exp.location),
          startDate: exp.startDate || "Unknown",
          highlights: exp.highlights || [],
        };
        if (exp.endDate && typeof exp.endDate === "string") {
          result.endDate = exp.endDate;
        }
        return result;
      },
    ),
    education: (resumeData.education || parsedResume.education || []).map(
      (edu: Record<string, unknown>) => {
        const result: Record<string, unknown> = {
          institution: edu.institution || "Unknown Institution",
          degree: edu.degree || "Unknown Degree",
          field: edu.field,
          location: normalizeLocation(edu.location),
          gpa: edu.gpa,
          highlights: edu.highlights,
        };
        if (edu.startDate && typeof edu.startDate === "string") {
          result.startDate = edu.startDate;
        }
        if (edu.endDate && typeof edu.endDate === "string") {
          result.endDate = edu.endDate;
        }
        return result;
      },
    ),
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

    if (missingFromResume.length > 0) {
      console.log(
        "Adding missing selectedKeywords to skills:",
        missingFromResume,
      );
      const skills = normalizedResume.skills as Record<
        string,
        string[] | undefined
      >;
      skills.frontend = skills.frontend || [];
      skills.backend = skills.backend || [];
      skills.databases = skills.databases || [];
      skills.infrastructure = skills.infrastructure || [];
      skills.security = skills.security || [];
      skills.concepts = skills.concepts || [];
      skills.other = skills.other || [];

      const frontendSet = new Set([
        "javascript",
        "typescript",
        "html",
        "css",
        "html5",
        "css3",
        "jsx",
        "react",
        "next.js",
        "nextjs",
        "angular",
        "vue",
        "svelte",
        "tailwind",
        "tailwind css",
        "redux",
        "es6",
        "es6+",
        "javascript (es6+)",
      ]);
      const backendSet = new Set([
        "node.js",
        "nodejs",
        "python",
        "fastapi",
        "django",
        "flask",
        "express",
        "nestjs",
        "spring",
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
        "restful api development",
        "restful apis",
        "api integrations",
      ]);
      const databaseSet = new Set([
        "postgresql",
        "firebase firestore",
        "firestore",
        "mongodb",
        "mysql",
        "redis",
        "sqlite",
        "dynamodb",
        "nosql",
      ]);
      const infraSet = new Set([
        "docker",
        "git",
        "github",
        "github actions",
        "github actions (ci/cd)",
        "ci/cd",
        "aws",
        "kubernetes",
        "terraform",
        "serverless",
        "firebase",
        "firebase admin sdk",
      ]);
      const securitySet = new Set([
        "rbac",
        "role-based access control",
        "role-based access control (rbac)",
        "csp",
        "hsts",
        "secure headers",
        "secure headers (csp, hsts)",
        "google recaptcha",
        "json-ld",
        "structured data",
        "structured data (json-ld)",
        "sitemap/robots configuration",
      ]);
      const conceptSet = new Set([
        "authentication flows",
        "real-time systems",
        "performance profiling",
        "api contract validation",
      ]);

      const pushUnique = (arr: string[], value: string) => {
        if (!arr.includes(value)) arr.push(value);
      };

      missingFromResume.forEach((keyword) => {
        const key = keyword.trim().toLowerCase();
        if (!key) return;
        if (frontendSet.has(key))
          pushUnique(skills.frontend as string[], keyword);
        else if (backendSet.has(key))
          pushUnique(skills.backend as string[], keyword);
        else if (databaseSet.has(key))
          pushUnique(skills.databases as string[], keyword);
        else if (infraSet.has(key))
          pushUnique(skills.infrastructure as string[], keyword);
        else if (securitySet.has(key))
          pushUnique(skills.security as string[], keyword);
        else if (conceptSet.has(key))
          pushUnique(skills.concepts as string[], keyword);
        else pushUnique(skills.other as string[], keyword);
      });
    }
  }

  // Clean up contact - remove empty strings and invalid URLs
  if (normalizedResume.contact) {
    const contact = normalizedResume.contact as Record<string, unknown>;
    // Remove empty strings
    Object.keys(contact).forEach((key) => {
      if (
        contact[key] === "" ||
        contact[key] === null ||
        contact[key] === undefined
      ) {
        delete contact[key];
      }
    });
    // Ensure name exists
    if (!contact.name) {
      contact.name = "Unknown";
    }
    // Clean up and validate URLs
    ["linkedin", "github", "website", "portfolio"].forEach((field) => {
      const value = contact[field];
      if (value && typeof value === "string") {
        const url = value.trim();

        // If it's just a username, profile name, or placeholder text, remove it
        if (!url.includes(".") || url.length < 10) {
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

  console.log(
    "Normalized tailored resume:",
    JSON.stringify(normalizedResume, null, 2).substring(0, 1000),
  );

  // Validate with Zod schema
  const result = TailoredResumeSchema.safeParse(normalizedResume);
  if (!result.success) {
    console.error(
      "Tailor validation error:",
      JSON.stringify(result.error.issues, null, 2),
    );
    throw new Error(
      `Failed to tailor resume: ${result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
    );
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
    "frontend": ["TypeScript, JavaScript (ES6+), React, Next.js, Angular, HTML5, CSS3, Tailwind CSS - frontend technologies"],
    "backend": ["Node.js, Python, FastAPI, RESTful API development - backend technologies"],
    "databases": ["PostgreSQL, Firebase Firestore, MongoDB - database technologies"],
    "infrastructure": ["Docker, GitHub Actions (CI/CD), Git - infrastructure and devops tools"],
    "security": ["RBAC, secure headers (CSP, HSTS), Google reCAPTCHA - security and web standards"],
    "concepts": ["Authentication flows, real-time systems, performance profiling - technical concepts"],
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
  const lines = resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const emailMatch = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = resumeText.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const linkedinMatch =
    resumeText.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i) ||
    resumeText.match(/linkedin\.com\/[^\s)]+/i);
  const githubMatch =
    resumeText.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i) ||
    resumeText.match(/github\.com\/[^\s)]+/i);

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
    model: "gpt-5.2",
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

export async function parseResumeText(
  resumeText: string,
): Promise<ParseResumeResult> {
  const fallbackContact = extractContactFallback(resumeText);
  const parsed = await parseChunkWithOpenAI(resumeText);

  console.log(
    "OpenAI resume parse response:",
    JSON.stringify(parsed).substring(0, 500),
  );

  // Validate and provide defaults for optional arrays
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
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
  normalizedResume.experience = normalizedResume.experience.map(
    (exp: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        company: exp.company || "Unknown Company",
        title: exp.title || "Unknown Title",
        location: normalizeLocation(exp.location),
        startDate: exp.startDate || "Unknown",
        highlights: exp.highlights || [],
      };
      // Only include endDate if it's a non-null string
      if (exp.endDate && typeof exp.endDate === "string") {
        result.endDate = exp.endDate;
      }
      return result;
    },
  );

  // Deduplicate identical experience entries (same company/title/highlights)
  const scoreExperience = (exp: Record<string, unknown>) => {
    const isKnown = (value?: unknown, unknownValue?: string) =>
      typeof value === "string" &&
      value.trim().length > 0 &&
      value !== unknownValue;
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
  normalizedResume.education = normalizedResume.education.map(
    (edu: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        institution: edu.institution || "Unknown Institution",
        degree: edu.degree || "Unknown Degree",
        field: edu.field,
        location: normalizeLocation(edu.location),
        gpa: typeof edu.gpa === "number" ? String(edu.gpa) : edu.gpa,
        highlights: edu.highlights,
      };
      // Only include dates if they're non-null strings
      if (edu.startDate && typeof edu.startDate === "string") {
        result.startDate = edu.startDate;
      }
      if (edu.endDate && typeof edu.endDate === "string") {
        result.endDate = edu.endDate;
      }
      if (result.gpa === null || result.gpa === "") {
        delete result.gpa;
      }
      return result;
    },
  );

  // Normalize projects to avoid nulls and invalid types
  normalizedResume.projects = (normalizedResume.projects || []).map(
    (proj: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        name:
          typeof proj.name === "string" && proj.name.trim().length > 0
            ? proj.name
            : "Untitled Project",
        description:
          typeof proj.description === "string" ? proj.description : undefined,
        url: proj.url,
        liveUrl: proj.liveUrl,
        liveText: typeof proj.liveText === "string" ? proj.liveText : undefined,
        githubUrl: proj.githubUrl,
        githubText: typeof proj.githubText === "string" ? proj.githubText : undefined,
        otherUrl: proj.otherUrl,
        otherText: typeof proj.otherText === "string" ? proj.otherText : undefined,
        technologies: normalizeStringArray(proj.technologies),
        highlights: normalizeStringArray(proj.highlights),
      };
      return result;
    },
  );

  // Clean up project URLs to avoid invalid URL validation errors
  normalizedResume.projects = (normalizedResume.projects || []).map(
    (proj: Record<string, unknown>) => {
      const result: Record<string, unknown> = { ...proj };

      // Migrate legacy url -> liveUrl for backward compatibility
      if (result.url && !result.liveUrl) {
        const legacyUrl = typeof result.url === "string" ? result.url.trim() : "";
        if (legacyUrl) {
          result.liveUrl = legacyUrl;
          if (!result.liveText) {
            result.liveText = stripUrlScheme(legacyUrl);
          }
        }
      }
      delete result.url;

      // Clean githubUrl
      if (result.githubUrl === null) {
        delete result.githubUrl;
      } else if (result.githubUrl && typeof result.githubUrl === "string") {
        const url = result.githubUrl.trim();
        if (!url) {
          delete result.githubUrl;
        } else {
          result.githubUrl = stripUrlScheme(url);
        }
      } else if (result.githubUrl) {
        delete result.githubUrl;
      }

      // Clean githubText
      if (result.githubText === null || (typeof result.githubText === "string" && !result.githubText.trim())) {
        delete result.githubText;
      }

      // Clean liveUrl
      if (result.liveUrl === null) {
        delete result.liveUrl;
      } else if (result.liveUrl && typeof result.liveUrl === "string") {
        const url = result.liveUrl.trim();
        if (!url) {
          delete result.liveUrl;
        } else {
          result.liveUrl = stripUrlScheme(url);
        }
      } else if (result.liveUrl) {
        delete result.liveUrl;
      }

      // Clean liveText
      if (result.liveText === null || (typeof result.liveText === "string" && !result.liveText.trim())) {
        delete result.liveText;
      }

      // Clean otherUrl
      if (result.otherUrl === null) {
        delete result.otherUrl;
      } else if (result.otherUrl && typeof result.otherUrl === "string") {
        const url = result.otherUrl.trim();
        if (!url) {
          delete result.otherUrl;
        } else {
          result.otherUrl = stripUrlScheme(url);
        }
      } else if (result.otherUrl) {
        delete result.otherUrl;
      }

      // Clean otherText
      if (result.otherText === null || (typeof result.otherText === "string" && !result.otherText.trim())) {
        delete result.otherText;
      }

      return result;
    },
  );

  // Ensure each project has 3-4 highlight bullets
  const ensureProjectHighlights = (proj: Record<string, unknown>) => {
    const highlights = normalizeStringArray(proj.highlights);
    const description =
      typeof proj.description === "string" ? proj.description : "";
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

  normalizedResume.projects = (normalizedResume.projects || []).map(
    (proj: Record<string, unknown>) => ({
      ...proj,
      highlights: ensureProjectHighlights(proj),
    }),
  );

  // Normalize skills arrays
  normalizedResume.skills = {
    ...normalizedResume.skills,
    technical: normalizeStringArray(normalizedResume.skills?.technical),
    frontend: normalizeStringArray(normalizedResume.skills?.frontend),
    backend: normalizeStringArray(normalizedResume.skills?.backend),
    databases: normalizeStringArray(normalizedResume.skills?.databases),
    infrastructure: normalizeStringArray(
      normalizedResume.skills?.infrastructure,
    ),
    security: normalizeStringArray(normalizedResume.skills?.security),
    concepts: normalizeStringArray(normalizedResume.skills?.concepts),
    frameworks: normalizeStringArray(normalizedResume.skills?.frameworks),
    tools: normalizeStringArray(normalizedResume.skills?.tools),
    languages: normalizeStringArray(normalizedResume.skills?.languages),
    soft: normalizeStringArray(normalizedResume.skills?.soft),
    other: normalizeStringArray(normalizedResume.skills?.other),
  };

  // Re-bucket ALL skills into 6 categories
  const frontendSet = new Set([
    "javascript",
    "typescript",
    "html",
    "css",
    "html5",
    "css3",
    "jsx",
    "react",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "svelte",
    "tailwind",
    "tailwind css",
    "redux",
    "es6",
    "es6+",
    "javascript (es6+)",
  ]);
  const backendSet = new Set([
    "node.js",
    "nodejs",
    "python",
    "fastapi",
    "django",
    "flask",
    "express",
    "nestjs",
    "spring",
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
    "restful api development",
    "restful apis",
    "api integrations",
  ]);
  const databaseSet = new Set([
    "postgresql",
    "firebase firestore",
    "firestore",
    "mongodb",
    "mysql",
    "redis",
    "sqlite",
    "dynamodb",
    "nosql",
  ]);
  const infraSet = new Set([
    "docker",
    "git",
    "github",
    "github actions",
    "github actions (ci/cd)",
    "ci/cd",
    "aws",
    "kubernetes",
    "terraform",
    "serverless",
    "firebase",
    "firebase admin sdk",
  ]);
  const securitySet = new Set([
    "rbac",
    "role-based access control",
    "role-based access control (rbac)",
    "csp",
    "hsts",
    "secure headers",
    "secure headers (csp, hsts)",
    "google recaptcha",
    "json-ld",
    "structured data",
    "structured data (json-ld)",
    "sitemap/robots configuration",
  ]);
  const conceptSet = new Set([
    "authentication flows",
    "real-time systems",
    "performance profiling",
    "api contract validation",
  ]);

  const bucketSkill = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key) return "other";
    if (frontendSet.has(key)) return "frontend";
    if (backendSet.has(key)) return "backend";
    if (databaseSet.has(key)) return "databases";
    if (infraSet.has(key)) return "infrastructure";
    if (securitySet.has(key)) return "security";
    if (conceptSet.has(key)) return "concepts";
    return "other";
  };

  // Collect ALL skills from every source and re-bucket
  const allSkillItems = [
    ...(normalizedResume.skills.frontend || []),
    ...(normalizedResume.skills.backend || []),
    ...(normalizedResume.skills.databases || []),
    ...(normalizedResume.skills.infrastructure || []),
    ...(normalizedResume.skills.security || []),
    ...(normalizedResume.skills.concepts || []),
    ...(normalizedResume.skills.frameworks || []),
    ...(normalizedResume.skills.tools || []),
    ...(normalizedResume.skills.languages || []),
    ...(normalizedResume.skills.technical || []),
    ...(normalizedResume.skills.other || []),
  ];

  const nextFrontend = new Set<string>();
  const nextBackend = new Set<string>();
  const nextDatabases = new Set<string>();
  const nextInfra = new Set<string>();
  const nextSecurity = new Set<string>();
  const nextConcepts = new Set<string>();
  const nextOther = new Set<string>();

  allSkillItems.forEach((item) => {
    const bucket = bucketSkill(item);
    if (bucket === "frontend") nextFrontend.add(item);
    else if (bucket === "backend") nextBackend.add(item);
    else if (bucket === "databases") nextDatabases.add(item);
    else if (bucket === "infrastructure") nextInfra.add(item);
    else if (bucket === "security") nextSecurity.add(item);
    else if (bucket === "concepts") nextConcepts.add(item);
    else nextOther.add(item);
  });

  normalizedResume.skills.frontend = Array.from(nextFrontend);
  normalizedResume.skills.backend = Array.from(nextBackend);
  normalizedResume.skills.databases = Array.from(nextDatabases);
  normalizedResume.skills.infrastructure = Array.from(nextInfra);
  normalizedResume.skills.security = Array.from(nextSecurity);
  normalizedResume.skills.concepts = Array.from(nextConcepts);
  normalizedResume.skills.other = Array.from(nextOther);
  normalizedResume.skills.frameworks = [];
  normalizedResume.skills.tools = [];
  normalizedResume.skills.technical = [];
  normalizedResume.skills.languages = [];

  // Include default frontend skills
  const defaultFrontend = [
    "TypeScript",
    "JavaScript (ES6+)",
    "React",
    "Next.js",
    "Angular",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
  ];
  defaultFrontend.forEach((skill) => {
    if (
      !normalizedResume.skills.frontend.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.frontend.push(skill);
    }
  });

  // Include default backend skills
  const defaultBackend = [
    "Node.js",
    "Python",
    "FastAPI",
    "RESTful API development",
  ];
  defaultBackend.forEach((skill) => {
    if (
      !normalizedResume.skills.backend.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.backend.push(skill);
    }
  });

  // Include default database skills
  const defaultDatabases = ["PostgreSQL", "Firebase Firestore"];
  defaultDatabases.forEach((skill) => {
    if (
      !normalizedResume.skills.databases.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.databases.push(skill);
    }
  });

  // Include default infrastructure skills
  const defaultInfra = ["Docker", "GitHub Actions (CI/CD)", "Git"];
  defaultInfra.forEach((skill) => {
    if (
      !normalizedResume.skills.infrastructure.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.infrastructure.push(skill);
    }
  });

  // Include default security skills
  const defaultSecurity = [
    "Role-based access control (RBAC)",
    "Secure headers (CSP, HSTS)",
    "Google reCAPTCHA",
    "Structured data (JSON-LD)",
    "Sitemap/robots configuration",
  ];
  defaultSecurity.forEach((skill) => {
    if (
      !normalizedResume.skills.security.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.security.push(skill);
    }
  });

  // Include default concepts
  const defaultConcepts = [
    "Authentication flows",
    "Real-time systems",
    "Performance profiling",
    "API contract validation",
  ];
  defaultConcepts.forEach((skill) => {
    if (
      !normalizedResume.skills.concepts.some(
        (s: string) => s.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      normalizedResume.skills.concepts.push(skill);
    }
  });

  // Drop nulls/empty strings throughout
  const pruned = pruneNulls(normalizedResume) as typeof normalizedResume;

  // Re-assign after pruning
  Object.assign(normalizedResume, pruned);

  console.log(
    "Normalized resume:",
    JSON.stringify(normalizedResume, null, 2).substring(0, 1000),
  );

  // Clean up contact - remove empty strings and invalid URLs
  if (normalizedResume.contact) {
    const contact = normalizedResume.contact as Record<string, unknown>;
    // Remove empty strings
    Object.keys(contact).forEach((key) => {
      if (
        contact[key] === "" ||
        contact[key] === null ||
        contact[key] === undefined
      ) {
        delete contact[key];
      }
    });
    // Clean up and validate URLs
    ["linkedin", "github", "website", "portfolio"].forEach((field) => {
      const value = contact[field];
      if (value && typeof value === "string") {
        const url = value.trim();

        // If it's just a username, profile name, or placeholder text, remove it
        if (!url.includes(".") || url.length < 10) {
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
  const hasContact = Boolean(
    normalizedResume.contact &&
    normalizedResume.contact.name &&
    normalizedResume.contact.name !== "Unknown",
  );
  const hasSummary = Boolean(
    normalizedResume.summary &&
    String(normalizedResume.summary).trim().length > 0,
  );
  const hasExperience =
    Array.isArray(normalizedResume.experience) &&
    normalizedResume.experience.length > 0;
  const hasEducation =
    Array.isArray(normalizedResume.education) &&
    normalizedResume.education.length > 0;
  const hasSkills = Boolean(
    normalizedResume.skills &&
    Object.values(normalizedResume.skills).some(
      (val) => Array.isArray(val) && val.length > 0,
    ),
  );
  const hasProjects =
    Array.isArray(normalizedResume.projects) &&
    normalizedResume.projects.length > 0;
  const hasCertifications =
    Array.isArray(normalizedResume.certifications) &&
    normalizedResume.certifications.length > 0;

  const shouldKeepWarning = (warning: string) => {
    const normalized = warning.toLowerCase();
    if (hasContact && normalized.includes("no contact")) return false;
    if (hasSummary && normalized.includes("no summary")) return false;
    if (hasExperience && normalized.includes("no work experience"))
      return false;
    if (hasEducation && normalized.includes("no education")) return false;
    if (hasSkills && normalized.includes("no skills")) return false;
    if (hasProjects && normalized.includes("no projects")) return false;
    if (hasCertifications && normalized.includes("no certifications"))
      return false;
    if (
      (hasSummary ||
        hasExperience ||
        hasEducation ||
        hasSkills ||
        hasProjects ||
        hasCertifications) &&
      normalized.includes("only contact")
    ) {
      return false;
    }
    if (hasContact && normalized.includes("name not found")) return false;
    if (
      normalized.includes("no explicit") &&
      (hasSkills || hasProjects || hasExperience || hasEducation)
    ) {
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
  if (
    !normalizedResume.experience ||
    normalizedResume.experience.length === 0
  ) {
    warnings.push(
      "No work experience found - add it in the editor if applicable",
    );
    needsReview = true;
  }
  if (!normalizedResume.education || normalizedResume.education.length === 0) {
    warnings.push("No education found - add it in the editor if applicable");
    needsReview = true;
  }
  if (
    normalizedResume.experience?.some(
      (e: Record<string, unknown>) =>
        e.company === "Unknown Company" || e.title === "Unknown Title",
    )
  ) {
    warnings.push(
      "Some job entries may be missing company or title information",
    );
    needsReview = true;
  }
  if (
    normalizedResume.education?.some(
      (e: Record<string, unknown>) =>
        e.institution === "Unknown Institution" ||
        e.degree === "Unknown Degree",
    )
  ) {
    warnings.push(
      "Some education entries may be missing institution or degree information",
    );
    needsReview = true;
  }

  // Validate against schema - but be lenient
  const result = ParsedResumeSchema.safeParse(normalizedResume);
  if (!result.success) {
    console.error(
      "Resume parsing validation error:",
      JSON.stringify(result.error.issues, null, 2),
    );
    // Instead of throwing, try to fix the issues and continue
    result.error.issues.forEach((issue) => {
      warnings.push(
        `Parsing issue: ${issue.path.join(".")} - ${issue.message}`,
      );
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

export async function extractJobDescription(
  jdText: string,
): Promise<ExtractedJobDescription> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
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

const COVER_LETTER_PROMPT = `You are a professional career coach and writer. Write a concise cover letter using the resume data provided.

RULES:
- Keep it to 3-5 short paragraphs.
- Use a professional but warm tone.
- Do NOT invent experience, employers, or qualifications.
- When a job description is provided, tailor the letter to align with it and the candidate's real experience.
- When no job description is provided, write a general cover letter that highlights the candidate's key strengths, skills, and experience from their resume.
- Avoid clichés and overly flowery language.
- Output ONLY valid JSON with the schema below.

OUTPUT SCHEMA:
{
  "coverLetter": "string"
}
`;

export async function generateCoverLetter(
  tailoredResume: TailoredResume,
  jobDescription: string,
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: COVER_LETTER_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          resume: tailoredResume,
          jobDescription:
            jobDescription ||
            "(No specific job description - write a general cover letter highlighting the candidate's strengths and experience.)",
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
