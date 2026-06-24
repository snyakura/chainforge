import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";

// ==========================================
// 1. Types & Server Function (Forex Feed)
// ==========================================

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

// Kept the handler syntax completely standard so the compiler doesn't choke
export const getForexNews = createServerFn({ method: "GET" }).handler(
  async () => {
    const feeds = [
      "https://www.forexlive.com/feed",
      "https://finance.yahoo.com/news/provider-forexlive/rss",
    ];
    const items: ForexNewsItem[] = [];

    for (const url of feeds) {
      try {
        // Removed the 'as any' casting that broke the TanStack compiler parser
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
        console.error("Feed failed to fetch:", url, e);
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
  }
);

// ==========================================
// 2. Custom Safe Client-Only Wrapper Component
// ==========================================

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ==========================================
// 3. Example Usage Component
// ==========================================

interface ForexFeedViewProps {
  newsData: { items: ForexNewsItem[]; error?: string };
}

export function ForexFeedView({ newsData }: ForexFeedViewProps) {
  return (
    <div style={{ padding: "1rem" }}>
      <h2>Forex News Feed</h2>

      <ClientOnly fallback={<p>Loading latest dope feed...</p>}>
        {newsData?.error ? (
          <p style={{ color: "red" }}>{newsData.error}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {newsData?.items?.map((item) => (
              <article key={item.link} style={{ borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }} 
                  />
                )}
                <h3 style={{ margin: "0.5rem 0" }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>{item.description}</p>
                <small style={{ color: "#888" }}>{item.pubDate}</small>
              </article>
            ))}
          </div>
        )}
      </ClientOnly>
    </div>
  );
}
