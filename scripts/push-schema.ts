import { getPayload } from "payload";
import config from "../src/payload.config";

// One-off schema push for hosted environments (Vercel serverless runtime
// can't load drizzle-kit at runtime, so onInit push fails there).
// Run via: npx tsx scripts/push-schema.ts  (see .github/workflows/push-schema.yml)
const payload = await getPayload({ config });
payload.logger.info("Schema push complete via CI script");
process.exit(0);
