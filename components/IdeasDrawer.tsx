"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { deleteIdea, listIdeas, type Idea } from "@/lib/ideas";

export function IdeasDrawer({
  open,
  onClose,
  refreshKey,
}: {
  open: boolean;
  onClose: () => void;
  refreshKey: number;
}) {
  const [items, setItems] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    listIdeas().then((data) => {
      if (!alive) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [open, refreshKey]);

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteIdea(id);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            className="fixed inset-0 z-40 bg-graphite-950/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-graphite-950/95 backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
                  ▸ saved ideas
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">Мои идеи</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Закрыть"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="h-[calc(100%-77px)] overflow-y-auto px-6 py-5 space-y-3">
              {loading && (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-xl border border-white/5 bg-white/[0.015] animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="mt-10 text-center">
                  <div className="text-sm text-white/50">Пока пусто.</div>
                  <div className="mt-1 text-xs text-white/30 leading-relaxed">
                    Введи идею на главном экране и нажми «развернуть» — мы сохраним её сюда.
                  </div>
                </div>
              )}

              {!loading &&
                items.map((it) => (
                  <div
                    key={it.id}
                    className="group rounded-xl border border-white/5 bg-white/[0.015] p-4 transition hover:border-electric-violet/30 hover:bg-electric-violet/[0.04]"
                  >
                    <Link
                      href={`/ideas/${it.id}`}
                      onClick={onClose}
                      className="block w-full text-left"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                        {new Date(it.created_at).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <p className="mt-1.5 text-sm text-white/85 leading-relaxed line-clamp-3">
                        {it.idea}
                      </p>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/30">
                        {it.assets?.length ?? 0} ассетов
                      </span>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/30 opacity-0 transition group-hover:opacity-100 hover:text-red-300"
                      >
                        удалить
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
