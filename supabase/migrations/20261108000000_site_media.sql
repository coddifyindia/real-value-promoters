-- Site-wide settings the admin can change, starting with the home page banner video.
-- One row per setting; `value` is JSON so new settings need no schema change.
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

-- The website reads settings with the public key; only admins can change them.
create policy "Site settings are public" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Admins insert site settings" on public.site_settings
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update site settings" on public.site_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete site settings" on public.site_settings
  for delete to authenticated using ((select public.is_admin()));

-- Storage: banner video and its poster image, uploaded from /admin/banner.
-- 50 MB is the Supabase free plan's per-file ceiling.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800,
        array['video/mp4', 'video/webm', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;

-- Storage looks a file up before deleting it, so removing replaced videos needs read access too.
create policy "Admins read site media" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));
create policy "Admins upload site media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.is_admin()));
create policy "Admins update site media" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));
create policy "Admins delete site media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));
