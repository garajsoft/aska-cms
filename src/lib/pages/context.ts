import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { PageContent } from "./repo";

/**
 * Render context for a page: its own fields plus the collections page
 * templates loop over ({{#each posts}} / {{#each products}}).
 */
export async function pageRenderContext(
  page: PageContent
): Promise<Record<string, unknown>> {
  const p = await getPayload({ config });
  const [posts, products] = await Promise.all([
    p.find({
      collection: "blog",
      where: { _status: { equals: "published" } },
      limit: 20,
      depth: 1,
      sort: "-publishedAt",
    }),
    p.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      limit: 20,
      depth: 1,
    }),
  ]);
  return {
    title: page.title,
    slug: page.slug,
    metaDescription: page.metaDescription,
    posts: posts.docs,
    products: products.docs,
  };
}
