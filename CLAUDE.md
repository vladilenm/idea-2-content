# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (default port 3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — `next lint`

There is no test runner configured.

## Architecture

Client-side-only Next.js 14 App Router demo. Per [SPEC.md](SPEC.md): no backend, no DB, no API — everything is a mock generated in the browser from the user's text input. Treat this as a fast-tech prototype, not a real generation pipeline.

### Single-page state machine

[app/page.tsx](app/page.tsx) is the only screen and owns all orchestration. It runs a three-phase machine — `idle → generating → ready` — and in parallel drives a `PipelineStage` plus a `stageIndex` for the loading checklist. Phase advancement is purely time-based: a cascade of `setTimeout`s in `unfold()` (~350/900/1500/2100/2200 ms) shifts the pipeline stage, then finally calls `generate(idea)` and flips to `ready`. All timers are tracked in `timers.current` and cleared on unmount and on `reset()` — preserve this when adding new async behavior.

### Mock generation

[lib/generate.ts](lib/generate.ts) is the entire "AI". It returns exactly three `GeneratedAsset`s (YouTube structure, Telegram post, 5 Shorts hooks) built from string templates that interpolate the raw idea. `leverage` scores are **deterministic** per input — a small string-hash in `scoreFor()` keeps the same idea producing the same numbers, so don't replace it with `Math.random()` unless you intentionally want re-roll behavior. When adding a new asset type, extend the `Format` union and update `FORMAT_ICON`/`FORMAT_ACCENT` in [components/ContentCard.tsx](components/ContentCard.tsx) — both maps must stay total over `Format`.

### Visual system

The premium-AI-dashboard look is not in component code — it lives in two places that must stay in sync:

- **Tailwind theme** ([tailwind.config.ts](tailwind.config.ts)) defines the `graphite.*` and `electric.*` color scales and the custom keyframes (`pulse-glow`, `scan-line`, `shimmer`, `float-slow`). Components reference these by name (e.g. `bg-electric-violet`, `animate-pulse-glow`).
- **Global CSS** ([app/globals.css](app/globals.css)) defines `.glow-card`, `.glow-ring`, `.bg-grid`, `.shimmer-text`. `.glow-card` uses a mouse-tracking radial highlight driven by CSS custom properties `--mx` / `--my` set from `onMouseMove` in [components/ContentCard.tsx](components/ContentCard.tsx) — keep both halves of that contract intact.

Russian copy is part of the design (headings, button labels, generated content). Don't translate UI strings to English when editing.

### Conventions

- Path alias `@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)) — imports use `@/lib/...` and `@/components/...`.
- All interactive components are `"use client"`; the only server component is [app/layout.tsx](app/layout.tsx), which injects Inter + JetBrains Mono via Google Fonts `<link>` (not `next/font`).
- Animations use `framer-motion`. The Pipeline progress bar width and stage rings are driven by `STAGE_INDEX` in [components/Pipeline.tsx](components/Pipeline.tsx); the loading checklist in [components/GeneratingState.tsx](components/GeneratingState.tsx) is driven by `stageIndex` from the page. These two indices are independent — `page.tsx` sets them on the same timer but with different semantics (`stage` is the pipeline node, `stageIndex` is the checklist row), so don't collapse them.


## SQL & Supabase
- всегда создавай `.sql` файлы для любых SQL-запросов, которые пользователь должен выполнить
- помещай все `.sql` файлы в папку `/docs` в соответствующем проекте
- каждый файл должен начинаться с номера, чтобы фиксировать порядок выполнения операций
- вся схема базы данных должна быть задокументирована в папке `/docs` в отдельных `.sql` файлах
- называй файлы в таком формате: `001_create_x_table.sql`, `002_change_rls_policy.sql`, `003_add_foreign_key.sql` и т.д.