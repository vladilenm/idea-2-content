# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (default port 3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — `next lint`

There is no test runner configured.

## Architecture

Next.js 14 App Router app with a thin backend. **Note:** [SPEC.md](SPEC.md) describes the original "client-side mock, no backend" prototype — the code has since outgrown it. Reality today: a real LLM call (DeepSeek), Supabase auth, and a Postgres table with RLS. SPEC.md is kept only as historical intent; trust the code and this file over it.

End-to-end data flow: idea typed in [app/page.tsx](app/page.tsx) → [lib/generate.ts](lib/generate.ts) `fetch('/api/generate')` → server route calls DeepSeek and validates the JSON → client maps it into three `GeneratedAsset`s → if signed in, [lib/ideas.ts](lib/ideas.ts) persists them to Supabase (`ideas` table, guarded by RLS).

### Single-page state machine

[app/page.tsx](app/page.tsx) is the main screen and owns all orchestration. It runs a three-phase machine — `idle → generating → ready` — and in parallel drives a `PipelineStage` plus a `stageIndex` for the loading checklist.

**The progress animation is theatre decoupled from the real request.** `unfold()` fires the real `generate(idea)` immediately, but a cascade of `setTimeout`s (~350/900/1500/2100 ms) advances the visual pipeline on a fixed clock, and the result is only applied at the final ~2200 ms timer (which `await`s the in-flight promise). So the checklist can show "done" before the API actually returns, and a slow API blocks past 2200 ms. This is intentional demo polish — don't mistake the timers for real backend state. All timers are tracked in `timers.current` and cleared on unmount and in `reset()` — preserve this when adding async behavior. On API failure the machine drops back to `idle` and surfaces `errorMessage`.

### LLM generation

The real "AI" is the server route [app/api/generate/route.ts](app/api/generate/route.ts): it calls **DeepSeek** through the `openai` SDK (`baseURL: https://api.deepseek.com`, model from `DEEPSEEK_MODEL`, default `deepseek-v4-flash`), forces `response_format: json_object`, and validates the reply. The shape of that reply (`{ youtube, telegram, shorts[] }`) and its runtime validator live in one place — [lib/llm-types.ts](lib/llm-types.ts) (`LLMContentPayload` / `isValidLLMPayload`) — imported by both the route and the client. Keep it the single source of truth; don't re-declare the shape locally.

[lib/generate.ts](lib/generate.ts) is the client transport + presentation layer: it calls the route and maps the payload into exactly three `GeneratedAsset`s (YouTube structure, Telegram post, 5 Shorts hooks). `leverage` scores are **deterministic** per input — a small string-hash in `scoreFor()` keeps the same idea producing the same numbers, so don't replace it with `Math.random()` unless you want re-roll behavior. The score is computed client-side and persisted into the saved `assets` JSONB. When adding a new asset type, extend the `Format` union and update `FORMAT_ICON`/`FORMAT_ACCENT` in [components/ContentCard.tsx](components/ContentCard.tsx) — both maps must stay total over `Format`.

### Auth & persistence (Supabase)

- **SSR client split** — [lib/supabase/client.ts](lib/supabase/client.ts) (browser, `createBrowserClient`) vs [lib/supabase/server.ts](lib/supabase/server.ts) (cookie-backed `createServerClient`). Use the right one for the context; never use the browser client in a server component or route.
- **Session refresh** — [middleware.ts](middleware.ts) runs `updateSession` ([lib/supabase/middleware.ts](lib/supabase/middleware.ts)) on every matched request. There is a load-bearing comment there: **do not insert code between `createServerClient` and `getUser`** — it desyncs the session cookie. Honor it.
- **Auth UI** — [components/UserProvider.tsx](components/UserProvider.tsx) is a React Context (`user`/`loading`/`signOut`) consumed via `useUser()`; OAuth completes in [app/auth/callback/route.ts](app/auth/callback/route.ts) (PKCE `exchangeCodeForSession`).
- **Data access** — [lib/ideas.ts](lib/ideas.ts) (`saveIdea`/`listIdeas`/`deleteIdea`). Security rests entirely on **RLS** (`auth.uid() = user_id`), because the anon key is public. Schema lives in [docs/](docs/) (`001_create_ideas_table.sql`, `002_enable_ideas_rls.sql`) — run them in order in the Supabase SQL Editor.
- **Saved-idea view** — [app/ideas/[id]/page.tsx](app/ideas/[id]/page.tsx) is a server component reading directly from Supabase.

### Visual system

The premium-AI-dashboard look is not in component code — it lives in two places that must stay in sync:

- **Tailwind theme** ([tailwind.config.ts](tailwind.config.ts)) defines the `graphite.*` and `electric.*` color scales and the custom keyframes (`pulse-glow`, `scan-line`, `shimmer`, `float-slow`). Components reference these by name (e.g. `bg-electric-violet`, `animate-pulse-glow`).
- **Global CSS** ([app/globals.css](app/globals.css)) defines `.glow-card`, `.glow-ring`, `.bg-grid`, `.shimmer-text`. `.glow-card` uses a mouse-tracking radial highlight driven by CSS custom properties `--mx` / `--my` set from `onMouseMove` in [components/ContentCard.tsx](components/ContentCard.tsx) — keep both halves of that contract intact.

Russian copy is part of the design (headings, button labels, generated content). Don't translate UI strings to English when editing.

### Conventions

- Path alias `@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)) — imports use `@/lib/...` and `@/components/...`.
- Client components are `"use client"`. Server-side code: [app/layout.tsx](app/layout.tsx) (injects Inter + JetBrains Mono via `next/font/google`), [app/ideas/[id]/page.tsx](app/ideas/[id]/page.tsx), and the route handlers under `app/api` and `app/auth`. `framer-motion` runs through `LazyMotion` ([components/MotionProvider.tsx](components/MotionProvider.tsx)) in `strict` mode — use the lightweight `m.*` components, never `motion.*`.
- Animations: the Pipeline progress bar width and stage rings are driven by `STAGE_INDEX` in [components/Pipeline.tsx](components/Pipeline.tsx); the loading checklist in [components/GeneratingState.tsx](components/GeneratingState.tsx) is driven by `stageIndex` from the page. These two indices are independent — `page.tsx` sets them on the same timer but with different semantics (`stage` is the pipeline node, `stageIndex` is the checklist row), so don't collapse them.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public), `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` (server-only — never prefix with `NEXT_PUBLIC_`). See [.env.local.example](.env.local.example).


## SQL & Supabase
- всегда создавай `.sql` файлы для любых SQL-запросов, которые пользователь должен выполнить
- помещай все `.sql` файлы в папку `/docs` в соответствующем проекте
- каждый файл должен начинаться с номера, чтобы фиксировать порядок выполнения операций
- вся схема базы данных должна быть задокументирована в папке `/docs` в отдельных `.sql` файлах
- называй файлы в таком формате: `001_create_x_table.sql`, `002_change_rls_policy.sql`, `003_add_foreign_key.sql` и т.д.


## Принципы кодовой базы

- Поддерживать кодовую базу в высокомодульном состоянии и с хорошей документацией.  
- Следовать принципу «разделения ответственности» (separation of concerns).
