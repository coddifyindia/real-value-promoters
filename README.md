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

## When things go wrong

| Failure | What visitors see |
| --- | --- |
| Database slow or down | Pages keep serving the last good copy from cache. Requests time out after 8–10s instead of hanging, with one automatic retry. |
| Database down when someone enquires | The enquiry is emailed to the team marked **[NOT SAVED]**, and the visitor still gets the thank-you screen. Only if email also fails do they see a message with Call/WhatsApp buttons. |
| Visitor's connection drops while sending | The form keeps what they typed and offers WhatsApp. |
| Any other server error | A designed error page (`error.tsx`) with Try again, Home, Call and WhatsApp. Raw error details are never shown; a reference code matches the server log. |
| Unknown URL | A designed 404 page with ways forward, marked `noindex`. |

## Security

- Content Security Policy limited to the hosts the site uses (YouTube, Google Maps, Supabase), `frame-ancestors 'none'`, HSTS, `nosniff`, a strict referrer policy, `Cross-Origin-Opener-Policy`, no `X-Powered-By`.
- `/admin` responses are `no-store` and `noindex`. Every admin page and action checks the `admins` table, and row-level security enforces the same rule in Postgres.
- Admin-entered links are allowlisted: maps must be Google Maps embeds, reels must be instagram.com, and photos must be the bundled images or this project's storage bucket.
- Enquiries and newsletter sign-ups are validated (zod), honeypot- and timing-checked, and rate-limited per salted IP hash.
- `/.well-known/security.txt` gives researchers a contact.

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

## Tests

| Command | What it checks |
| --- | --- |
| `npm run lint` / `npm run typecheck` | Code style and TypeScript types |
| `npm test` | Unit tests (Vitest): EMI maths, form validation, shortlist storage, CSV safety |
| `npm run test:e2e` | Browser tests (Playwright) on phone, tablet and desktop sizes: every page loads without errors or sideways scrolling, passes automated accessibility checks (axe), 44px touch targets and aligned form rows, filters, shortlist, EMI calculator, forms (including a dropped connection), rate limits, redirects, SEO files, security headers, reduced-motion |

The browser tests run against a production build:

```bash
npm run build
```

```bash
npm run test:e2e
```

Tests that write to the database (form submission, newsletter, admin login guard) run only
with a local Supabase and `E2E_SUPABASE=1`. GitHub Actions runs everything, including those,
on every pull request (`.github/workflows/ci.yml`).

## Project layout

```
src/app/(site)/        public pages (home, properties, property detail, about, services, contact)
src/app/admin/         leads inbox, properties manager, subscribers
src/app/actions/       server actions (public forms, admin)
src/components/        UI components
src/lib/               data access, Supabase clients, email, validation
src/data/              seed data for the 13 launch projects
tests/unit/            Vitest unit tests
e2e/                   Playwright browser tests
supabase/              SQL migration and seed
public/images/         optimized project photos
```

## Changing the seed data

Edit `src/data/seed-properties.json`, then regenerate the SQL:

```bash
node scripts/generate-seed.mjs
```

After launch, manage projects from `/admin/properties` instead. The seed is only for first setup.
