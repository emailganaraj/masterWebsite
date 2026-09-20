import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "My Article Website";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-16 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Phase 1 — Foundation Ready
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          {siteName}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-blue-100">
          Database-driven, SEO-first publishing platform. Public article pages,
          CMS, and monetization arrive in upcoming phases.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/admin">Open Admin</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Link href="/api/health">Health Check</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { title: "Latest", href: "/latest", desc: "Most recently published articles" },
          { title: "Trending", href: "/trending", desc: "Stories gaining momentum now" },
          { title: "Popular", href: "/popular", desc: "All-time reader favorites" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{item.desc}</p>
            <p className="mt-4 text-sm font-medium text-blue-600">Coming in Phase 3 →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
