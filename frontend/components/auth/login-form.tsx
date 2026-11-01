// "use client";

// import { useState, type FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { toast } from "sonner";
// import { AuthApiError, loginUser } from "@/lib/api/auth";

// export default function LoginForm() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (loading) return;

//     setLoading(true);

//     try {
//       const user = await loginUser({ email, password });

//       toast.success(`Logged in as ${user.displayName}`);
//       router.replace("/dashboard");
//       router.refresh();
//     } catch (error) {
//       if (error instanceof AuthApiError) {
//         switch (error.status) {
//           case 0:
//             toast.error(
//               error.code === "TIMEOUT"
//                 ? "The server took too long to respond"
//                 : "Cannot reach the server",
//             );
//             break;

//           case 400:
//             toast.error("Please check the details you entered");
//             break;

//           case 401:
//             toast.error("Invalid email or password");
//             break;

//           case 403:
//             toast.error("Security validation failed. Please try again.");
//             break;

//           case 429:
//             toast.error("Too many attempts. Try again later");
//             break;

//           default:
//             if (error.status && error.status >= 500) {
//               toast.error("Server error. Try again later");
//             } else {
//               toast.error(error.message);
//             }
//         }
//       } else {
//         console.error("Login error:", error);
//         toast.error("Something went wrong. Please try again.");
//       }
//     }finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm"
//       >
//         <div className="space-y-1">
//           <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
//           <p className="text-sm text-gray-500">
//             Welcome back to CollabSpace.
//           </p>
//         </div>

//         <div className="space-y-1">
//           <label htmlFor="email" className="text-sm font-medium">
//             Email
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             maxLength={255}
//             value={email}
//             onChange={(event) => setEmail(event.target.value)}
//             placeholder="you@example.com"
//             required
//             disabled={loading}
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
//           />
//         </div>

//         <div className="space-y-1">
//           <label htmlFor="password" className="text-sm font-medium">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             autoComplete="current-password"
//             maxLength={72}
//             value={password}
//             onChange={(event) => setPassword(event.target.value)}
//             placeholder="Your password"
//             required
//             disabled={loading}
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full rounded-md bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {loading ? "Logging in..." : "Log in"}
//         </button>

//         <p className="text-center text-sm text-gray-600">
//           New to CollabSpace?{" "}
//           <Link
//             href="/register"
//             className="font-medium text-black underline underline-offset-4"
//           >
//             Create account
//           </Link>
//         </p>
//       </form>
//     </main>
//   );
// }

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/lib/api/auth";
import { toUserMessage } from "@/lib/api/errors";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      toast.success(`Logged in as ${user.displayName}`);
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(toUserMessage(error, { 401: "Invalid email or password" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Log in" description="Welcome back to CollabSpace.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          maxLength={255}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          maxLength={72}
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to CollabSpace?{" "}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          Create account
        </Link>
      </p>
    </AuthCard>
  );
}
