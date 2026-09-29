import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";
import { preferred, themeFilter, themeScope } from "@/lib/themes/repo";

export type TemplateKind = "detail" | "index";

export interface Template {
  id: string | number;
  name: string;
  collectionSlug: string;
  kind: TemplateKind;
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
  kind?: string | null;
  html?: string | null;
  css?: string | null;
}): Template {
  return {
    id: doc.id,
    name: doc.name,
    collectionSlug: doc.collection,
    kind: doc.kind === "index" ? "index" : "detail",
    html: doc.html ?? "",
    css: doc.css ?? "",
  };
}

export async function readTemplateForCollection(
  collectionSlug: string,
  kind: TemplateKind = "detail"
): Promise<Template | null> {
  const p = await payload();
  const { activeThemeId } = await themeScope();
  const r = await p.find({
    collection: "templates",
    where: {
      and: [
        { collection: { equals: collectionSlug } },
        { kind: { equals: kind } },
        ...(activeThemeId != null ? [themeFilter(activeThemeId)] : []),
      ],
    },
    limit: 5,
    depth: 0,
  });
  const doc = preferred(r.docs, activeThemeId);
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
