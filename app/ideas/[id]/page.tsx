import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentCard } from "@/components/ContentCard";
import type { GeneratedAsset } from "@/lib/generate";

interface Row {
  id: string;
  idea: string;
  assets: GeneratedAsset[] | null;
  created_at: string;
}

export default async function IdeaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/?auth_required=1`);

  const { data, error } = await supabase
    .from("ideas")
    .select("id, idea, assets, created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) notFound();
  const row = data as Row;
  const assets = row.assets ?? [];
  const avgLeverage = assets.length
    ? Math.round(assets.reduce((a, b) => a + b.leverage, 0) / assets.length)
    : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.14),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            на главную
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">
            {new Date(row.created_at).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </header>

        <section className="mt-10 sm:mt-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric-violet/30 bg-electric-violet/[0.08] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-electric-violet/90">
            <span className="h-1.5 w-1.5 rounded-full bg-electric-violet shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
            saved idea · snapshot
          </div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            {row.idea}
          </h1>
          <p className="mt-5 text-sm sm:text-base text-white/45 leading-relaxed">
            Сохранённый снимок развернутой контент-системы. {assets.length} ассетов сгенерировано из этой идеи.
          </p>
        </section>

        {assets.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
                ▸ generated assets · {assets.length}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-emerald-300/80">
                avg leverage · {avgLeverage}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {assets.map((a, i) => (
                <div key={a.id} className={i === 0 ? "lg:col-span-2" : ""}>
                  <ContentCard asset={a} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-white/30">
          <div>idea · {row.id.slice(0, 8)}</div>
          <div>synapse · v0.1 · 2026</div>
        </footer>
      </div>
    </main>
  );
}
