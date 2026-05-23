"use client";

import { useState } from "react";
import { useUser } from "./UserProvider";
import { LoginModal } from "./LoginModal";

export function AuthButton({ onOpenIdeas }: { onOpenIdeas: () => void }) {
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-full border border-white/10 bg-white/[0.02] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full border border-electric-violet/40 bg-electric-violet/[0.08] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-electric-violet/[0.14] hover:border-electric-violet/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-electric-violet shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
          войти в приложение
        </button>
        <LoginModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  const initial = (user.email?.[0] || "?").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenIdeas}
        className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-white/60 transition hover:border-white/20 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        мои идеи
      </button>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] py-1 pl-1 pr-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-electric-violet to-electric-blue text-[11px] font-semibold text-white">
          {initial}
        </div>
        <span className="hidden md:inline text-[11px] font-mono text-white/60 truncate max-w-[140px]">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/40 transition hover:text-white"
          title="Выйти"
        >
          выйти
        </button>
      </div>
    </div>
  );
}
