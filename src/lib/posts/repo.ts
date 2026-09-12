import "server-only";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";

export interface PostRecord {
  id: string | number;
  title: string;
  slug: string;
  postTypeId: string | number | null;
  postTypeSlug: string | null;
  metaDescription: string;
  shareImageUrl: string | null;
  fields: Record<string, unknown>;
}

async function payload() {
  return getPayload({ config });
}

function relId(rel: unknown): string | number | null {
  if (!rel) return null;
  if (typeof rel === "object") return (rel as { id?: string | number }).id ?? null;
  return rel as string | number;
}
function relSlug(rel: unknown): string | null {
  if (!rel || typeof rel !== "object") return null;
  return (rel as { slug?: string }).slug ?? null;
}
function shareImageUrl(u: unknown): string | null {
  if (!u || typeof u !== "object") return null;
  return (u as { url?: string }).url ?? null;
}

export async function readPostByPath(
  postTypeSlug: string,
  slug: string,
  opts: { publishedOnly?: boolean } = {}
): Promise<PostRecord | null> {
  const p = await payload();
  const pt = await p.find({
    collection: "post-types",
    where: { slug: { equals: postTypeSlug } },
    limit: 1,
    depth: 0,
  });
  const postType = pt.docs[0];
  if (!postType) return null;

  const where: Where = opts.publishedOnly
    ? {
        slug: { equals: slug },
        postType: { equals: postType.id },
        _status: { equals: "published" },
      }
    : { slug: { equals: slug }, postType: { equals: postType.id } };

  const r = await p.find({
    collection: "posts",
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
    postTypeId: postType.id,
    postTypeSlug,
    metaDescription: doc.metaDescription ?? "",
    shareImageUrl: shareImageUrl(doc.shareImage),
    fields: (doc.fields as Record<string, unknown>) ?? {},
  };
}
