"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import type { GeneratedAsset, Format } from "@/lib/generate";

const FORMAT_ICON: Record<Format, JSX.Element> = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M21 4L2 11L9 14M21 4L18 20L9 14M21 4L9 14L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 10L14 12L11 14V10Z" fill="currentColor" />
    </svg>
  ),
};

const FORMAT_ACCENT: Record<Format, string> = {
  youtube: "from-electric-violet to-fuchsia-500",
  telegram: "from-electric-blue to-electric-cyan",
  shorts: "from-electric-indigo to-electric-violet",
};

export function ContentCard({ asset, index }: { asset: GeneratedAsset; index: number }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(asset.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: index * 0.18, ease: [0.21, 0.61, 0.35, 1] }}
      className="relative"
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        className="glow-card relative rounded-2xl p-6 sm:p-7 overflow-hidden"
      >
        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${FORMAT_ACCENT[asset.format]} text-white shadow-lg shadow-electric-violet/20`}>
              {FORMAT_ICON[asset.format]}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{asset.title}</h3>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40 mt-0.5">{asset.badge}</div>
            </div>
          </div>
          <LeverageBadge score={asset.leverage} />
        </div>

        {/* Meta */}
        {asset.meta && (
          <div className="relative z-10 mt-4 text-[11px] font-mono uppercase tracking-wider text-white/40">
            {asset.meta}
          </div>
        )}

        {/* Body */}
        <div className="relative z-10 mt-5 rounded-xl border border-white/5 bg-black/30 p-4 sm:p-5">
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-white/85 max-h-[460px] overflow-auto">
            {asset.content}
          </pre>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-white/30">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            ready · client-mock
          </div>
          <button
            onClick={copy}
            className="group relative inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/80 transition-all hover:bg-white/[0.08] hover:border-electric-violet/40 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              {copied ? (
                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.6" />
                </>
              )}
            </svg>
            {copied ? "скопировано" : "копировать"}
          </button>
        </div>

        {/* Ambient glow */}
        <div className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${FORMAT_ACCENT[asset.format]} opacity-20 blur-3xl animate-pulse-glow`} />
      </div>
    </motion.div>
  );
}

function LeverageBadge({ score }: { score: number }) {
  const tone = score >= 92 ? "from-fuchsia-400 to-electric-violet" : score >= 85 ? "from-electric-indigo to-electric-blue" : "from-electric-blue to-electric-cyan";
  return (
    <div className="shrink-0 text-right">
      <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/40">Leverage</div>
      <div className={`mt-0.5 bg-gradient-to-r ${tone} bg-clip-text text-2xl font-bold tracking-tight text-transparent tabular-nums`}>
        {score}
        <span className="text-sm text-white/30 font-normal">/100</span>
      </div>
    </div>
  );
}
