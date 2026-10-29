# Real Value Promoters website

Marketing site and lead management for [realvaluepromoters.com](https://www.realvaluepromoters.com):
plots, villas and farm land across Tamil Nadu.

- **Going live?** Follow [SETUP.md](SETUP.md).
- **Why the rebuild?** See [docs/ASSESSMENT.md](docs/ASSESSMENT.md).

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, React 19), TypeScript, Tailwind CSS 4 |
| Data, auth, file storage | Supabase (Postgres with row-level security, Auth, Storage) |
| Email | Resend |
| Hosting | Vercel |

## How it fits together

```
Visitor ── form ──► Server Action (src/app/actions/leads.ts)
                     ├─ validate (zod), spam checks, rate limit
                     ├─ insert into Supabase `leads` (secret key, server only)
                     └─ after response: Resend → team alert + visitor confirmation

Public pages ──► getPublishedProperties()  ("use cache", tag "properties")
                     └─ Supabase `properties` (publishable key, RLS: published rows only)

/admin ──► proxy.ts refreshes the Supabase session cookie
        ──► requireAdmin(): signed-in user must be in `admins` (RLS enforces the same)
        ──► saving a property calls updateTag("properties") so the site updates instantly
        ──► photos upload browser → Supabase Storage (`property-images`, admin-only writes)
```

Without Supabase credentials the public site renders from
`src/data/seed-properties.json`, so previews and first deploys never show an
empty catalogue.

## Local development

```bash
npm install
```

```bash
cp .env.example .env.local
```

Fill in `.env.local` (or leave the Supabase values blank to use the seed data), then:

```bash
npm run dev
```

To run Supabase locally instead of a cloud project (needs Docker):

```bash
npx supabase start
```

This applies `supabase/migrations` and `supabase/seed.sql` automatically; copy the printed
URL and keys into `.env.local`.

## Project layout

```
src/app/(site)/        public pages (home, properties, property detail, about, services, contact)
src/app/admin/         leads inbox, properties manager, subscribers
src/app/actions/       server actions (public forms, admin)
src/components/        UI components
src/lib/               data access, Supabase clients, email, validation
src/data/              seed data for the 13 launch projects
supabase/              SQL migration and seed
public/images/         optimized project photos
```

## Changing the seed data

Edit `src/data/seed-properties.json`, then regenerate the SQL:

```bash
node scripts/generate-seed.mjs
```

After launch, manage projects from `/admin/properties` instead. The seed is only for first setup.
