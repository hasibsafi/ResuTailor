"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button>Sign In</Button>
      </Link>
    );
  }

  return (
    <Button variant="outline" onClick={signOut}>
      Sign Out
    </Button>
  );
}
