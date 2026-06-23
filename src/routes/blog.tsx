"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper, Clock, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { PageBackground } from "@/components/page-background";
import { getForexNews } from "@/lib/fxstreet-news.functions";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Forex News & Analysis — ChainForge Blog" },
      {
        name: "description",
        content:
          "Live forex news, market analysis and trading insights sourced from FXStreet, curated by the ChainForge desk.",
      },
      { property: "og:title", content: "Forex News — ChainForge Blog" },
      {
        property: "og:description",
        content: "Real-time forex news and analysis from the desk.",
      },
    ],
  }),
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["forex-news"],
      queryFn: () => getForexNews(),
    });
  },
  component: BlogPage,
});

function formatDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BlogPage() {
  const fetchNews = useServerFn(getForexNews);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["forex-news"],
    queryFn: () => fetchNews(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const items = data?.items ?? [];

  return (
    <>
      <section className="relative">
        <PageBackground variant="soft" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-10 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow font-['Montserrat']">
              Market Pulse
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display mt-5 text-5xl md:text-6xl font-['Montserrat']">
              <span className="text-gradient">Forex News</span>{" "}
              <span className="text-accent-gradient">& Analysis.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-sm md:text-base">
              Live institutional news feed sourced from FXStreet — refreshed every five minutes
              straight to your dashboard.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <button
              onClick={() => refetch()}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground hover:border-primary-glow/50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing" : "Refresh Feed"}
            </button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-3xl border border-border bg-card/20 backdrop-blur-sm animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/20 p-10 text-center text-muted-foreground">
            <Newspaper className="mx-auto mb-3 h-6 w-6 opacity-60" />
            {data?.error ?? "No articles available right now."}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <a
                key={it.link}
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card-animated group relative flex flex-col rounded-3xl overflow-hidden"
              >
                {it.image && (
                  <div className="relative h-40 w-full overflow-hidden bg-black/40">
                    <img
                      src={it.image}
                      alt={it.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground/70 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatDate(it.pubDate)}
                    </span>
                    {it.category && (
                      <span className="rounded-full bg-primary-glow/10 px-2 py-0.5 text-[9px] text-primary-glow">
                        {it.category}
                      </span>
                    )}
                  </div>
                  <h2 className="font-['Montserrat'] text-base font-semibold leading-snug text-foreground line-clamp-3 group-hover:text-primary-glow">
                    {it.title}
                  </h2>
                  {it.description && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {it.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-primary-glow opacity-0 transition-opacity group-hover:opacity-100">
                    Read on FXStreet <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-mono">
          News &copy; FXStreet — aggregated for ChainForge clients
        </p>
      </section>
    </>
  );
}
