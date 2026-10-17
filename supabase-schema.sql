-- SweatCircle $0/Month Cloud Database Schema (Supabase / PostgreSQL)
-- Run this in your free Supabase SQL Editor to enable cross-device live sync

-- 1. Circles Table
create table if not exists public.circles (
  id text primary key,
  name text not null,
  emoji text default '🔥',
  category text,
  wager text,
  weekly_streak integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Circle Members Table
create table if not exists public.circle_members (
  circle_id text references public.circles(id) on delete cascade,
  user_id text not null,
  user_name text not null,
  weekly_target_days integer default 3,
  primary key (circle_id, user_id)
);

-- 3. Verified Photo Logs Table
create table if not exists public.circle_logs (
  id text primary key,
  circle_id text references public.circles(id) on delete cascade,
  user_id text not null,
  type text not null check (type in ('workout', 'meal')),
  photo_url text not null,
  caption text,
  telemetry jsonb,
  date_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.circle_logs enable row level security;

-- Free-tier open policies for friends circle sharing
create policy "Allow all reads" on public.circle_logs for select using (true);
create policy "Allow member insert" on public.circle_logs for insert with check (true);
