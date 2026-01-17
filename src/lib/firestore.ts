import { User } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DesignOptions, ParsedResume, TailoredResume, TemplateSlug } from "@/types/resume";

export async function upsertUserProfile(user: User, fullName?: string) {
  const name = fullName || user.displayName || "";
  const createdAt =
    user.metadata?.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp();
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email || "",
      name,
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp(),
      createdAt,
    },
    { merge: true }
  );
}

type SaveGenerationInput = {
  userId: string;
  parsedResume: ParsedResume;
  tailoredResume: TailoredResume;
  jobDescription: string;
  templateSlug: TemplateSlug;
  accentColor?: string;
  designOptions?: DesignOptions;
  matchedKeywords?: string[];
  missingKeywords?: string[];
};

export async function saveGeneration(input: SaveGenerationInput) {
  const generationsRef = collection(db, "generations");
  return addDoc(generationsRef, {
    userId: input.userId,
    parsedResume: input.parsedResume,
    tailoredResume: input.tailoredResume,
    jobDescription: input.jobDescription,
    templateSlug: input.templateSlug,
    accentColor: input.accentColor || "",
    designOptions: input.designOptions || null,
    matchedKeywords: input.matchedKeywords || [],
    missingKeywords: input.missingKeywords || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
