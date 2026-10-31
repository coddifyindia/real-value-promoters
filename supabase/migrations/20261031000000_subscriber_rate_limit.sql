-- Lets the newsletter form rate-limit sign-ups per connection (same as enquiries).
-- Stores a salted hash, never the raw IP address.
alter table public.subscribers add column if not exists ip_hash text;
create index if not exists subscribers_ip_hash_created_at_idx on public.subscribers (ip_hash, created_at desc);
