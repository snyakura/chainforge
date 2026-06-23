import { createServerFn } from "@tanstack/react-start";

export type ForexNewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
  image?: string;
};

/** Strip HTML tags and decode the small set of entities we actually see in RSS. */
function clean(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extract(item: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = item.match(re);
  return m ? clean(m[1]) : "";
}

/** Pull an image URL from media:content, media:thumbnail, enclosure, or first <img> in description. */
function extractImage(raw: string): string | undefined {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/i,
    /<image>\s*<url>([^<]+)<\/url>/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

export const getForexNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: ForexNewsItem[]; error?: string }> => {
    const feeds = [
      "https://www.fxstreet.com/rss/news",
      "https://www.fxstreet.com/rss/analysis",
    ];

    const items: ForexNewsItem[] = [];

    for (const url of feeds) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ChainForgeBot/1.0)",
            Accept: "application/rss+xml, application/xml, text/xml",
          },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const rawItems = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
        for (const raw of rawItems) {
          items.push({
            title: extract(raw, "title"),
            link: extract(raw, "link"),
            description: extract(raw, "description").slice(0, 320),
            pubDate: extract(raw, "pubDate"),
            category: extract(raw, "category") || undefined,
            image: extractImage(raw),
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
