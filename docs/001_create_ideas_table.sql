-- 001 · Таблица идей пользователя.
-- Запусти в Supabase Dashboard → SQL Editor.

create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  idea        text not null check (char_length(idea) between 1 and 280),
  assets      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists ideas_user_id_created_at_idx
  on public.ideas (user_id, created_at desc);
