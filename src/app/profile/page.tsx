"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { DEFAULT_DESIGN_OPTIONS, TemplateSlug } from "@/types/resume";

type ResumeHistoryItem = {
  id: string;
  generationId: string;
  createdAt?: Timestamp;
  template?: TemplateSlug;
  accentColor?: string;
  designOptions?: typeof DEFAULT_DESIGN_OPTIONS;
  tailoredResume?: Record<string, unknown>;
};

function formatDate(date?: Date) {
  if (!date) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateForFile(date?: Date) {
  if (!date) return "unknown-date";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFriendlyAccountError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/requires-recent-login":
      return "Please sign in again before deleting your account.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const historyRef = collection(db, "users", user.uid, "resumeHistory");
        const historyQuery = query(historyRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(historyQuery);
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ResumeHistoryItem, "id">),
        }));
        setHistory(items);
      } catch (err) {
        console.error("Failed to load resume history:", err);
        setError("We couldn’t load your resume history. Please try again.");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [user]);

  const profileName = useMemo(() => {
    if (!user) return "User";
    return user.displayName || user.email || "User";
  }, [user]);

  const handleDownload = async (item: ResumeHistoryItem) => {
    if (!item.tailoredResume) {
      setError("This resume is missing data and can’t be downloaded.");
      return;
    }
    setExportingId(item.id);
    setError(null);
    try {
      const createdAt = item.createdAt?.toDate();
      const fileName = `Tailored-Resume-${formatDateForFile(createdAt)}.pdf`;
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: item.tailoredResume,
          designOptions: item.designOptions || DEFAULT_DESIGN_OPTIONS,
          template: item.template || "classic-ats",
          accentColor: item.accentColor || "purple",
          fileName,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
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
      console.error("Download error:", err);
      setError("We couldn’t download this resume. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "This will permanently delete your account and resume history. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const historyRef = collection(db, "users", user.uid, "resumeHistory");
      const snapshot = await getDocs(historyRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      batch.delete(doc(db, "users", user.uid));
      await batch.commit();

      await deleteUser(user);
    } catch (err) {
      console.error("Delete account error:", err);
      setError(getFriendlyAccountError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account and resume history.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/generate">
                <Button variant="outline">Back to Generate</Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                Log Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Info</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium text-gray-800">Name:</span>{" "}
                {user?.displayName || "Not provided"}
              </div>
              <div>
                <span className="font-medium text-gray-800">Email:</span>{" "}
                {user?.email || "Not provided"}
              </div>
              <div>
                <span className="font-medium text-gray-800">UID:</span> {user?.uid}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Resume History</h2>
              <span className="text-sm text-gray-500">{history.length} total</span>
            </div>

            {loadingHistory ? (
              <div className="text-gray-500">Loading your history...</div>
            ) : history.length === 0 ? (
              <div className="text-gray-500">
                No resumes yet. Generate your first tailored resume.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        Tailored Resume — {formatDate(item.createdAt?.toDate())}
                      </div>
                      <div className="text-sm text-gray-500">
                        Template: {item.template || "classic-ats"}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(item)}
                      disabled={exportingId === item.id}
                    >
                      {exportingId === item.id ? "Preparing..." : "Download"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-700 mb-4">
              Deleting your account will remove all your data and resume history.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
