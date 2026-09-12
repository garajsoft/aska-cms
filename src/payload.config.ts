import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ecommercePlugin, USD, EUR, GBP } from "@payloadcms/plugin-ecommerce";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
import sharp from "sharp";

import { Pages } from "./collections/Pages";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { PostTypes } from "./collections/PostTypes";
import { CustomFields } from "./collections/CustomFields";
import { Posts } from "./collections/Posts";
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
      title: "Aska CMS",
      titleSuffix: " · Aska",
    },
    components: {
      graphics: {
        Logo: "@/components/admin/Logo#Logo",
        Icon: "@/components/admin/Logo#Icon",
      },
    },
  },
  collections: [Pages, Posts, Templates, PostTypes, CustomFields, Users, Media],
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
