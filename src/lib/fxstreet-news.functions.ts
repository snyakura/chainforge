import { createServerFn } from "@tanstack/react-start";

export type ForexNewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
  image?: string;
};

export const getForexNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: ForexNewsItem[]; error?: string }> => {
    const feeds = [
      "https://www.fxstreet.com/rss/news",
      "https://www.fxstreet.com/rss/analysis",
    ];

    const items: ForexNewsItem[] = [];

    for (const url of feeds) {
      try {
        // Using a free open proxy so Vercel doesn't get blocked by FXStreet
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) continue;
        
        const data = await res.json();
        if (!data.items) continue;

        for (const raw of data.items) {
          items.push({
            title: raw.title || "",
            link: raw.link || "",
            description: (raw.description || "").replace(/<[^>]+>/g, "").slice(0, 320),
            pubDate: raw.pubDate || new Date().toISOString(),
            category: raw.categories?.[0] || undefined,
            image: raw.thumbnail || raw.enclosure?.link || undefined,
          });
        }
      } catch (e) {
        console.error("fxstreet feed failed:", url, e);
      }
    }

    if (items.length === 0) {
      return { items: [], error: "Live feed temporarily unavailable." };
    }

    const seen = new Set<string>();
    const unique = items.filter((it) => {
      if (seen.has(it.link)) return false;
      seen.add(it.link);
      return Boolean(it.title && it.link);
    });
    
    unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return { items: unique.slice(0, 40) };
  },
);
