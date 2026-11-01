// Applies new database migrations (supabase/migrations/*.sql) to the live
// database as part of a production deploy on Vercel. Runs before `next build`,
// so new code never goes live against an old database schema.
//
// Behaviour:
// - Only on Vercel production builds (VERCEL_ENV=production). Preview builds,
//   CI and local builds skip it, so they can never change the live database.
// - Needs SUPABASE_DB_URL (Vercel → Settings → Environment Variables, Production
//   only). Without it the step is skipped with a warning (see SETUP.md).
// - If a migration fails, the build fails and Vercel keeps serving the current
//   deployment.
//
// How the CLI decides what to run: `supabase db push` records every migration
// it applies in the table supabase_migrations.schema_migrations, and on each
// run applies only the files not listed there. This project's first migration
// was originally pasted into the SQL Editor by hand, so on that database the
// table doesn't exist yet. Re-running that file would fail ("relation already
// exists"), so if the schema is present but the history is empty, the first
// migration is recorded as applied before pushing (a one-off "baseline").
import { execFileSync } from "node:child_process";
import postgres from "postgres";

const log = (msg) => console.log(`[migrate] ${msg}`);

if (process.env.VERCEL_ENV !== "production") {
  log("Not a Vercel production build: skipping database migrations.");
  process.exit(0);
}

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.warn(
    "[migrate] SUPABASE_DB_URL is not set, so database migrations were NOT applied. " +
      "Add it in Vercel → Settings → Environment Variables (Production). See SETUP.md.",
  );
  process.exit(0);
}

// The first migration: creates the tables. Applied by hand on the live project.
const BASELINE = "20261029000000";

// The connection string contains the database password: it is passed to the
// CLI but never printed.
const supabase = (args) =>
  execFileSync("supabase", [...args, "--db-url", url, "--yes"], { stdio: "inherit", env: process.env });

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 20, onnotice: () => {} });
try {
  const [{ hasHistory, hasSchema }] = await sql`
    select to_regclass('supabase_migrations.schema_migrations') is not null as "hasHistory",
           to_regclass('public.properties') is not null as "hasSchema"`;
  let recorded = 0;
  if (hasHistory) {
    [{ recorded }] = await sql`select count(*)::int as recorded from supabase_migrations.schema_migrations`;
  }
  if (hasSchema && recorded === 0) {
    log(`Tables exist but no migration history: recording ${BASELINE} as already applied (one-off baseline).`);
    await sql.end();
    supabase(["migration", "repair", "--status", "applied", BASELINE]);
  }
} catch (error) {
  console.error("[migrate] Could not connect to the database. Check SUPABASE_DB_URL (use the Session pooler string).");
  throw new Error(error instanceof Error ? error.message.replace(url, "<SUPABASE_DB_URL>") : "connection failed");
} finally {
  await sql.end({ timeout: 1 }).catch(() => {});
}

log("Applying new migrations…");
supabase(["db", "push", "--skip-vault"]);
log("Database is up to date.");
