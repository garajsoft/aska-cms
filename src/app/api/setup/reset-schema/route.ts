import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { sql } from "drizzle-orm";
import config from "@/payload.config";

export const dynamic = "force-dynamic";

// TEMPORARY one-shot schema reset for the helptobuild migration — removes
// this route once the production DB has been rebuilt.
//
// The production DB is only reachable from the Coolify host, so the schema
// rebuild has to run inside the deployed app. Drizzle push can't run
// non-interactively against the drifted old schema (ambiguous
// create-vs-rename prompts and data-loss confirmations block with no TTY),
// and every diff the sync introduces is safe to rebuild from scratch, so:
// drop the whole schema and let pushDevSchema recreate it on an empty DB
// (pure creates — no prompts, no data-loss confirmations).
//
// ponytail: destroys ALL data in the public schema. Content was backed up
// beforehand (pages/media) or is throwaway test data (blog/products).
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.SETUP_SECRET || "dev-only-secret")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const drizzle = (
    payload.db as { drizzle?: { execute: (q: unknown) => Promise<unknown> } }
  ).drizzle;
  if (!drizzle) {
    return NextResponse.json({ error: "No drizzle handle" }, { status: 500 });
  }

  payload.logger.warn("reset-schema: dropping public schema");
  await drizzle.execute(
    sql.raw("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;")
  );

  const { pushDevSchema } = await import("@payloadcms/drizzle");
  // @ts-expect-error payload.db is the drizzle adapter; type not re-exported
  await pushDevSchema(payload.db);
  payload.logger.warn("reset-schema: schema rebuilt");

  return NextResponse.json({ ok: true });
}
