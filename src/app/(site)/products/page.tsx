import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@/payload.config";
import { readTemplateForCollection } from "@/lib/templates/repo";
import { renderTemplate } from "@/lib/templates/render";
import { flattenLexical } from "@/lib/templates/flatten";
import { getBrandingAssets } from "@/lib/settings/repo";
import { RenderedHtml } from "@/components/RenderedHtml";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 9;

export default async function ProductsIndexPage({ searchParams }: Props) {
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const p = await getPayload({ config });
  const where = { _status: { equals: "published" } };
  const [products, total] = await Promise.all([
    p.find({
      collection: "products",
      where,
      sort: "name",
      limit: PAGE_SIZE,
      page,
      depth: 1,
    }),
    p.count({ collection: "products", where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total.totalDocs / PAGE_SIZE));
  const items = products.docs.map((doc) => {
    const flat = flattenLexical(doc as unknown as Record<string, unknown>);
    const slug = String(flat.slug ?? "");
    return { ...flat, slug, name: String(flat.name ?? ""), url: `/products/${slug}` };
  });

  const settings = await getBrandingAssets();
  const template = await readTemplateForCollection("products", "index");
  if (template) {
    const context: Record<string, unknown> = {
      products: items,
      page,
      totalPages,
      settings,
      paginationHtml: paginationHtml(page, totalPages),
    };
    let rendered = renderTemplate(template.html, context);
    if (!template.html.includes("{{{paginationHtml}}}")) {
      rendered += paginationHtml(page, totalPages);
    }
    return (
      <>
        {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
        <RenderedHtml html={rendered} />
      </>
    );
  }

  // Built-in minimal fallback: grid of title links + prev/next pagination.
  return (
    <main style={{ maxWidth: 1024, margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>Products</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {items.map((product) => (
          <Link
            key={String(product.slug)}
            href={`/products/${String(product.slug)}`}
            style={{ display: "block", padding: 16, border: "1px solid #e2e2e2", borderRadius: 8 }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{String(product.name ?? "")}</h2>
          </Link>
        ))}
      </div>
      {items.length === 0 && <p>No products found.</p>}
      <RenderedHtml html={paginationHtml(page, totalPages)} />
    </main>
  );
}

function paginationHtml(page: number, totalPages: number): string {
  if (totalPages <= 1) return "";
  const link = (p: number, label: string) =>
    `<a href="/products${p > 1 ? `?page=${p}` : ""}" style="padding:4px 10px;border:1px solid #ddd;border-radius:4px;text-decoration:none">${label}</a>`;
  const parts: string[] = [];
  if (page > 1) parts.push(link(page - 1, "← Newer"));
  parts.push(`<span style="padding:4px 10px">Page ${page} of ${totalPages}</span>`);
  if (page < totalPages) parts.push(link(page + 1, "Older →"));
  return `<nav style="display:flex;gap:8px;align-items:center;justify-content:center;margin:2rem 0">${parts.join("")}</nav>`;
}
