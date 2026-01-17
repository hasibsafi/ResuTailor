"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense, useEffect, useState } from "react";

function AuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "That email or password didn’t match. Please try again.";
    case "auth/user-not-found":
      return "We couldn’t find an account with that email.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Your password is too weak. Please use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was canceled. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function LoginContent() {
  const { user, loading, signInWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/generate";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextUrl);
    }
  }, [loading, user, router, nextUrl]);

  const handleEmailAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(AuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to ResuTailor</h1>
          <p className="text-gray-600 mt-2">Access resume tailoring and exports.</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button
            className="w-full"
            onClick={handleEmailAuth}
            disabled={loading || submitting}
          >
            Sign in with email
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <Link href="/" className="hover:text-gray-700">
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="p-8 w-full max-w-md">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
          </Card>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
