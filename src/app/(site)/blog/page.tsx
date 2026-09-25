import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@/payload.config";
import { readTemplateForCollection } from "@/lib/templates/repo";
import { renderTemplate } from "@/lib/templates/render";
import { flattenLexical } from "@/lib/templates/flatten";
import { getBrandingAssets } from "@/lib/settings/repo";
import { RenderedHtml } from "@/components/RenderedHtml";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Blog" };

interface Props {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

const PAGE_SIZE = 9;

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page: pageRaw, category: categorySlug, tag } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const p = await getPayload({ config });

  const where: Where = { _status: { equals: "published" } };
  let categoryName = "";
  if (categorySlug) {
    const cat = await p.find({
      collection: "categories",
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    });
    const doc = cat.docs[0] as { id: number; name?: string } | undefined;
    if (doc) {
      where.category = { equals: doc.id };
      categoryName = doc.name ?? "";
    } else {
      where.id = { equals: -1 }; // unknown slug → no results, not a 500
    }
  }
  if (tag) where.tags = { contains: tag };

  // Featured first, then newest. Boolean sort desc puts true before false.
  const [posts, total] = await Promise.all([
    p.find({
      collection: "blog",
      where,
      sort: "-featured,-publishedAt",
      limit: PAGE_SIZE,
      page,
      depth: 1,
      draft: false,
    }),
    p.count({ collection: "blog", where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total.totalDocs / PAGE_SIZE));
  const items = posts.docs.map((doc) => {
    const flat = flattenLexical(doc as unknown as Record<string, unknown>);
    const slug = String(flat.slug ?? "");
    return {
      ...flat,
      slug,
      title: String(flat.title ?? ""),
      excerpt: typeof flat.excerpt === "string" ? flat.excerpt : "",
      url: `/blog/${slug}`,
    };
  });

  const settings = await getBrandingAssets();
  const template = await readTemplateForCollection("blog", "index");
  if (template) {
    const context: Record<string, unknown> = {
      posts: items,
      page,
      totalPages,
      categoryName,
      tagName: tag ?? "",
      settings,
      paginationHtml: paginationHtml(page, totalPages, categorySlug, tag),
    };
    let rendered = renderTemplate(template.html, context);
    if (!template.html.includes("{{{paginationHtml}}}")) {
      rendered += paginationHtml(page, totalPages, categorySlug, tag);
    }
    return (
      <>
        {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
        <RenderedHtml html={rendered} />
      </>
    );
  }

  // Built-in minimal fallback: grid of title links + prev/next pagination.
  const heading = categoryName
    ? `Category: ${categoryName}`
    : tag
      ? `Tag: ${tag}`
      : "Blog";
  return (
    <main style={{ maxWidth: 1024, margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>{heading}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {items.map((post) => (
          <Link
            key={String(post.slug)}
            href={`/blog/${String(post.slug)}`}
            style={{ display: "block", padding: 16, border: "1px solid #e2e2e2", borderRadius: 8 }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{String(post.title ?? "")}</h2>
            {typeof post.excerpt === "string" && <p style={{ margin: 0, color: "#555" }}>{post.excerpt}</p>}
          </Link>
        ))}
      </div>
      {items.length === 0 && <p>No posts found.</p>}
      <RenderedHtml html={paginationHtml(page, totalPages, categorySlug, tag)} />
    </main>
  );
}

function paginationHtml(
  page: number,
  totalPages: number,
  categorySlug?: string,
  tag?: string
): string {
  if (totalPages <= 1) return "";
  const qs = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (categorySlug) params.set("category", categorySlug);
    if (tag) params.set("tag", tag);
    const s = params.toString();
    return s ? `?${s}` : "";
  };
  const link = (p: number, label: string) =>
    `<a href="/blog${qs(p)}" style="padding:4px 10px;border:1px solid #ddd;border-radius:4px;text-decoration:none">${label}</a>`;
  const parts: string[] = [];
  if (page > 1) parts.push(link(page - 1, "← Newer"));
  parts.push(`<span style="padding:4px 10px">Page ${page} of ${totalPages}</span>`);
  if (page < totalPages) parts.push(link(page + 1, "Older →"));
  return `<nav style="display:flex;gap:8px;align-items:center;justify-content:center;margin:2rem 0">${parts.join("")}</nav>`;
}
