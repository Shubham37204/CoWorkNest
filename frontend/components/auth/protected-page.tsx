"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthApiError,
  getCurrentUser,
  type UserResponse,
} from "@/lib/api/auth";

type ProtectedPageProps = {
  children: React.ReactNode;
};

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  function retry() {
    setLoading(true);
    setError(false);
    setAttempt((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          setError(false);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof AuthApiError && err.status === 401) {
          router.replace("/login");
        } else {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  if (loading) {
    return <p className="p-6">Checking your session...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p>Could not verify your session. Please try again.</p>

        <button
          type="button"
          onClick={retry}
          className="mt-3 rounded bg-black px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
