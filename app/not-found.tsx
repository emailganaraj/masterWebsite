import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-zinc-900">404</h1>
      <p className="mt-3 text-zinc-600">This page could not be found.</p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        Back to homepage
      </Link>
    </div>
  );
}
