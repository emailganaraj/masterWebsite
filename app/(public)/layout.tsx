import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "My Article Website";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {siteName}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/latest" className="hover:text-blue-600">Latest</Link>
            <Link href="/trending" className="hover:text-blue-600">Trending</Link>
            <Link href="/popular" className="hover:text-blue-600">Popular</Link>
            <Link href="/search" className="hover:text-blue-600">Search</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-8 text-sm text-zinc-600">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </footer>
    </div>
  );
}
