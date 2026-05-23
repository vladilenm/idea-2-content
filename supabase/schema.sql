-- Таблица идей пользователя.
-- Запусти этот SQL в Supabase Dashboard → SQL Editor.

create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  idea        text not null check (char_length(idea) between 1 and 280),
  assets      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists ideas_user_id_created_at_idx
  on public.ideas (user_id, created_at desc);

-- Row Level Security — без неё anon-клиент с любого браузера прочитает всё.
alter table public.ideas enable row level security;

-- Пользователь видит только свои идеи.
drop policy if exists "ideas_select_own" on public.ideas;
create policy "ideas_select_own" on public.ideas
  for select using (auth.uid() = user_id);

-- Пользователь вставляет идеи только от своего имени.
drop policy if exists "ideas_insert_own" on public.ideas;
create policy "ideas_insert_own" on public.ideas
  for insert with check (auth.uid() = user_id);

-- Пользователь удаляет только свои.
drop policy if exists "ideas_delete_own" on public.ideas;
create policy "ideas_delete_own" on public.ideas
  for delete using (auth.uid() = user_id);
