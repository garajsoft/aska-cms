import type { Payload } from "payload";

interface Seed {
  slug: string;
  singular: string;
  plural: string;
}

const DEFAULTS: Seed[] = [
  { slug: "blog", singular: "Blog Post", plural: "Blog Posts" },
  { slug: "products", singular: "Product", plural: "Products" },
];

/**
 * Idempotent: only creates rows whose slug is missing. Safe to call every boot.
 * These slugs surface automatically in the Templates picker so admins can build
 * theme templates for blog + products without defining the post types by hand.
 */
export async function seedDefaultPostTypes(payload: Payload): Promise<void> {
  for (const s of DEFAULTS) {
    const found = await payload.find({
      collection: "post-types",
      where: { slug: { equals: s.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs.length > 0) continue;
    await payload.create({ collection: "post-types", data: s });
    payload.logger.info(`Seeded default post type '${s.slug}'`);
  }
}
