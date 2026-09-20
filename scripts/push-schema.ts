import { getPayload } from "payload";
import { pushDevSchema } from "@payloadcms/drizzle";
import { sql } from "drizzle-orm";
import config from "../src/payload.config";

// One-off schema push for hosted environments (Vercel serverless runtime
// can't load drizzle-kit at runtime, so onInit push fails there).
// Run via: npx jiti scripts/push-schema.ts  (see .github/workflows/push-schema.yml)
//
// drizzle-kit's push blocks on an interactive prompt whenever a table has
// BOTH new and deleted columns at once (it can't tell if that's a create or
// a rename) — and it must resolve every such prompt across every table
// before it applies ANYTHING, so one ambiguous table blocks the whole push,
// including totally unrelated new tables. There's no real TTY in CI to
// answer these, so we remove the ambiguity up front: the "products" price
// fields were consolidated from six per-currency columns into a single
// `cost` column (see "Products: single price field; currencies move to
// Settings"), and the old columns were never dropped from the DB. Drop them
// here — plain, deterministic, only ever removes columns we know are dead —
// so the push has nothing left to disambiguate.
const LEGACY_PRICE_COLUMNS = [
  "price_in_u_s_d_enabled",
  "price_in_u_s_d",
  "price_in_e_u_r_enabled",
  "price_in_e_u_r",
  "price_in_g_b_p_enabled",
  "price_in_g_b_p",
];

async function main() {
  process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = "true";
  const payload = await getPayload({ config });
  const db = payload.db.drizzle;

  for (const table of ["products", "_products_v"]) {
    const prefix = table === "_products_v" ? "version_" : "";
    for (const col of LEGACY_PRICE_COLUMNS) {
      const columnName = `${prefix}${col}`;
      await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${columnName}"`));
      payload.logger.info(`Dropped legacy column ${table}.${columnName} (if present)`);
    }
  }

  // @ts-expect-error payload.db is the drizzle adapter; type not fully re-exported
  await pushDevSchema(payload.db);
  payload.logger.info("Schema push complete via script");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
