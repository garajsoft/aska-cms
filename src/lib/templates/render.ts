/**
 * Tiny placeholder engine. Not a full template language — just:
 *   {{fieldName}}          → escaped
 *   {{nested.path.here}}   → walks the object, escaped
 *   {{{fieldName}}}        → raw (unescaped) — use for HTML fields
 * Unknown / missing paths render as empty string.
 */

const escapeHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function resolvePath(root: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = root;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function renderTemplate(html: string, doc: Record<string, unknown>): string {
  return html
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_m, path) =>
      String(resolvePath(doc, path) ?? "")
    )
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) =>
      escapeHtml(resolvePath(doc, path))
    );
}

// Self-check
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = renderTemplate(
    "<h1>{{title}}</h1><p>{{excerpt}}</p><img src={{{coverImage.url}}}> author={{author.email}}",
    {
      title: "Hi & bye",
      excerpt: "A <em>tag</em>",
      coverImage: { url: "https://x/y.jpg" },
      author: { email: "a@b.com" },
    }
  );
  const expected =
    "<h1>Hi &amp; bye</h1><p>A &lt;em&gt;tag&lt;/em&gt;</p><img src=https://x/y.jpg> author=a@b.com";
  if (out !== expected) {
    console.error("FAIL");
    console.error("got:  ", out);
    console.error("want: ", expected);
    process.exit(1);
  }
  console.log("ok");
}
