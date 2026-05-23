"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  function close() {
    if (status === "sending") return;
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
      setErrorMsg("");
    }, 250);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-graphite-950/80 backdrop-blur-md"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-md glow-card rounded-2xl p-1.5 glow-ring"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-xl bg-graphite-900/95 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-2 mb-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
                    ▸ sign in · magic link
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-white">Войти в Synapse</h2>
                </div>
                <button
                  onClick={close}
                  disabled={status === "sending"}
                  className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                  aria-label="Закрыть"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {status === "sent" ? (
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200/90 leading-relaxed">
                  Ссылка отправлена на <span className="font-mono text-emerald-100">{email}</span>.
                  Открой письмо и перейди по ссылке — вернёшься сюда уже залогиненным.
                </div>
              ) : (
                <form onSubmit={sendLink} className="space-y-4">
                  <p className="text-sm text-white/55 leading-relaxed">
                    Введи email — пришлём одноразовую ссылку. Никаких паролей.
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-electric-violet/50 focus:bg-white/[0.04]"
                  />
                  {status === "error" && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/[0.06] px-3 py-2 text-xs text-red-300">
                      {errorMsg || "Не удалось отправить ссылку. Попробуй ещё раз."}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === "sending" || !email.trim()}
                    className="w-full rounded-lg bg-gradient-to-r from-electric-violet via-electric-indigo to-electric-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-electric-violet/30 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === "sending" ? "отправляю…" : "прислать ссылку"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
