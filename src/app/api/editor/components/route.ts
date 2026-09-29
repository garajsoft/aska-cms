import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { getCurrentUser } from "@/lib/auth/requireUser";
import { themeFilter, themeScope } from "@/lib/themes/repo";

export const dynamic = "force-dynamic";

// GrapesJS block library: Components docs scoped to the active theme (shared
// docs included as fallback). Theme-tagged doc wins on a name collision with
// a shared one. The Payload admin UI uses the raw REST /api/components, which
// stays unscoped — only the editor reads through here.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = await getPayload({ config });
  const { activeThemeId } = await themeScope();
  const r = await p.find({
    collection: "components",
    limit: 200,
    depth: 1,
    ...(activeThemeId != null ? { where: themeFilter(activeThemeId) } : {}),
  });
  const byName = new Map<string, { doc: (typeof r.docs)[number]; themed: boolean }>();
  for (const doc of r.docs) {
    const themed = activeThemeId != null && doc.theme != null;
    const prev = byName.get(doc.name);
    if (!prev || (themed && !prev.themed)) {
      byName.set(doc.name, { doc, themed });
    }
  }
  return NextResponse.json({ docs: [...byName.values()].map((entry) => entry.doc) });
}
