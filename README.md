# Master Website — Article Publishing Platform

Production-ready, SEO-first publishing platform built with Next.js 15, PostgreSQL, Drizzle ORM, and Better Auth.

## Phase 5 (Current) — Analytics & Ads

- **pg-boss worker** — `pnpm run worker` for async jobs (trending, rollups, scheduled publish)
- **Event pipeline** — `POST /api/events` returns 202 when queued, sync fallback without worker
- **Admin analytics** — `/admin/analytics` with traffic chart, top articles, referrers, devices
- **AdSense** — `/admin/adsense` slot config + `<AdSlot>` on public pages
- **Daily rollups** — `analytics_daily_rollups` populated nightly by worker

## Phase 4 — Discovery

- **Search** — PostgreSQL FTS via `search_vector` at `/search?q=`
- **List pages** — `/trending`, `/popular`, `/latest`, `/recommended`
- **View tracking** — `POST /api/events` → `analytics_events` + `article_stats`
- **Trending scores** — recomputed from `trending_weights` in site_settings
- **Read cookie** — `ys_read` for personalized recommendations

## Phase 3 — Public Site

- Public routes: `/article/{slug}`, `/category/{slug}`, `/tag/{slug}`, `/author/{slug}`
- Homepage sections from DB (hero, latest, trending, etc.)
- Legal CMS pages: `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`
- SEO: `generateMetadata`, JSON-LD, `/sitemap.xml`, `/robots.txt`
- ISR (`revalidate` 120–300s) + `revalidateTag` on publish via `/api/revalidate`

## Phase 2 — CMS Core

- **TipTap editor** — block editor with bold, headings, lists, links, images
- **Article CRUD** — draft, review, scheduled, published, archived + revision history
- **Taxonomy** — categories (hierarchical), tags, authors
- **Media library** — Sharp variants (400/800/1200/OG) → Cloudflare R2 or local `data/media`
- **Site settings** — name, SEO defaults, social profiles

## Phase 1 (Complete)

- Next.js 15 + TypeScript + Tailwind CSS 4
- PostgreSQL schema (articles, taxonomy, media, analytics, ads, audit)
- Better Auth with RBAC (SUPER_ADMIN, EDITOR, AUTHOR, ANALYST)
- Admin CMS shell with full navigation
- Health check endpoint
- Docker Compose (postgres + app + nginx)

## Windows Notes

- **Use pnpm, not npm** — `npm install` can hang on Windows. Run:
  ```bash
  npx pnpm@9 install
  ```
- **Local build** — `pnpm run build` works without admin rights. Docker/Linux builds set `DOCKER_BUILD=1` for standalone output.
- **PostgreSQL (portable, no admin)** — included in project:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\install-postgres-portable.ps1
  .\scripts\start-postgres.ps1   # after reboot
  .\scripts\stop-postgres.ps1
  ```
  Binaries: `tools/pgsql` | Data: `data/postgres` | Port: **5432**

## Quick Start (Local Development)

### 1. Install dependencies

**Recommended (faster on Windows):**

```bash
npx pnpm@9 install
```

Or with npm (slower; uses `.npmrc` with `legacy-peer-deps`):

```bash
npx pnpm@9 install
```

### 2. Configure environment

```bash
copy .env.example .env
```

Edit `.env` and set `BETTER_AUTH_SECRET` to a random 32+ character string.

### 3. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 4. Run migrations

```bash
npm run db:push
```

### 5. Seed database

```bash
npm run db:seed
```

Default admin credentials:
- Email: `admin@myarticlewebsite.com`
- Password: `AdminPass123!`

### 6. Start dev server

```bash
npx pnpm@9 run dev
```

Optional — background worker for async analytics + scheduled jobs:

```bash
npx pnpm@9 run worker
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- Health check: http://localhost:3000/api/health

## Production (Docker)

```bash
docker compose up -d --build
```

Site available at http://localhost (nginx → app).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run worker` | pg-boss background jobs (analytics, trending, publish) |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed roles, admin, categories, settings |
| `npm run db:studio` | Drizzle Studio GUI |

## Architecture

See [architecture-report.html](./architecture-report.html) for the full 46-section architecture document.

## Project Structure

```
app/
  (public)/          Public website
  admin/
    (protected)/     Auth-gated CMS pages
    login/           Admin sign-in
  api/
    auth/            Better Auth handler
    health/          Health check
lib/
  db/schema/         Drizzle schema modules
  auth/              Better Auth + RBAC
  jobs/              pg-boss (Phase 2+)
docker/              Dockerfile, nginx, init SQL
scripts/seed.ts      Database seeder
```
