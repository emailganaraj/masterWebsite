/**
 * Database seed script — run after migrations:
 *   npm run db:seed
 */
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { closeDb, db } from "../lib/db";
import {
  adSlots,
  categories,
  homepageSections,
  pages,
  roles,
  siteSettings,
  userRoles,
  users,
} from "../lib/db/schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@myarticlewebsite.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "AdminPass123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Super Admin";

async function seedRoles() {
  const roleDefs = [
    { name: "SUPER_ADMIN" as const, description: "Full platform access" },
    { name: "EDITOR" as const, description: "Content management and publishing" },
    { name: "AUTHOR" as const, description: "Own articles only" },
    { name: "ANALYST" as const, description: "Analytics read-only" },
  ];

  for (const role of roleDefs) {
    await db.insert(roles).values(role).onConflictDoNothing({ target: roles.name });
  }
  console.log("✓ Roles seeded");
}

async function seedAdminUser() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
    return existing.id;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  });

  if (!result?.user?.id) {
    throw new Error("Failed to create admin user");
  }

  const userId = result.user.id;

  await db.update(users).set({ role: "SUPER_ADMIN" }).where(eq(users.id, userId));

  const superAdminRole = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "SUPER_ADMIN"))
    .limit(1);

  if (superAdminRole[0]) {
    await db
      .insert(userRoles)
      .values({ userId, roleId: superAdminRole[0].id })
      .onConflictDoNothing();
  }

  console.log(`✓ Super admin created: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD} (change in production)`);
  return userId;
}

async function seedCategories() {
  for (const cat of [
    { name: "Entertainment", slug: "entertainment", sortOrder: 1 },
    { name: "Sports", slug: "sports", sortOrder: 2 },
    { name: "Comedy", slug: "comedy", sortOrder: 3 },
    { name: "Technology", slug: "technology", sortOrder: 4 },
  ]) {
    await db.insert(categories).values(cat).onConflictDoNothing({ target: categories.slug });
  }

  const [entertainment] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, "entertainment"))
    .limit(1);

  if (entertainment) {
    for (const sub of [
      { name: "Movies", slug: "movies", parentId: entertainment.id, sortOrder: 1 },
      { name: "Music", slug: "music", parentId: entertainment.id, sortOrder: 2 },
      { name: "Celebrity", slug: "celebrity", parentId: entertainment.id, sortOrder: 3 },
    ]) {
      await db.insert(categories).values(sub).onConflictDoNothing({ target: categories.slug });
    }
  }
  console.log("✓ Categories seeded");
}

async function seedAdSlots() {
  for (const placement of [
    "header",
    "article_top",
    "article_middle",
    "article_bottom",
    "sidebar",
    "mobile_sticky",
  ]) {
    await db
      .insert(adSlots)
      .values({ placement, enabled: false, type: "adsense", config: {} })
      .onConflictDoNothing({ target: adSlots.placement });
  }
  console.log("✓ Ad slots seeded");
}

async function seedHomepageSections() {
  const existing = await db.select({ id: homepageSections.id }).from(homepageSections).limit(1);
  if (existing.length > 0) {
    console.log("✓ Homepage sections already seeded");
    return;
  }

  for (const section of [
    { type: "hero" as const, title: "Hero Story", sortOrder: 1 },
    { type: "trending" as const, title: "Trending", sortOrder: 2 },
    { type: "latest" as const, title: "Latest", sortOrder: 3 },
    { type: "popular" as const, title: "Popular", sortOrder: 4 },
    { type: "editors_picks" as const, title: "Editor's Picks", sortOrder: 5 },
  ]) {
    await db.insert(homepageSections).values(section);
  }
  console.log("✓ Homepage sections seeded");
}

async function seedSiteSettings() {
  for (const setting of [
    { key: "site_name", value: "My Article Website" },
    { key: "site_description", value: "Fast, SEO-first article publishing." },
    { key: "default_seo_title", value: "My Article Website" },
    { key: "default_seo_description", value: "Read the latest articles and trending stories." },
    { key: "timezone", value: "UTC" },
    { key: "trending_weights", value: { views2hWeight: 3, views24hWeight: 1, gravity: 1.5 } },
    { key: "social_profiles", value: {} },
    { key: "adsense_publisher_id", value: "" },
  ]) {
    await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: setting.value, updatedAt: new Date() },
      });
  }
  console.log("✓ Site settings seeded");
}

async function seedLegalPages() {
  for (const page of [
    { slug: "about", title: "About Us" },
    { slug: "contact", title: "Contact" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "terms", title: "Terms of Service" },
    { slug: "disclaimer", title: "Disclaimer" },
  ]) {
    await db
      .insert(pages)
      .values({
        ...page,
        status: "published",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: `${page.title} — content managed via CMS.` }],
            },
          ],
        },
      })
      .onConflictDoNothing({ target: pages.slug });
  }
  console.log("✓ Legal pages seeded");
}

async function main() {
  console.log("Seeding database...\n");
  await seedRoles();
  await seedAdminUser();
  await seedCategories();
  await seedAdSlots();
  await seedHomepageSections();
  await seedSiteSettings();
  await seedLegalPages();
  console.log("\n✅ Seed complete");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });
