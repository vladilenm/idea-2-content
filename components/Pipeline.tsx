"use client";

import { m } from "framer-motion";

const STAGES = [
  { id: "idea", label: "Идея", hint: "сырой импульс" },
  { id: "narrative", label: "Нарратив", hint: "тезис · структура" },
  { id: "formats", label: "Форматы", hint: "video · text · short" },
  { id: "distribution", label: "Дистрибуция", hint: "каналы · охват" },
];

export type PipelineStage = "idle" | "idea" | "narrative" | "formats" | "distribution" | "done";

const STAGE_INDEX: Record<PipelineStage, number> = {
  idle: -1,
  idea: 0,
  narrative: 1,
  formats: 2,
  distribution: 3,
  done: 4,
};

export function Pipeline({ stage }: { stage: PipelineStage }) {
  const active = STAGE_INDEX[stage];

  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-electric-violet via-electric-indigo to-electric-blue transition-all duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, ((active + 1) / STAGES.length) * 100))}%` }}
      />
      <div className="relative grid grid-cols-4 gap-2 sm:gap-6">
        {STAGES.map((s, i) => {
          const reached = i <= active || stage === "done";
          const current = i === active && stage !== "done";
          return (
            <div key={s.id} className="flex flex-col items-center text-center">
              <m.div
                animate={{
                  scale: current ? [1, 1.12, 1] : 1,
                  boxShadow: reached
                    ? "0 0 32px -4px rgba(139,92,246,0.55), inset 0 0 0 1px rgba(139,92,246,0.6)"
                    : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
                transition={{ duration: current ? 1.4 : 0.5, repeat: current ? Infinity : 0 }}
                className={`relative h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-mono backdrop-blur ${
                  reached ? "bg-electric-violet/15 text-white" : "bg-graphite-800 text-white/40"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
                {current && (
                  <span className="absolute inset-0 rounded-full border border-electric-violet/60 animate-ping" />
                )}
              </m.div>
              <div className="mt-3 sm:mt-4">
                <div className={`text-[11px] sm:text-sm font-semibold tracking-wide uppercase ${reached ? "text-white" : "text-white/40"}`}>
                  {s.label}
                </div>
                <div className="hidden sm:block text-[10px] mt-1 font-mono uppercase tracking-wider text-white/30">
                  {s.hint}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
