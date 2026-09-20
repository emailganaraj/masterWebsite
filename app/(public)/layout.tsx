import Link from "next/link";
import { listCategoriesForNav } from "@/lib/queries/taxonomy";
import { getPublicSiteSettings } from "@/lib/queries/site";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navCategories] = await Promise.all([
    getPublicSiteSettings(),
    listCategoriesForNav(),
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {settings.siteName}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navCategories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="hover:text-blue-600">
                {cat.name}
              </Link>
            ))}
            <Link href="/latest" className="hover:text-blue-600">
              Latest
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-sm text-zinc-600">{settings.siteDescription}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
