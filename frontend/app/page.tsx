import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CollabSpace</h1>
      <p className="text-gray-600">Write and collaborate on documents in real time.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white">
          Log in
        </Link>
        <Link href="/register" className="rounded-md border px-4 py-2">
          Create account
        </Link>
      </div>
    </main>
  );
}
