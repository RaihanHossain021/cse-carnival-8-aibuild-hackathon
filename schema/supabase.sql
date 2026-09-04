-- CampusOS persistence schema for Supabase.
-- Run this in Supabase Dashboard -> SQL Editor.
-- Each campus data collection has its own table. The JSONB record preserves
-- the existing application object shape, including nested bookings and registrations.
drop table if exists public.campus_records;

create table if not exists public.schedules (
  id text not null,
  record jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (id)
);

create table if not exists public.rooms (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.schedules enable row level security;
alter table public.rooms enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.assignments enable row level security;

-- API routes use the server service-role key. This read policy also permits
-- browser-safe realtime subscriptions with the publishable key.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['schedules', 'rooms', 'events', 'announcements', 'assignments'] loop
    execute format('drop policy if exists "Public can read %1$s" on public.%1$I', table_name);
    execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true)', table_name);
  end loop;
end $$;

do $$
begin
  begin alter publication supabase_realtime add table public.schedules; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.rooms; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.announcements; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.assignments; exception when duplicate_object then null; end;
end $$;
