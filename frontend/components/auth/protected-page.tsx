// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   AuthApiError,
//   getCurrentUser,
//   type UserResponse,
// } from "@/lib/api/auth";

// type ProtectedPageProps = {
//   children: React.ReactNode;
// };

// export default function ProtectedPage({ children }: ProtectedPageProps) {
//   const router = useRouter();

//   const [user, setUser] = useState<UserResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [attempt, setAttempt] = useState(0);

//   function retry() {
//     setLoading(true);
//     setError(false);
//     setAttempt((n) => n + 1);
//   }

//   useEffect(() => {
//     let cancelled = false;

//     async function verifySession() {
//       try {
//         const currentUser = await getCurrentUser();

//         if (!cancelled) {
//           setUser(currentUser);
//           setError(false);
//         }
//       } catch (err) {
//         if (cancelled) return;

//         if (err instanceof AuthApiError && err.status === 401) {
//           router.replace("/login");
//         } else {
//           setError(true);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void verifySession();

//     return () => {
//       cancelled = true;
//     };
//   }, [router, attempt]);

//   if (loading) {
//     return <p className="p-6">Checking your session...</p>;
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <p>Could not verify your session. Please try again.</p>

//         <button
//           type="button"
//           onClick={retry}
//           className="mt-3 rounded bg-black px-4 py-2 text-white"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   return <>{children}</>;
// }


"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/types/auth";

type State =
  | { status: "checking" }
  | { status: "error" }
  | { status: "authenticated"; user: User };

export default function ProtectedPage({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then((user) => setState({ status: "authenticated", user }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [router, attempt]);

  if (state.status === "checking") {
    return (
      <p className="p-6 text-muted-foreground" aria-live="polite">
        Checking your session...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3 p-6">
        <p>Could not verify your session. Please try again.</p>
        <Button
          variant="outline"
          onClick={() => {
            setState({ status: "checking" });
            setAttempt((n) => n + 1);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
