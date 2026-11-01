// "use client";

// import { useState, type FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { toast } from "sonner";
// import { AuthApiError, registerUser } from "@/lib/api/auth";

// export default function RegisterForm() {
//   const router = useRouter();

//   const [displayName, setDisplayName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (loading) return;

//     if (!displayName.trim()) {
//       toast.error("Please enter your display name");
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     setLoading(true);

//     try {
//       await registerUser({
//         displayName,
//         email,
//         password,
//       });

//       toast.success("Account created. Please log in.");
//       router.push("/login");
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

//           case 403:
//             toast.error("Security validation failed. Please try again.");
//             break;

//           case 409:
//             toast.error("This email is already registered");
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
//         console.error("Registration error:", error);
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
//           <h1 className="text-2xl font-bold tracking-tight">Create account</h1>

//           <p className="text-sm text-gray-500">
//             Create your CollabSpace account to get started.
//           </p>
//         </div>

//         <div className="space-y-1">
//           <label htmlFor="displayName" className="text-sm font-medium">
//             Display name
//           </label>

//           <input
//             id="displayName"
//             name="displayName"
//             type="text"
//             autoComplete="name"
//             maxLength={100}
//             value={displayName}
//             onChange={(event) => setDisplayName(event.target.value)}
//             placeholder="Your name"
//             required
//             disabled={loading}
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
//           />
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
//             autoComplete="new-password"
//             minLength={8}
//             maxLength={72}
//             value={password}
//             onChange={(event) => setPassword(event.target.value)}
//             placeholder="Create a password"
//             required
//             disabled={loading}
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
//           />
//         </div>

//         <div className="space-y-1">
//           <label htmlFor="confirmPassword" className="text-sm font-medium">
//             Confirm password
//           </label>

//           <input
//             id="confirmPassword"
//             name="confirmPassword"
//             type="password"
//             autoComplete="new-password"
//             minLength={8}
//             maxLength={72}
//             value={confirmPassword}
//             onChange={(event) => setConfirmPassword(event.target.value)}
//             placeholder="Enter password again"
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
//           {loading ? "Creating account..." : "Create account"}
//         </button>

//         <p className="text-center text-sm text-gray-600">
//           Already have an account?{" "}
//           <Link
//             href="/login"
//             className="font-medium text-black underline underline-offset-4"
//           >
//             Log in
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
import { registerUser } from "@/lib/api/auth";
import { toUserMessage } from "@/lib/api/errors";

export default function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!displayName.trim()) {
      toast.error("Please enter your display name");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ displayName, email, password });
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        toUserMessage(error, { 409: "This email is already registered" }),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      description="Create your CollabSpace account to get started."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="displayName"
          label="Display name"
          autoComplete="name"
          maxLength={100}
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={loading}
        />
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
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          placeholder="Enter password again"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
