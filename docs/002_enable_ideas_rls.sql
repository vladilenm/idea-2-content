-- 002 · Row Level Security для public.ideas.
-- Без RLS anon-ключ (он публичный) позволил бы читать чужие идеи из любого браузера.
-- Запускать ПОСЛЕ 001_create_ideas_table.sql.

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
