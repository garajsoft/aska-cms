import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export interface Template {
  id: string | number;
  name: string;
  collectionSlug: string;
  html: string;
  css: string;
}

async function payload() {
  return getPayload({ config });
}

function mapDoc(doc: {
  id: string | number;
  name: string;
  collection: string;
  html?: string | null;
  css?: string | null;
}): Template {
  return {
    id: doc.id,
    name: doc.name,
    collectionSlug: doc.collection,
    html: doc.html ?? "",
    css: doc.css ?? "",
  };
}

export async function readTemplateForCollection(
  collectionSlug: string
): Promise<Template | null> {
  const p = await payload();
  const r = await p.find({
    collection: "templates",
    where: { collection: { equals: collectionSlug } },
    limit: 1,
    depth: 0,
  });
  const doc = r.docs[0];
  return doc ? mapDoc(doc as never) : null;
}

export async function readTemplate(id: string | number): Promise<Template | null> {
  const p = await payload();
  const doc = await p.findByID({ collection: "templates", id, depth: 0 }).catch(() => null);
  return doc ? mapDoc(doc as never) : null;
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
  return mapDoc(u as never);
}
