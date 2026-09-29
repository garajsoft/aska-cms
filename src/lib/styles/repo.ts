import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";
import { buildStyleTokensCss, type StyleDoc } from "./tokens";
import { themeFilter, themeScope } from "@/lib/themes/repo";

export async function getStyleTokensCss(): Promise<string> {
  const p = await getPayload({ config });
  const { activeThemeId } = await themeScope();
  const { docs } = await p.find({
    collection: "styles",
    limit: 500,
    depth: 0,
    ...(activeThemeId != null ? { where: themeFilter(activeThemeId) } : {}),
  });
  // Same-slug collision: a theme-tagged token overrides the shared one.
  const bySlug = new Map<string, { doc: StyleDoc; themed: boolean }>();
  for (const doc of docs as unknown as (StyleDoc & { theme?: number | null })[]) {
    const themed = activeThemeId != null && doc.theme != null;
    const prev = bySlug.get(doc.slug);
    if (!prev || (themed && !prev.themed)) {
      bySlug.set(doc.slug, { doc, themed });
    }
  }
  return buildStyleTokensCss([...bySlug.values()].map((entry) => entry.doc));
}
