// TEMPORARY ops route — delete after the theme-schema update has been applied
// to the hosted database. Recreated from the pattern used for the previous
// one-off schema push: pushes the Payload schema, then re-applies the sample
// theme seed (idempotent) so new theme-tagged content appears.
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not available" }, { status: 503 });
  }
  if (req.headers.get("x-setup-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await getPayload({ config });
  const { pushDevSchema } = await import("@payloadcms/drizzle");
  // @ts-expect-error payload.db is the drizzle adapter; type not re-exported
  await pushDevSchema(payload.db);
  const { applyTheme } = await import("@/lib/theme/seed");
  const summary = await applyTheme(payload);
  return NextResponse.json(summary);
}
