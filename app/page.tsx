"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { generate, type GeneratedAsset } from "@/lib/generate";
import { Pipeline, type PipelineStage } from "@/components/Pipeline";
import { ContentCard } from "@/components/ContentCard";
import { GeneratingState } from "@/components/GeneratingState";
import { AuthButton } from "@/components/AuthButton";
import { IdeasDrawer } from "@/components/IdeasDrawer";
import { useUser } from "@/components/UserProvider";
import { saveIdea } from "@/lib/ideas";

type Phase = "idle" | "generating" | "ready";

const SAMPLE_IDEAS = [
  "Контент перестал быть продуктом — он стал интерфейсом доступа к человеку.",
  "Один сильный тезис стоит дороже годового медиа-плана.",
  "AI-эпоха делает дистрибуцию важнее производства.",
];

export default function Page() {
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ideasRefreshKey, setIdeasRefreshKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { user } = useUser();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function unfold() {
    if (!idea.trim() || phase === "generating") return;
    clearTimers();
    setPhase("generating");
    setAssets([]);
    setErrorMessage(null);
    setStage("idea");
    setStageIndex(0);

    const generationPromise = generate(idea);

    const seq: { delay: number; stage: PipelineStage; idx: number }[] = [
      { delay: 350, stage: "narrative", idx: 1 },
      { delay: 900, stage: "formats", idx: 2 },
      { delay: 1500, stage: "distribution", idx: 3 },
      { delay: 2100, stage: "done", idx: 5 },
    ];
    seq.forEach((s) => {
      timers.current.push(
        setTimeout(() => {
          setStage(s.stage);
          setStageIndex(s.idx);
        }, s.delay)
      );
    });

    timers.current.push(
      setTimeout(async () => {
        try {
          const generated = await generationPromise;
          setAssets(generated);
          setPhase("ready");
          if (user) {
            const res = await saveIdea(idea, generated);
            if (!res.error) setIdeasRefreshKey((k) => k + 1);
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : "Неизвестная ошибка";
          setErrorMessage(message);
          setPhase("idle");
          setStage("idle");
          setStageIndex(0);
        }
      }, 2200)
    );
  }

  function reset() {
    clearTimers();
    setPhase("idle");
    setStage("idle");
    setStageIndex(0);
    setAssets([]);
    setErrorMessage(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-electric-violet/30 blur-[140px] animate-pulse-glow" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">SYNAPSE</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">idea-to-content engine</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/50 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              supabase · synced
            </div>
            <AuthButton onOpenIdeas={() => setDrawerOpen(true)} />
          </div>
        </header>

        <IdeasDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          refreshKey={ideasRefreshKey}
        />

        {/* Hero */}
        <section className="mt-12 sm:mt-20 max-w-3xl">
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-electric-violet/30 bg-electric-violet/[0.08] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-electric-violet/90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric-violet shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
            AI-era · content leverage
          </m.div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
            Одна сырая идея —{" "}
            <span className="bg-gradient-to-r from-electric-violet via-electric-indigo to-electric-cyan bg-clip-text text-transparent">
              полноценная медиа-система
            </span>
            .
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/55 max-w-2xl leading-relaxed">
            Вводишь мысль. Получаешь сценарий YouTube, пост в Telegram и 5 хуков для коротких видео.
            Всё за несколько секунд. Без бэкенда, без рендеринга — чистая клиентская демонстрация новой способности.
          </p>
        </section>

        {/* Input */}
        <section className="mt-10 sm:mt-12">
          <div className="relative glow-card rounded-2xl p-1.5 glow-ring">
            <div className="rounded-xl bg-graphite-900/80 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">▸ raw idea input</div>
                <div className="text-[10px] font-mono text-white/30 tabular-nums">{idea.length} / 280</div>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value.slice(0, 280))}
                placeholder="Напиши свою мысль одним предложением. Чем острее — тем сильнее рычаг."
                rows={3}
                className="w-full resize-none bg-transparent text-base sm:text-lg leading-relaxed text-white placeholder:text-white/25 outline-none"
              />
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_IDEAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setIdea(s)}
                      className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11px] text-white/55 transition hover:border-electric-violet/40 hover:bg-electric-violet/[0.08] hover:text-white"
                    >
                      {s.length > 48 ? s.slice(0, 46) + "…" : s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {phase === "ready" && (
                    <button
                      onClick={reset}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      сбросить
                    </button>
                  )}
                  <button
                    onClick={unfold}
                    disabled={!idea.trim() || phase === "generating"}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-electric-violet via-electric-indigo to-electric-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-electric-violet/30 transition disabled:cursor-not-allowed disabled:opacity-40 hover:shadow-electric-violet/50"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {phase === "generating" ? "разворачиваю…" : "развернуть в контент-систему"}
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition group-hover:translate-x-0.5">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error banner */}
        {errorMessage && (
          <m.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-200"
          >
            <span className="mt-0.5 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            <div className="flex-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-rose-300/70">▸ deepseek api</div>
              <div className="mt-1 text-rose-100/90">{errorMessage}</div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-200/60 transition hover:text-rose-100"
              aria-label="закрыть"
            >
              ×
            </button>
          </m.div>
        )}

        {/* Pipeline */}
        <section className="mt-10 sm:mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">▸ pipeline</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">
              {phase === "idle" && "awaiting input"}
              {phase === "generating" && "transforming"}
              {phase === "ready" && "system online"}
            </div>
          </div>
          <Pipeline stage={stage} />
        </section>

        {/* Generating + Results */}
        <section className="mt-10 sm:mt-12">
          <AnimatePresence mode="wait">
            {phase === "generating" && (
              <m.div
                key="gen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <GeneratingState stageIndex={stageIndex} />
              </m.div>
            )}

            {phase === "ready" && (
              <m.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">▸ generated assets · {assets.length}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-emerald-300/80">
                    avg leverage · {Math.round(assets.reduce((a, b) => a + b.leverage, 0) / assets.length)}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {assets.map((a, i) => (
                    <div key={a.id} className={i === 0 ? "lg:col-span-2" : ""}>
                      <ContentCard asset={a} index={i} />
                    </div>
                  ))}
                </div>
              </m.div>
            )}

            {phase === "idle" && (
              <m.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  { k: "01", t: "Структура YouTube", d: "long-form сценарий с таймкодами, хуком и закрытием" },
                  { k: "02", t: "Telegram-пост", d: "разговорный текст с акцентом на тезис и CTA" },
                  { k: "03", t: "5 хуков · Shorts", d: "паттерны для коротких форматов: контр-тезис, urgency, curiosity" },
                ].map((c) => (
                  <div key={c.k} className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">slot · {c.k}</div>
                    <div className="mt-2 text-sm font-semibold text-white/80">{c.t}</div>
                    <div className="mt-1 text-xs text-white/40 leading-relaxed">{c.d}</div>
                  </div>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-white/30">
          <div>fast-tech prototype · client-side mock</div>
          <div>synapse · v0.1 · 2026</div>
        </footer>
      </div>
    </main>
  );
}

function LogoMark() {
  return (
    <div className="relative h-9 w-9">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-electric-violet via-electric-indigo to-electric-blue shadow-lg shadow-electric-violet/40" />
      <div className="absolute inset-[1.5px] rounded-[10px] bg-graphite-950" />
      <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-5 w-5 text-white">
        <circle cx="6" cy="6" r="1.6" fill="currentColor" />
        <circle cx="18" cy="6" r="1.6" fill="currentColor" />
        <circle cx="6" cy="18" r="1.6" fill="currentColor" />
        <circle cx="18" cy="18" r="1.6" fill="currentColor" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <path d="M6 6L12 12L18 6M6 18L12 12L18 18" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}
