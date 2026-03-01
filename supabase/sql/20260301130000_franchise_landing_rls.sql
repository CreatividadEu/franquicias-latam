alter table public.franchise_profiles enable row level security;
alter table public.franchise_feature_flags enable row level security;
alter table public.franchise_bot_configs enable row level security;
alter table public.franchise_bot_faqs enable row level security;

drop policy if exists "public read franchise profiles" on public.franchise_profiles;
create policy "public read franchise profiles"
on public.franchise_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "public read franchise feature flags" on public.franchise_feature_flags;
create policy "public read franchise feature flags"
on public.franchise_feature_flags
for select
to anon, authenticated
using (true);

drop policy if exists "public read franchise bot configs" on public.franchise_bot_configs;
create policy "public read franchise bot configs"
on public.franchise_bot_configs
for select
to anon, authenticated
using (enabled = true);

drop policy if exists "public read enabled franchise bot faqs" on public.franchise_bot_faqs;
create policy "public read enabled franchise bot faqs"
on public.franchise_bot_faqs
for select
to anon, authenticated
using (enabled = true);

drop policy if exists "admin write franchise profiles" on public.franchise_profiles;
create policy "admin write franchise profiles"
on public.franchise_profiles
for all
to authenticated
using (auth.jwt() ->> 'role' = 'ADMIN')
with check (auth.jwt() ->> 'role' = 'ADMIN');

drop policy if exists "admin write franchise feature flags" on public.franchise_feature_flags;
create policy "admin write franchise feature flags"
on public.franchise_feature_flags
for all
to authenticated
using (auth.jwt() ->> 'role' = 'ADMIN')
with check (auth.jwt() ->> 'role' = 'ADMIN');

drop policy if exists "admin write franchise bot configs" on public.franchise_bot_configs;
create policy "admin write franchise bot configs"
on public.franchise_bot_configs
for all
to authenticated
using (auth.jwt() ->> 'role' = 'ADMIN')
with check (auth.jwt() ->> 'role' = 'ADMIN');

drop policy if exists "admin write franchise bot faqs" on public.franchise_bot_faqs;
create policy "admin write franchise bot faqs"
on public.franchise_bot_faqs
for all
to authenticated
using (auth.jwt() ->> 'role' = 'ADMIN')
with check (auth.jwt() ->> 'role' = 'ADMIN');
