import { getPayload } from "payload";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RSS 2.0 feed of published blog posts at /feed.xml. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const p = await getPayload({ config });
  const r = await p.find({
    collection: "blog",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 50,
    depth: 1,
  });
  const docs = r.docs as unknown as {
    title: string;
    slug: string;
    excerpt?: string | null;
    metaDescription?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    tags?: string[] | null;
    category?: { name?: string } | number | string | null;
  }[];

  const items = docs
    .map((doc) => {
      const link = `${origin}/blog/${doc.slug}`;
      const description = doc.excerpt ?? doc.metaDescription ?? "";
      const pubDate = new Date(doc.publishedAt ?? doc.createdAt).toUTCString();
      const categoryNames = [
        ...(doc.category && typeof doc.category === "object" && doc.category.name
          ? [doc.category.name]
          : []),
        ...(doc.tags ?? []),
      ];
      return (
        `<item>` +
        `<title>${esc(doc.title)}</title>` +
        `<link>${esc(link)}</link>` +
        `<guid>${esc(link)}</guid>` +
        `<description>${esc(description)}</description>` +
        `<pubDate>${esc(pubDate)}</pubDate>` +
        categoryNames.map((c) => `<category>${esc(c)}</category>`).join("") +
        `</item>`
      );
    })
    .join("\n    ");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>aska Blog</title>\n` +
    `    <link>${esc(`${origin}/blog`)}</link>\n` +
    `    <description>Latest posts from the aska blog.</description>\n` +
    `    ${items}\n` +
    `  </channel>\n` +
    `</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
