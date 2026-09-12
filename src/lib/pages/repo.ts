import "server-only";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";

export interface PageContent {
  id: string | number;
  title: string;
  slug: string;
  html: string;
  css: string;
  metaDescription: string;
  shareImageUrl: string | null;
}

async function payload() {
  return getPayload({ config });
}

function shareImageUrl(shareImage: unknown): string | null {
  if (!shareImage || typeof shareImage !== "object") return null;
  const url = (shareImage as { url?: string }).url;
  return url ?? null;
}

export async function listPages(): Promise<PageContent[]> {
  const p = await payload();
  const r = await p.find({ collection: "pages", limit: 200, depth: 1, sort: "slug" });
  return r.docs.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    html: d.html ?? "",
    css: d.css ?? "",
    metaDescription: d.metaDescription ?? "",
    shareImageUrl: shareImageUrl(d.shareImage),
  }));
}

export async function readPage(
  slug: string,
  opts: { publishedOnly?: boolean } = {}
): Promise<PageContent | null> {
  const p = await payload();
  const where: Where = opts.publishedOnly
    ? { slug: { equals: slug }, _status: { equals: "published" } }
    : { slug: { equals: slug } };
  const r = await p.find({
    collection: "pages",
    where,
    limit: 1,
    depth: 1,
    draft: !opts.publishedOnly,
  });
  const doc = r.docs[0];
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    html: doc.html ?? "",
    css: doc.css ?? "",
    metaDescription: doc.metaDescription ?? "",
    shareImageUrl: shareImageUrl(doc.shareImage),
  };
}

export async function upsertPage(input: {
  slug: string;
  title?: string;
  html?: string;
  css?: string;
}): Promise<PageContent> {
  const p = await payload();
  const existing = await p.find({
    collection: "pages",
    where: { slug: { equals: input.slug } },
    limit: 1,
    depth: 1,
  });
  const current = existing.docs[0];
  if (current) {
    const u = await p.update({
      collection: "pages",
      id: current.id,
      data: {
        title: input.title ?? current.title,
        html: input.html ?? current.html ?? "",
        css: input.css ?? current.css ?? "",
      },
    });
    return {
      id: u.id,
      title: u.title,
      slug: u.slug,
      html: u.html ?? "",
      css: u.css ?? "",
      metaDescription: u.metaDescription ?? "",
      shareImageUrl: shareImageUrl(u.shareImage),
    };
  }
  const c = await p.create({
    collection: "pages",
    data: {
      title: input.title ?? input.slug,
      slug: input.slug,
      html: input.html ?? "",
      css: input.css ?? "",
    },
  });
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    html: c.html ?? "",
    css: c.css ?? "",
    metaDescription: c.metaDescription ?? "",
    shareImageUrl: shareImageUrl(c.shareImage),
  };
}
