"use client";

import { motion } from "framer-motion";

const LINES = [
  "анализ ядра тезиса",
  "поиск нарративных рычагов",
  "развёртка в форматы",
  "оценка leverage по каналам",
  "сборка контент-системы",
];

export function GeneratingState({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-electric-violet/20 bg-graphite-900/60 p-6 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-electric-violet/30 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-electric-blue/30 blur-3xl animate-pulse-glow" />

      <div className="relative flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <span className="absolute inset-0 rounded-full border border-electric-violet/40" />
          <span className="absolute inset-0 rounded-full border-t-2 border-electric-violet animate-spin" />
          <span className="absolute inset-2 rounded-full bg-electric-violet/15 backdrop-blur" />
          <span className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-electric-violet/80">SYNAPSE · processing</div>
          <div className="mt-1 shimmer-text text-lg font-semibold">Разворачиваю идею в контент-систему…</div>
        </div>
      </div>

      <div className="relative mt-5 space-y-2">
        {LINES.map((line, i) => {
          const done = i < stageIndex;
          const current = i === stageIndex;
          return (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 font-mono text-xs"
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                  done
                    ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                    : current
                    ? "border-electric-violet bg-electric-violet/20 text-electric-violet"
                    : "border-white/10 bg-transparent text-white/30"
                }`}
              >
                {done ? "✓" : current ? "•" : ""}
              </span>
              <span
                className={`uppercase tracking-wider ${
                  done ? "text-white/50 line-through decoration-emerald-400/40" : current ? "text-white" : "text-white/30"
                }`}
              >
                {line}
              </span>
              {current && (
                <span className="ml-2 inline-flex h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.span
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.9, ease: "linear" }}
                    className="block h-full bg-gradient-to-r from-electric-violet via-electric-indigo to-electric-blue"
                  />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
