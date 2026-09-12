import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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
        // One-time cleanup: drop legacy tables/enums from the old dynamic
        // post-types layer so drizzle push doesn't hit an interactive rename
        // prompt that would hang the container.
        // ponytail: remove this block once every environment has booted once.
        const drizzle = (
          payload.db as { drizzle?: { execute: (q: unknown) => Promise<unknown> } }
        ).drizzle;
        if (drizzle) {
          const { sql } = await import("drizzle-orm");
          for (const stmt of [
            'DROP TABLE IF EXISTS "posts_rels" CASCADE',
            'DROP TABLE IF EXISTS "_posts_v_rels" CASCADE',
            'DROP TABLE IF EXISTS "_posts_v" CASCADE',
            'DROP TABLE IF EXISTS "posts" CASCADE',
            'DROP TABLE IF EXISTS "post_types" CASCADE',
            'DROP TABLE IF EXISTS "custom_fields" CASCADE',
            'DROP TYPE IF EXISTS "enum_posts_status"',
            'DROP TYPE IF EXISTS "enum__posts_v_version_status"',
            'DROP TYPE IF EXISTS "enum_custom_fields_type"',
          ]) {
            try {
              await drizzle.execute(sql.raw(stmt));
            } catch (err) {
              payload.logger.warn({ err, stmt }, "Legacy cleanup drop failed");
            }
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
    ecommercePlugin({
      access: {
        adminOnlyFieldAccess: isSignedIn,
        adminOrPublishedStatus: isSignedIn,
        isAdmin: isSignedIn,
        isDocumentOwner: isSignedIn,
      },
      customers: { slug: Users.slug },
      products: true,
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
