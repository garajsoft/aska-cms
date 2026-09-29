import "server-only";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";
import type { Theme } from "@/payload-types";

/** The active theme (depth 0 — relationships are bare ids), or null. */
export async function getActiveTheme(): Promise<Theme | null> {
  const p = await getPayload({ config });
  const r = await p
    .find({
      collection: "themes",
      where: { active: { equals: true } },
      limit: 1,
      depth: 0,
    })
    .catch(() => null);
  return (r?.docs[0] as Theme | undefined) ?? null;
}

export async function getActiveThemeId(): Promise<number | null> {
  const theme = await getActiveTheme();
  return theme?.id ?? null;
}

/** Theme-aware query context for repos: the id to scope finds against. */
export async function themeScope(): Promise<{ activeThemeId: number | null }> {
  return { activeThemeId: await getActiveThemeId() };
}

/** Where fragment matching docs tagged with the theme OR shared (untagged).
 *  `exists: false` is the drizzle adapter's IS NULL for relationship columns —
 *  Payload has no `is` operator. */
export function themeFilter(activeThemeId: number): Where {
  return {
    or: [{ theme: { equals: activeThemeId } }, { theme: { exists: false } }],
  };
}

/** Given docs already narrowed by themeFilter, prefer the theme-tagged one
 *  over a shared (theme null) doc — e.g. a same-slug override. */
export function preferred<T extends { theme?: unknown }>(
  docs: T[],
  activeThemeId: number | null
): T | undefined {
  return (
    docs.find((d) => d.theme != null && d.theme === activeThemeId) ??
    docs.find((d) => d.theme == null) ??
    docs[0]
  );
}
