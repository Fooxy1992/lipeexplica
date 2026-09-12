import type { Metadata } from "next";
import { Play, ExternalLink } from "lucide-react";
import { reels, INSTAGRAM_URL } from "@/data/reels";
import { PageHeader } from "@/components/content/page-header";

export const metadata: Metadata = {
  title: "Vídeos",
  description:
    "Todos os reels do lipeexplica, ordenados por visualizações. Jiu-Jitsu explicado sem filtro.",
};

export default function VideosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conteúdo"
        title="Reels"
        subtitle="Todos os reels do lipeexplica, ordenados por visualizações."
      />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {reels.map((reel) => (
            <a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: reel.accent }}
              />
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span>Jiu-Jitsu</span>
                <span>60s</span>
              </div>
              <div>
                <div
                  className="mb-3 grid h-10 w-10 place-items-center rounded-full text-white transition group-hover:scale-110"
                  style={{ background: "var(--royal)" }}
                >
                  <Play className="h-4 w-4 fill-current" />
                </div>
                <p className="font-display text-base font-semibold leading-snug">
                  {reel.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reel.views} visualizações
                </p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--royal)] px-6 py-3 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            Seguir no Instagram
          </a>
        </div>
      </section>
    </>
  );
}
