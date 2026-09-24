import { getPayload } from "payload";
import config from "../src/payload.config";

// One-off schema push for hosted environments: the production runtime keeps
// adapter push disabled (see payload.config.ts), so this script pushes
// explicitly. Run via: npx jiti scripts/push-schema.ts
// (see .github/workflows/push-schema.yml)
async function main() {
  const payload = await getPayload({ config });
  const { pushDevSchema } = await import("@payloadcms/drizzle");
  // @ts-expect-error payload.db is the drizzle adapter; type not re-exported
  await pushDevSchema(payload.db);
  payload.logger.info("Schema push complete via CI script");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
