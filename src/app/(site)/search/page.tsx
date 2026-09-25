import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false } };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

/** Wrap query occurrences in <mark> (call only with an already-escaped string). */
function highlight(text: string, q: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (!q) return escaped;
  const needle = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${needle})`, "gi"), "<mark>$1</mark>");
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        <h1>Search</h1>
        <form action="/search" method="get" role="search">
          <input
            type="search"
            name="q"
            placeholder="Search the site…"
            aria-label="Search"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 }}
          />
        </form>
      </main>
    );
  }

  const p = await getPayload({ config });
  const contains = { contains: query };
  const [blog, pages, products] = await Promise.all([
    p.find({
      collection: "blog",
      where: {
        and: [
          { _status: { equals: "published" } },
          { or: [{ title: contains }, { excerpt: contains }] },
        ],
      },
      sort: "-publishedAt",
      limit: 20,
      depth: 0,
    }),
    p.find({
      collection: "pages",
      where: { title: contains },
      sort: "-updatedAt",
      limit: 20,
      depth: 0,
    }),
    p.find({
      collection: "products",
      where: {
        and: [{ _status: { equals: "published" } }, { name: contains }],
      },
      sort: "name",
      limit: 20,
      depth: 0,
    }),
  ]);

  type Result = { href: string; title: string; excerpt?: string | null };
  const blogResults: Result[] = (blog.docs as unknown as { slug: string; title: string; excerpt?: string | null }[]).map(
    (d) => ({ href: `/blog/${d.slug}`, title: d.title, excerpt: d.excerpt })
  );
  const pageResults: Result[] = (pages.docs as unknown as { slug: string; title: string }[]).map(
    (d) => ({ href: `/${d.slug}`, title: d.title })
  );
  const productResults: Result[] = (products.docs as unknown as { slug: string; name: string }[]).map(
    (d) => ({ href: `/products/${d.slug}`, title: d.name })
  );
  const total = blogResults.length + pageResults.length + productResults.length;

  const section = (heading: string, results: Result[]) =>
    results.length > 0 && (
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, textTransform: "uppercase", letterSpacing: "0.05em", color: "#777" }}>
          {heading}
        </h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href} style={{ fontWeight: 600 }}>
                <span dangerouslySetInnerHTML={{ __html: highlight(r.title, query) }} />
              </Link>
              {r.excerpt && (
                <p
                  style={{ margin: "4px 0 0", color: "#555" }}
                  dangerouslySetInnerHTML={{ __html: highlight(r.excerpt, query) }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>Search</h1>
      <form action="/search" method="get" role="search" style={{ display: "flex", gap: 8 }}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Search"
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button type="submit" style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #333" }}>
          Search
        </button>
      </form>
      <p style={{ color: "#777" }}>
        {total === 0 ? `No results for “${query}”.` : `${total} result${total === 1 ? "" : "s"} for “${query}”.`}
      </p>
      {section("Blog posts", blogResults)}
      {section("Pages", pageResults)}
      {section("Products", productResults)}
    </main>
  );
}
