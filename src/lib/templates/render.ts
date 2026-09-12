/**
 * Tiny placeholder engine. Not a full template language — just:
 *   {{title}} {{slug}} {{id}}      → escaped built-ins
 *   {{fields.KEY}}                  → escaped custom-field value
 *   {{{fields.KEY}}}                → raw (unescaped) — use for HTML/URLs
 * Unknown placeholders render as empty string.
 */

const escapeHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface RenderContext {
  id: string | number;
  title: string;
  slug: string;
  fields: Record<string, unknown>;
}

function resolve(path: string, ctx: RenderContext): unknown {
  if (path === "title") return ctx.title;
  if (path === "slug") return ctx.slug;
  if (path === "id") return ctx.id;
  if (path.startsWith("fields.")) {
    const key = path.slice("fields.".length);
    return ctx.fields[key];
  }
  return undefined;
}

export function renderTemplate(html: string, ctx: RenderContext): string {
  // Raw first (three braces), then escaped.
  return html
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_m, path) => String(resolve(path, ctx) ?? ""))
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) => escapeHtml(resolve(path, ctx)));
}

// Self-check — runs when invoked directly: `node --loader tsx render.ts` (dev only).
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = renderTemplate("<h1>{{title}}</h1><p>{{fields.lede}}</p>{{{fields.body}}}", {
    id: 1,
    title: "Hi & bye",
    slug: "hi",
    fields: { lede: "A <em>tag</em>", body: "<p>raw</p>" },
  });
  const expected =
    "<h1>Hi &amp; bye</h1><p>A &lt;em&gt;tag&lt;/em&gt;</p><p>raw</p>";
  if (out !== expected) {
    console.error("FAIL");
    console.error("got:  ", out);
    console.error("want: ", expected);
    process.exit(1);
  }
  console.log("ok");
}
