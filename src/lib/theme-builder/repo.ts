import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export type ThemeSlotMode = "DEFAULT_COMPONENT" | "SAVED_TEMPLATE" | "CUSTOM_BUILD" | "NONE";

export interface ThemeSlot {
  mode: ThemeSlotMode;
  template: { id: string | number; html: string; css: string; js: string } | null;
  html: string;
  css: string;
}

export interface ThemeRule {
  id: string;
  targetPageSlugs: string[];
  header: ThemeSlot;
  footer: ThemeSlot;
}

export interface ThemeBuilderDoc {
  header: ThemeSlot;
  footer: ThemeSlot;
  rules: ThemeRule[];
}

interface RawSlot {
  mode?: ThemeSlotMode;
  template?: { id: string | number; html?: string | null; css?: string | null; js?: string | null } | string | number | null;
  html?: string | null;
  css?: string | null;
}

interface RawThemeBuilder {
  header?: RawSlot;
  footer?: RawSlot;
  customRules?: {
    id: string;
    targetPages?: ({ slug?: string } | string | number)[];
    header?: RawSlot;
    footer?: RawSlot;
  }[];
}

async function payload() {
  return getPayload({ config });
}

function mapSlot(raw: RawSlot | undefined): ThemeSlot {
  const template =
    raw?.template && typeof raw.template === "object"
      ? {
          id: raw.template.id,
          html: raw.template.html ?? "",
          css: raw.template.css ?? "",
          js: raw.template.js ?? "",
        }
      : null;
  return {
    mode: raw?.mode ?? "DEFAULT_COMPONENT",
    template,
    html: raw?.html ?? "",
    css: raw?.css ?? "",
  };
}

/** Full theme config, relationships populated (depth: 1) — for rendering the site. */
export async function readThemeBuilder(): Promise<ThemeBuilderDoc> {
  const p = await payload();
  // "theme-builder" isn't in GlobalConfig's generated slug union until the
  // global is registered in payload.config.ts (reserved for the parallel
  // owner of that file) — see the reported change in this port's summary.
  const doc = (await p.findGlobal({ slug: "theme-builder" as never, depth: 1 })) as RawThemeBuilder;
  return {
    header: mapSlot(doc.header),
    footer: mapSlot(doc.footer),
    rules: (doc.customRules ?? []).map((r) => ({
      id: r.id,
      targetPageSlugs: (r.targetPages ?? [])
        .map((pg) => (typeof pg === "object" ? pg.slug : undefined))
        .filter((slug): slug is string => Boolean(slug)),
      header: mapSlot(r.header),
      footer: mapSlot(r.footer),
    })),
  };
}

/** Raw (relationships as IDs, depth: 0) — for the theme-slot editor page and safe re-saves. */
async function readThemeBuilderRaw(): Promise<RawThemeBuilder> {
  const p = await payload();
  return (await p.findGlobal({ slug: "theme-builder" as never, depth: 0 })) as RawThemeBuilder;
}

/** Initial html/css + a display label for the `/editor/theme/[scope]/[slot]` route. */
export async function readThemeSlot(
  scope: string,
  slot: "header" | "footer"
): Promise<{ html: string; css: string; label: string } | null> {
  const doc = await readThemeBuilderRaw();
  if (scope === "global") {
    const s = doc[slot];
    return { html: s?.html ?? "", css: s?.css ?? "", label: `Global ${slot}` };
  }
  const rule = (doc.customRules ?? []).find((r) => r.id === scope);
  if (!rule) return null;
  const s = rule[slot];
  return { html: s?.html ?? "", css: s?.css ?? "", label: `Override — ${slot}` };
}

/** Writes CUSTOM_BUILD html/css for one slot, leaving mode/template/targetPages untouched. */
export async function updateThemeSlotContent(input: {
  scope: string;
  slot: "header" | "footer";
  html: string;
  css: string;
}): Promise<void> {
  const p = await payload();
  const current = await readThemeBuilderRaw();

  if (input.scope === "global") {
    await p.updateGlobal({
      slug: "theme-builder" as never,
      data: {
        [input.slot]: { ...current[input.slot], html: input.html, css: input.css },
      },
    });
    return;
  }

  const rules = current.customRules ?? [];
  const updatedRules = rules.map((rule) =>
    rule.id === input.scope
      ? { ...rule, [input.slot]: { ...rule[input.slot], html: input.html, css: input.css } }
      : rule
  );
  await p.updateGlobal({ slug: "theme-builder" as never, data: { customRules: updatedRules } });
}

// --- Render-time resolution ---------------------------------------------

export type ResolvedSlot =
  | { kind: "DEFAULT_COMPONENT" }
  | { kind: "TEMPLATE"; html: string; css: string; js: string }
  | { kind: "CUSTOM"; html: string; css: string }
  | { kind: "NONE" };

export interface ThemeLayout {
  header: ResolvedSlot;
  footer: ResolvedSlot;
}

function resolveSlot(slot: ThemeSlot): ResolvedSlot {
  switch (slot.mode) {
    case "SAVED_TEMPLATE":
      // ponytail: no block picked yet — fail safe to DEFAULT_COMPONENT
      // instead of rendering nothing.
      return slot.template
        ? { kind: "TEMPLATE", html: slot.template.html, css: slot.template.css, js: slot.template.js }
        : { kind: "DEFAULT_COMPONENT" };
    case "CUSTOM_BUILD":
      return { kind: "CUSTOM", html: slot.html, css: slot.css };
    case "NONE":
      return { kind: "NONE" };
    default:
      return { kind: "DEFAULT_COMPONENT" };
  }
}

/**
 * Resolves which header/footer to render for a page.
 *
 * `pathname` is the page's `slug` (e.g. "about", not "/about" — Pages.slug
 * has no leading slash). The first customRules entry whose targetPages
 * includes that slug wins; otherwise Global Defaults apply.
 *
 * DEFAULT_COMPONENT decision: the reference site (aska-helptobuild-ref) has
 * its own hardcoded <Header/>/<Footer/> components that DEFAULT_COMPONENT
 * falls back to. aska-cms has no equivalent fixed header/footer today, so
 * `{ kind: "DEFAULT_COMPONENT" }` here just means "no theme-builder override
 * — render whatever this page/layout already renders by default (possibly
 * nothing)". Callers that DO have a default header/footer component can
 * switch on `kind === "DEFAULT_COMPONENT"` and render it; callers that don't
 * can treat it the same as "NONE".
 */
export async function getThemeLayout(pathname: string): Promise<ThemeLayout> {
  const theme = await readThemeBuilder();
  const slug = pathname.replace(/^\/+/, "");
  const rule = theme.rules.find((r) => r.targetPageSlugs.includes(slug));
  const source = rule ?? theme;
  return { header: resolveSlot(source.header), footer: resolveSlot(source.footer) };
}
