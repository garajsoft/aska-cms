import "server-only";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";
import { preferred, themeFilter, themeScope } from "@/lib/themes/repo";

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
  const { activeThemeId } = await themeScope();
  const r = await p.find({
    collection: "pages",
    limit: 200,
    depth: 1,
    sort: "slug",
    ...(activeThemeId != null ? { where: themeFilter(activeThemeId) } : {}),
  });
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
  const { activeThemeId } = await themeScope();
  const base: Where = opts.publishedOnly
    ? { slug: { equals: slug }, _status: { equals: "published" } }
    : { slug: { equals: slug } };
  const where: Where = {
    and: [base, ...(activeThemeId != null ? [themeFilter(activeThemeId)] : [])],
  };
  const r = await p.find({
    collection: "pages",
    where,
    limit: 5,
    depth: 1,
    draft: !opts.publishedOnly,
  });
  const doc = preferred(r.docs, activeThemeId);
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
  const { activeThemeId } = await themeScope();
  const scoped = await p.find({
    collection: "pages",
    where: {
      and: [
        { slug: { equals: input.slug } },
        ...(activeThemeId != null ? [themeFilter(activeThemeId)] : []),
      ],
    },
    limit: 5,
    depth: 1,
  });
  // Fall back to the shared (untagged) page with this slug so editing it via
  // the editor doesn't try to recreate it and hit the unique-slug constraint.
  const shared = await p.find({
    collection: "pages",
    where: { and: [{ slug: { equals: input.slug } }, { theme: { exists: false } }] },
    limit: 1,
    depth: 1,
  });
  const current = preferred([...scoped.docs, ...shared.docs], activeThemeId);
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
      ...(activeThemeId != null ? { theme: activeThemeId } : {}),
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
