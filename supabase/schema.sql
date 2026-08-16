-- Flow Tracker: Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- ============ CLASS SESSIONS ============
create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  type text default 'lecture',
  day_of_week text not null,
  start_time text not null,
  end_time text not null,
  location text,
  instructor text,
  color_tag text default 'violet',
  is_recurring boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- ============ ATTENDANCE RECORDS ============
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  class_session_id uuid references class_sessions on delete set null,
  session_title text not null,
  date date not null,
  status text not null default 'present',
  notes text,
  created_at timestamptz default now()
);

-- ============ WEEKLY PLANS ============
create table if not exists weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  description text,
  week_start_date date not null,
  category text default 'study',
  status text default 'planned',
  due_date date,
  priority text default 'medium',
  created_at timestamptz default now()
);

-- ============ SYNC SETTINGS (per user preferences) ============
create table if not exists sync_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique default auth.uid(),
  attendance_required_pct numeric default 75,
  last_synced_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Ensures every user only ever sees / edits their own rows, no matter
-- which device or platform (web, Android app) they connect from.

alter table class_sessions enable row level security;
alter table attendance_records enable row level security;
alter table weekly_plans enable row level security;
alter table sync_settings enable row level security;

create policy "own class_sessions" on class_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own attendance_records" on attendance_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own weekly_plans" on weekly_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own sync_settings" on sync_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ REALTIME ============
-- Lets web + app instances receive live updates when data changes on
-- another device, so entries made on the phone show up on the website
-- (and vice versa) without a manual refresh.
alter publication supabase_realtime add table class_sessions;
alter publication supabase_realtime add table attendance_records;
alter publication supabase_realtime add table weekly_plans;
