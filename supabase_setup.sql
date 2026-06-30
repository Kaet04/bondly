-- Bondly database setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable realtime on existing tables (if not already enabled)
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table couples;

-- Create game_turns table for multiplayer turn-based games
create table if not exists public.game_turns (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  game_id text not null,
  question_index int not null default 0,
  player_a uuid references public.profiles(id) on delete cascade not null,
  answer_a text,
  player_b uuid references public.profiles(id) on delete cascade,
  answer_b text,
  created_at timestamptz default now()
);

-- Enable realtime on game_turns
alter publication supabase_realtime add table game_turns;

-- Row Level Security
alter table public.game_turns enable row level security;

-- Policy: couple members can see their own turns
create policy "Couple members can view their turns"
  on public.game_turns for select
  using (
    couple_id in (
      select id from public.couples
      where member_a = auth.uid() or member_b = auth.uid()
    )
  );

-- Policy: couple members can insert turns
create policy "Couple members can insert turns"
  on public.game_turns for insert
  with check (
    couple_id in (
      select id from public.couples
      where member_a = auth.uid() or member_b = auth.uid()
    )
  );

-- Policy: couple members can update turns
create policy "Couple members can update turns"
  on public.game_turns for update
  using (
    couple_id in (
      select id from public.couples
      where member_a = auth.uid() or member_b = auth.uid()
    )
  );

-- Make sure profiles has avatar column (JSONB)
alter table public.profiles add column if not exists avatar jsonb;

-- RLS policies for profiles (if not already set)
alter table public.profiles enable row level security;

create policy if not exists "Users can view any profile"
  on public.profiles for select using (true);

create policy if not exists "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- RLS policies for couples
alter table public.couples enable row level security;

create policy if not exists "Anyone can view couples by invite_code"
  on public.couples for select using (true);

create policy if not exists "Authenticated users can create couples"
  on public.couples for insert with check (auth.uid() = member_a);

create policy if not exists "Couple members can update their couple"
  on public.couples for update
  using (member_a = auth.uid() or member_b = auth.uid());
