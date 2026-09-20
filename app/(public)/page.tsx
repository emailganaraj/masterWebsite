import type { Metadata } from "next";
import { HomepageSections } from "@/components/public/homepage-sections";
import { JsonLd } from "@/components/public/json-ld";
import { getHomepageSections } from "@/lib/queries/homepage";
import { getPublicSiteSettings } from "@/lib/queries/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { websiteJsonLd } from "@/lib/seo/json-ld";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildPageMetadata({
    title: settings.defaultSeoTitle,
    description: settings.defaultSeoDescription || settings.siteDescription,
    canonicalPath: "/",
  });
}

export default async function HomePage() {
  const [settings, sections] = await Promise.all([
    getPublicSiteSettings(),
    getHomepageSections(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd
        data={websiteJsonLd(settings.siteName, settings.siteDescription)}
      />
      <HomepageSections sections={sections} />
    </div>
  );
}
