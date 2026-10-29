-- Real Value Promoters: initial schema.
-- Run once in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.property_type as enum ('plot', 'villa', 'plot_villa', 'farm_land');
create type public.lead_kind as enum ('contact', 'enquiry', 'site_visit');
create type public.lead_status as enum ('new', 'contacted', 'site_visit_booked', 'closed', 'spam');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.properties (
  id             uuid primary key default gen_random_uuid(),
  legacy_id      integer unique,              -- id used by the old site (/properties/1), for redirects
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null check (char_length(name) between 2 and 120),
  location       text not null,
  city           text not null,
  type           public.property_type not null,
  price_label    text not null,                -- what visitors see, e.g. "₹7.75 Lakhs onwards"
  price_from     integer check (price_from >= 0), -- INR, for sorting; null when priced per sq.ft / cent
  description    text not null default '',
  amenities      text[] not null default '{}',
  images         text[] not null default '{}', -- first image is the cover
  contact_name   text,
  contact_phones text[] not null default '{}',
  youtube_id     text,
  map_embed_url  text,
  instagram_url  text,
  featured       boolean not null default false,
  published      boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index properties_listing_idx on public.properties (published, sort_order);

create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  kind           public.lead_kind not null,
  status         public.lead_status not null default 'new',
  name           text not null check (char_length(name) between 2 and 120),
  email          text not null check (char_length(email) <= 254),
  phone          text not null check (char_length(phone) between 8 and 20),
  message        text check (char_length(message) <= 2000),
  property_id    uuid references public.properties (id) on delete set null,
  property_name  text,                          -- snapshot, survives property deletion
  preferred_date date,
  source_path    text,
  utm            jsonb,
  ip_hash        text,                          -- salted SHA-256, used only for rate limiting
  user_agent     text,
  notes          text                           -- internal, admin-only
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_rate_limit_idx on public.leads (ip_hash, created_at);

create table public.subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null check (char_length(email) <= 254),
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz,
  source_path     text
);

create unique index subscribers_email_key on public.subscribers (lower(email));

-- Who may use /admin. Add a row after creating the user in Authentication > Users.
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Leads and subscribers have no insert policy: the website inserts them from
-- the server with the secret key, which bypasses RLS. Browsers can never write
-- or read them directly.
-- ---------------------------------------------------------------------------
alter table public.properties  enable row level security;
alter table public.leads       enable row level security;
alter table public.subscribers enable row level security;
alter table public.admins      enable row level security;

create policy "Published properties are public" on public.properties
  for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins insert properties" on public.properties
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update properties" on public.properties
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete properties" on public.properties
  for delete to authenticated using ((select public.is_admin()));

create policy "Admins read leads" on public.leads
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update leads" on public.leads
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete leads" on public.leads
  for delete to authenticated using ((select public.is_admin()));

create policy "Admins read subscribers" on public.subscribers
  for select to authenticated using ((select public.is_admin()));
create policy "Admins delete subscribers" on public.subscribers
  for delete to authenticated using ((select public.is_admin()));

create policy "Users see their own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Explicit grants, so this works even on projects that don't expose new tables automatically.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;
grant select, update, delete on public.leads to authenticated;
grant select, delete on public.subscribers to authenticated;
grant select on public.admins to authenticated;
grant all on public.properties, public.leads, public.subscribers, public.admins to service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Storage: property photos uploaded from /admin
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Admins upload property images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-images' and (select public.is_admin()));
create policy "Admins update property images" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-images' and (select public.is_admin()));
create policy "Admins delete property images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-images' and (select public.is_admin()));
