import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { applyTheme } from "@/lib/theme/seed";

export const dynamic = "force-dynamic";

// TEMPORARY ops route (same trust model as the previous setup routes):
// pushes the Payload schema and applies the sample theme in one call, for
// environments where the DB is only reachable from the app host. Remove
// once the target environment is seeded.
export async function POST(req: NextRequest) {
  const expected = process.env.SETUP_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "SETUP_SECRET is not configured on this host" },
      { status: 503 }
    );
  }
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayload({ config });
  try {
    const { pushDevSchema } = await import("@payloadcms/drizzle");
    // @ts-expect-error payload.db is the drizzle adapter; type not re-exported
    await pushDevSchema(payload.db);

    const seed = await applyTheme(payload);
    return NextResponse.json({ ok: true, schema: "pushed", seed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    payload.logger.error({ err }, "apply-updates failed");
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
