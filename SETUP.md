# Go-live setup

Four accounts, about 45 minutes. Do the steps in order; each one gives you a
value the next one needs. Tick them off and tell Claude when you're done (or
where you got stuck).

You'll collect these values along the way. Keep them in a password manager,
not in chat or email:

| Value | From step |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 1 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 1 |
| `SUPABASE_SECRET_KEY` (secret!) | 1 |
| `RESEND_API_KEY` (secret!) | 3 |

---

## 1. Supabase: database, storage and admin login

1. Go to <https://supabase.com/dashboard> → **New project**.
   - Name: `real-value-promoters`
   - Region: **Mumbai (ap-south-1)**. Closest to your buyers and to Vercel's Mumbai region.
   - Generate a strong database password and save it.
2. When the project is ready, open **Project Settings → API Keys** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_…`, click *Reveal*) → `SUPABASE_SECRET_KEY`
3. Open **SQL Editor → New query**. Paste the whole of
   [`supabase/migrations/20261029000000_init.sql`](supabase/migrations/20261029000000_init.sql)
   and click **Run**. You should see "Success. No rows returned".
4. New query again. Paste [`supabase/seed.sql`](supabase/seed.sql) and **Run**.
   This loads your 13 current projects. Check under **Table Editor → properties**.
5. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
   (Only people you add can log in to /admin.)
6. **Authentication → Users → Add user → Create new user**: enter the email and
   password you'll use for /admin, and tick **Auto Confirm User**.
7. Make that user an admin. In **SQL Editor**, run (with your email):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```

   Repeat steps 6–7 for each team member who should see leads.

### Updating an existing database (automatic)

New files in `supabase/migrations/` are applied **automatically on every production deploy**.
Before Vercel builds the new version of the site, `scripts/migrate.mjs` connects to the
database and applies any migration it hasn't had yet. Preview deployments never touch the
live database. If a migration fails, that deploy stops and the current site keeps running.

To turn it on (once):

1. In Supabase, click **Connect** (top of the project) and choose **Session pooler**.
   Copy the connection string and put your database password in place of `[YOUR-PASSWORD]`,
   **exactly as it is**: no brackets, and no need to encode symbols such as `@ : / # ? %`.
   The build encodes the password correctly itself (`scripts/db-url.mjs`), and still works if
   it was already encoded. If `[YOUR-PASSWORD]` is left in, the deploy stops with a message
   saying so.
   Use the *Session pooler* string, not *Direct connection*: the direct one needs IPv6,
   which Vercel's build machines don't have.
2. In Vercel, go to **Settings → Environment Variables** and add `SUPABASE_DB_URL` with that
   string. Tick **Production only** (not Preview or Development) and mark it **Sensitive**.
   It never goes into GitHub, chat or email.
3. Redeploy production. The build log shows `[migrate]` lines. The first run on a database
   that was set up by pasting into the SQL Editor also prints *"recording 20261029000000 as
   already applied (one-off baseline)"*. That is expected: it tells the migration tool the
   tables already exist, so it doesn't try to create them again.

Without `SUPABASE_DB_URL` the build still succeeds but prints a warning, and new migrations
have to be pasted into **SQL Editor → New query** by hand. The site keeps working either way;
a feature that needs a newer migration stays off until it's applied.

| File | Adds |
| --- | --- |
| `20261029000000_init.sql` | Tables, security rules and storage for the whole site |
| `20261031000000_subscriber_rate_limit.sql` | Per-connection limit on newsletter sign-ups |

## 2. Vercel: hosting

Your current site already runs on Vercel, so you'll point it at this repository.

1. Go to <https://vercel.com> → open the project that serves realvaluepromoters.com.
2. **Settings → Git**: connect the repository `coddifyindia/real-value-promoters`
   (if the old project is tied to another repo, it's simpler to create a **new project**
   from this repo and move the domain in step 2.7).
3. **Settings → Environment Variables**: add every variable from [`.env.example`](.env.example)
   for **Production** and **Preview**. Leave the Resend ones for now if step 3 isn't done;
   forms still save leads without them.
4. **Settings → Functions → Function Region**: choose **Mumbai (bom1)**.
5. **Analytics → Enable** (Web Analytics). Free, cookie-free page-view stats; the site already
   includes the tracking code. Lead, call and WhatsApp-click events also appear there on the Pro plan.
6. **Deployments → Redeploy** (or push a commit). Open the `.vercel.app` URL and check the site.
7. **Settings → Domains**: add `www.realvaluepromoters.com` and `realvaluepromoters.com`
   to this project (remove them from the old project first if you created a new one).

Old links such as `/properties/1` redirect to the new addresses automatically, so
Google rankings and shared WhatsApp links keep working.

## 3. Resend: emails

1. Sign up at <https://resend.com>.
2. **Domains → Add Domain** → `realvaluepromoters.com`, region **Tokyo (ap-northeast-1)** or the closest offered.
3. Resend shows 3–4 DNS records (MX, TXT for SPF, TXT for DKIM, optionally DMARC).
   Add them where your domain's DNS is managed (the registrar, or Vercel → Domains if
   Vercel hosts your DNS). Click **Verify**; it usually takes a few minutes.
4. **API Keys → Create API key**, permission **Sending access**, domain `realvaluepromoters.com`.
   Copy it → `RESEND_API_KEY`.
5. In Vercel, set:
   - `RESEND_API_KEY` = the key
   - `RESEND_FROM_EMAIL` = `Real Value Promoters <enquiries@realvaluepromoters.com>`
   - `LEADS_NOTIFY_EMAIL` = the inbox(es) that should get new leads, comma-separated
6. Redeploy.

## 4. Test it (5 minutes)

1. Open the live site on your phone. Submit the form on any property page with your own
   email and phone.
2. You should see the thank-you screen with **Continue on WhatsApp**.
3. Within a minute: the team inbox gets "New property enquiry…", and you get
   "Thanks for your enquiry…". Check spam the first time and mark it *Not spam*.
4. Go to `/admin`, sign in, and see the lead. Change its status to *Contacted*.
5. In **Admin → Properties**, open a project, change the price, **Save**, and refresh the
   public page: it updates immediately.

## Day-to-day

- **New leads:** email alert + `/admin`. Use the status and notes to track follow-ups;
  **Export CSV** for Excel.
- **Add a project:** Admin → Properties → **Add property**. Fill in the details, add photos
  (phone photos are resized automatically), tick *Featured* to show it on the home page.
- **Sold out?** Untick **Published** to hide a project without deleting it.
- **Newsletter list:** Admin → Subscribers → Export CSV.
