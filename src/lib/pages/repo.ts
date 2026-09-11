import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export interface PageContent {
  id: string | number;
  title: string;
  slug: string;
  html: string;
  css: string;
}

async function payload() {
  return getPayload({ config });
}

export async function listPages(): Promise<PageContent[]> {
  const p = await payload();
  const r = await p.find({ collection: "pages", limit: 200, depth: 0, sort: "slug" });
  return r.docs.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    html: d.html ?? "",
    css: d.css ?? "",
  }));
}

export async function readPage(slug: string): Promise<PageContent | null> {
  const p = await payload();
  const r = await p.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const doc = r.docs[0];
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    html: doc.html ?? "",
    css: doc.css ?? "",
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
    depth: 0,
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
    return { id: u.id, title: u.title, slug: u.slug, html: u.html ?? "", css: u.css ?? "" };
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
  return { id: c.id, title: c.title, slug: c.slug, html: c.html ?? "", css: c.css ?? "" };
}
