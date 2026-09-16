import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { ecommercePlugin, USD, EUR, GBP } from "@payloadcms/plugin-ecommerce";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
import sharp from "sharp";

import { Pages } from "./collections/Pages";
import { Blog } from "./collections/Blog";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Templates } from "./collections/Templates";
import { Settings } from "./globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Simple starter access: any signed-in user is admin. Tighten before shipping.
const isSignedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

// The ecommerce plugin builds its per-currency price fields as NAMELESS group
// fields whose inner fields are `priceInUSDEnabled` / `priceInUSD` etc. — so a
// name-based filter never matches. Detect them by their serialized children.
const isCurrencyPriceGroup = (f: unknown): boolean =>
  typeof f === "object" &&
  f !== null &&
  (f as { type?: string }).type === "group" &&
  JSON.stringify(f).includes('"priceIn');

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      title: "åska CMS",
      titleSuffix: " · åska",
    },
    components: {
      Nav: "@/components/admin/Nav#AskaNav",
      graphics: {
        Logo: "@/components/admin/Logo#Logo",
        Icon: "@/components/admin/Logo#Icon",
      },
      beforeDashboard: [
        "@/components/admin/dashboard/AskaDashboard#AskaDashboard",
      ],
    },
  },
  collections: [Pages, Blog, Templates, Users, Media],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    push: true,
  }),
  sharp,
  onInit: async (payload) => {
    if (process.env.NODE_ENV === "production") {
      try {
        // One-time cleanup: reset the public schema so drizzle push doesn't
        // hit interactive rename prompts (no TTY in the container = boot
        // hangs forever). Guarded by RESET_SCHEMA_ON_BOOT=1 env — set it,
        // deploy, watch it boot clean, then unset it.
        // ponytail: destroys ALL data; only run on empty/dev environments.
        if (process.env.RESET_SCHEMA_ON_BOOT === "1") {
          const drizzle = (
            payload.db as { drizzle?: { execute: (q: unknown) => Promise<unknown> } }
          ).drizzle;
          if (drizzle) {
            const { sql } = await import("drizzle-orm");
            payload.logger.warn("RESET_SCHEMA_ON_BOOT=1 — dropping public schema");
            await drizzle.execute(
              sql.raw("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;")
            );
          }
        }

        const { pushDevSchema } = await import("@payloadcms/drizzle");
        // @ts-expect-error payload.db is the drizzle adapter; type not re-exported
        await pushDevSchema(payload.db);
        payload.logger.info("Payload schema pushed to Postgres");
      } catch (err) {
        payload.logger.error({ err }, "Schema push failed");
      }
    }
  },
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
    ecommercePlugin({
      access: {
        adminOnlyFieldAccess: isSignedIn,
        adminOrPublishedStatus: isSignedIn,
        isAdmin: isSignedIn,
        isDocumentOwner: isSignedIn,
      },
      customers: { slug: Users.slug },
      products: {
        // The plugin's default products collection only has inventory + per-currency
        // price groups — no name/slug/description/images, so products were barely
        // editable and the storefront (/products/[slug]) couldn't resolve anything.
        // Add the merchandising fields, replace the per-currency price groups with a
        // single `price`, and keep every other default field (inventory, variants).
        // Currencies are managed in Settings → Currencies.
        productsCollectionOverride: ({ defaultCollection }) => {
          const fields = defaultCollection.fields.filter((f) => !isCurrencyPriceGroup(f));
          // Point the variants join columns at the new single-price field.
          const variantsJoin = fields.find(
            (f) => "name" in f && f.name === "variants" && "admin" in f
          );
          if (variantsJoin) {
            (variantsJoin.admin as { defaultColumns?: string[] }).defaultColumns = [
              "title",
              "options",
              "inventory",
              "price",
              "_status",
            ];
          }
          return {
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              useAsTitle: "name",
              defaultColumns: ["name", "slug", "price", "_status", "updatedAt"],
              listSearchableFields: ["name", "slug"],
            },
            fields: [
              { name: "name", type: "text", required: true },
              {
                name: "slug",
                type: "text",
                required: true,
                unique: true,
                index: true,
                admin: { description: "URL segment: /products/<slug>." },
              },
              {
                name: "description",
                type: "richText",
                label: "Description",
              },
              {
                name: "images",
                type: "upload",
                relationTo: "media",
                hasMany: true,
              },
              {
                type: "tabs",
                tabs: [
                  {
                    label: "Pricing & Inventory",
                    fields: [
                      {
                        name: "price",
                        type: "number",
                        required: true,
                        min: 0,
                        admin: {
                          description:
                            "In the site's default currency — set under Settings → Currencies.",
                        },
                      },
                      {
                        name: "cost",
                        type: "number",
                        min: 0,
                        admin: { description: "Cost to your business (for profit calculation)." },
                      },
                      {
                        name: "salePrice",
                        type: "number",
                        min: 0,
                        admin: { description: "Discounted price if on sale. Leave empty for regular price." },
                      },
                      {
                        name: "featured",
                        type: "checkbox",
                        defaultValue: false,
                        admin: { description: "Show on homepage and featured sections." },
                      },
                    ],
                  },
                  {
                    label: "Organization",
                    fields: [
                      {
                        name: "category",
                        type: "select",
                        options: [
                          { label: "Electronics", value: "electronics" },
                          { label: "Clothing", value: "clothing" },
                          { label: "Books", value: "books" },
                          { label: "Home & Garden", value: "home" },
                          { label: "Sports", value: "sports" },
                          { label: "Other", value: "other" },
                        ],
                        admin: { description: "Product category." },
                      },
                      {
                        name: "tags",
                        type: "array",
                        fields: [
                          { name: "tag", type: "text", required: true },
                        ],
                        admin: { description: "Search and filtering tags." },
                      },
                      {
                        name: "relatedProducts",
                        type: "relationship",
                        relationTo: "products",
                        hasMany: true,
                        admin: { description: "Products to show as recommendations." },
                      },
                    ],
                  },
                  {
                    label: "Details",
                    fields: [
                      {
                        name: "sku",
                        type: "text",
                        unique: true,
                        admin: { description: "Stock keeping unit (must be unique)." },
                      },
                      {
                        type: "group",
                        name: "dimensions",
                        label: "Dimensions & Weight",
                        fields: [
                          { name: "length", type: "number", admin: { description: "cm" } },
                          { name: "width", type: "number", admin: { description: "cm" } },
                          { name: "height", type: "number", admin: { description: "cm" } },
                          { name: "weight", type: "number", admin: { description: "kg" } },
                        ],
                      },
                      {
                        name: "material",
                        type: "text",
                        admin: { description: "Primary material or composition." },
                      },
                      {
                        name: "color",
                        type: "text",
                        admin: { description: "Color or available colors." },
                      },
                    ],
                  },
                  {
                    label: "SEO",
                    fields: [
                      {
                        name: "metaTitle",
                        type: "text",
                        maxLength: 60,
                        admin: { description: "Search result title (60 chars max)." },
                      },
                      {
                        name: "metaDescription",
                        type: "textarea",
                        maxLength: 160,
                        admin: { description: "Search result description (160 chars max)." },
                      },
                      {
                        name: "keywords",
                        type: "textarea",
                        admin: { description: "Comma-separated keywords for search." },
                      },
                    ],
                  },
                  {
                    label: "Supplier",
                    fields: [
                      {
                        name: "supplier",
                        type: "text",
                        admin: { description: "Supplier or vendor name." },
                      },
                      {
                        name: "supplierSku",
                        type: "text",
                        admin: { description: "Supplier's product code." },
                      },
                      {
                        name: "leadTime",
                        type: "number",
                        admin: { description: "Days to reorder from supplier." },
                      },
                    ],
                  },
                ],
              },
              ...fields,
            ],
          };
        },
        variants: {
          // Same pricing simplification for variants: one `price` instead of the
          // per-currency groups.
          variantsCollectionOverride: ({ defaultCollection }) => ({
            ...defaultCollection,
            fields: [
              ...defaultCollection.fields.filter((f) => !isCurrencyPriceGroup(f)),
              {
                name: "price",
                type: "number",
                min: 0,
                admin: {
                  description:
                    "In the site's default currency — set under Settings → Currencies.",
                },
              },
            ],
          }),
        },
      },
      currencies: {
        supportedCurrencies: [USD, EUR, GBP],
        defaultCurrency: "USD",
      },
      payments: {
        paymentMethods: [
          stripeAdapter({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
            secretKey: process.env.STRIPE_SECRET_KEY || "",
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
          }),
        ],
      },
    }),
  ],
});
