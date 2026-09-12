import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export interface Template {
  id: string | number;
  name: string;
  postTypeId: string | number | null;
  html: string;
  css: string;
}

async function payload() {
  return getPayload({ config });
}

function relId(rel: unknown): string | number | null {
  if (!rel) return null;
  if (typeof rel === "object") return (rel as { id?: string | number }).id ?? null;
  return rel as string | number;
}

export async function readTemplateForPostType(
  postTypeId: string | number
): Promise<Template | null> {
  const p = await payload();
  const r = await p.find({
    collection: "templates",
    where: { postType: { equals: postTypeId } },
    limit: 1,
    depth: 0,
  });
  const doc = r.docs[0];
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    postTypeId: relId(doc.postType),
    html: doc.html ?? "",
    css: doc.css ?? "",
  };
}

export async function readTemplate(id: string | number): Promise<Template | null> {
  const p = await payload();
  const doc = await p.findByID({ collection: "templates", id, depth: 0 }).catch(() => null);
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    postTypeId: relId(doc.postType),
    html: doc.html ?? "",
    css: doc.css ?? "",
  };
}

export async function updateTemplateContent(input: {
  id: string | number;
  html?: string;
  css?: string;
}): Promise<Template> {
  const p = await payload();
  const u = await p.update({
    collection: "templates",
    id: input.id,
    data: {
      html: input.html ?? "",
      css: input.css ?? "",
    },
  });
  return {
    id: u.id,
    name: u.name,
    postTypeId: relId(u.postType),
    html: u.html ?? "",
    css: u.css ?? "",
  };
}
