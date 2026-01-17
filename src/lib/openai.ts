import OpenAI from "openai";
import { TailoredResume, TailoredResumeSchema, ParsedResume, ParsedResumeSchema, ExtractedJobDescription } from "@/types/resume";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TAILORING_SYSTEM_PROMPT = `You are an elite professional resume writer with decades of experience crafting resumes that get candidates hired at top companies. Your job is to SIGNIFICANTLY REWRITE and tailor a resume to match a specific job description.

CRITICAL RULES:
1. NEVER invent new employers, job titles, degrees, or certifications that are not in the original resume.
2. NEVER fabricate experience or qualifications.

WRITING STYLE - SOUND HUMAN, NOT AI:
- Write in natural, professional language that real humans use - NOT robotic AI-generated text
- Vary sentence structure and length naturally
- Use industry-appropriate terminology without being overly formal
- Avoid buzzwords and clichés like "leverage", "synergy", "cutting-edge", "spearheaded"
- Write like a confident professional describing their accomplishments, not a marketing brochure

ACHIEVEMENT ARCHITECTURE - Structure every bullet point using this formula:
- **Result + Metric + Context** format:
  * RESULT: What changed or improved because of your work
  * METRIC: Specific numbers that prove the impact (%, $, time saved, users, etc.)
  * CONTEXT: Brief explanation of how you achieved it and what you did
- Example: "Reduced page load time by 40% (from 3.2s to 1.9s) by implementing lazy loading and optimizing database queries"

BULLET POINT RULES:
- Keep each position to a MAXIMUM of 4 bullet points - quality over quantity
- The FIRST bullet point of each position MUST include a quantifiable metric
- Subsequent bullets can omit metrics if they don't add value or if the achievement doesn't lend itself to quantification
- Focus on the MOST RELEVANT achievements that align with the target job description
- Keep bullets brief and impactful - 1-2 lines max, no fluff
- Use strong action verbs: Delivered, Engineered, Transformed, Accelerated, Optimized, Architected
- Prioritize business impact and outcomes over task descriptions

SUMMARY WRITING:
- Write a brief, impactful summary of MAXIMUM 2-4 sentences (no more than 4 sentences)
- Lead with years of experience and core expertise area
- Highlight 2-3 key accomplishments or specializations relevant to the target role
- Sound confident and accomplished, not desperate or generic
- Keep it concise - recruiters spend only seconds scanning summaries

KEYWORD INTEGRATION:
- The user has pre-selected specific keywords in "selectedKeywords" that MUST ALL appear in the final resume
- Weave keywords naturally into context - don't just list them
- Every selectedKeyword MUST appear somewhere: summary, experience bullets, or skills section

SKILLS SECTION RULES:
- The skills section displays as a SINGLE comma-separated list of technical keywords
- Put ALL technical skills (programming languages, frameworks, tools, technologies) into skills.technical, skills.frameworks, skills.tools, or skills.languages
- DO NOT include soft skills (like "communication", "leadership", "teamwork", "problem-solving", "collaboration") in the skills section
- SOFT SKILLS should be naturally woven into the summary and experience bullet points instead
- Example: Instead of listing "leadership" as a skill, write a bullet like "Led a team of 5 engineers to deliver..."
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
  "projects": [{ "name": "string", "description": "string", "technologies": ["tech"] }],
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
        location: exp.location,
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
        location: edu.location,
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
    
    // Add missing keywords to skills.other
    if (missingFromResume.length > 0) {
      console.log("Adding missing selectedKeywords to skills.other:", missingFromResume);
      const skills = normalizedResume.skills as Record<string, string[] | undefined>;
      skills.other = [...(skills.other || []), ...missingFromResume];
      // Remove duplicates
      skills.other = [...new Set(skills.other)];
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
        
        // Add https:// if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        // Validate it's a proper URL
        try {
          new URL(url);
          contact[field] = url;
        } catch {
          // Invalid URL, remove the field
          delete contact[field];
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

export async function parseResumeText(resumeText: string): Promise<ParseResumeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: PARSE_RESUME_PROMPT,
      },
      {
        role: "user",
        content: resumeText,
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

  console.log("OpenAI resume parse response:", content.substring(0, 500));
  
  const parsed = JSON.parse(content);
  
  // Validate and provide defaults for optional arrays
  const normalizedResume = {
    ...parsed,
    contact: parsed.contact || { name: "Unknown" },
    experience: parsed.experience || [],
    education: parsed.education || [],
    skills: parsed.skills || {},
    projects: parsed.projects || [],
    certifications: parsed.certifications || [],
  };
  
  // Ensure contact.name exists
  if (!normalizedResume.contact.name) {
    normalizedResume.contact.name = "Unknown";
  }
  
  // Ensure experience entries have required fields and convert null to undefined
  normalizedResume.experience = normalizedResume.experience.map((exp: Record<string, unknown>) => {
    const result: Record<string, unknown> = {
      company: exp.company || "Unknown Company",
      title: exp.title || "Unknown Title",
      location: exp.location,
      startDate: exp.startDate || "Unknown",
      highlights: exp.highlights || [],
    };
    // Only include endDate if it's a non-null string
    if (exp.endDate && typeof exp.endDate === 'string') {
      result.endDate = exp.endDate;
    }
    return result;
  });
  
  // Ensure education entries have required fields and convert null to undefined
  normalizedResume.education = normalizedResume.education.map((edu: Record<string, unknown>) => {
    const result: Record<string, unknown> = {
      institution: edu.institution || "Unknown Institution",
      degree: edu.degree || "Unknown Degree",
      field: edu.field,
      location: edu.location,
      gpa: edu.gpa,
      highlights: edu.highlights,
    };
    // Only include dates if they're non-null strings
    if (edu.startDate && typeof edu.startDate === 'string') {
      result.startDate = edu.startDate;
    }
    if (edu.endDate && typeof edu.endDate === 'string') {
      result.endDate = edu.endDate;
    }
    return result;
  });
  
  // Clean up project URLs to avoid invalid URL validation errors
  normalizedResume.projects = (normalizedResume.projects || []).map((proj: Record<string, unknown>) => {
    const result: Record<string, unknown> = { ...proj };
    if (result.url && typeof result.url === "string") {
      let url = result.url.trim();
      
      // If it's just a placeholder or too short, drop it
      if (!url.includes(".") || url.length < 10) {
        delete result.url;
        return result;
      }
      
      // Add https:// if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      
      // Validate URL
      try {
        new URL(url);
        result.url = url;
      } catch {
        delete result.url;
      }
    } else if (result.url) {
      delete result.url;
    }
    return result;
  });
  
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
        
        // Add https:// if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        // Validate it's a proper URL
        try {
          new URL(url);
          contact[field] = url;
        } catch {
          // Invalid URL, remove the field
          delete contact[field];
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
  const warnings: string[] = [...parseWarnings];
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
