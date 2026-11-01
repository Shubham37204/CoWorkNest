// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { toast } from "sonner";
// import { AuthApiError, logoutUser } from "@/lib/api/auth";

// export default function Navbar() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   async function handleLogout() {
//     if (loading) return;
//     setLoading(true);

//     try {
//       await logoutUser();
//       toast.success("Logged out");
//       router.replace("/login");
//       router.refresh();
//     } catch (error) {
//       console.error("Logout error:", error);
//       if (error instanceof AuthApiError && error.status === 0) {
//         toast.error("Cannot reach the server");
//       } else if (error instanceof AuthApiError && error.status === 403) {
//         toast.error("Security validation failed. Please try again.");
//       } else {
//         toast.error("Unable to log out. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <nav className="flex items-center justify-between border-b px-6 py-4">
//       <Link href="/dashboard" className="text-xl font-bold">
//         CollabSpace
//       </Link>

//       <button
//         onClick={handleLogout}
//         disabled={loading}
//         className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
//       >
//         {loading ? "Logging out..." : "Logout"}
//       </button>
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/api/auth";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";

export default function Navbar() {
  const router = useRouter();
  const handleError = useApiErrorHandler();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    try {
      await logoutUser();
      toast.success("Logged out");
      router.replace("/login");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/dashboard" className="text-xl font-bold">
        CollabSpace
      </Link>

      <Button onClick={handleLogout} disabled={loading}>
        {loading ? "Logging out..." : "Logout"}
      </Button>
    </nav>
  );
}
