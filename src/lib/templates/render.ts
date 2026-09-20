/**
 * Tiny placeholder engine. Not a full template language — just:
 *   {{fieldName}}            → escaped
 *   {{nested.path.here}}     → walks the object, escaped
 *   {{{fieldName}}}          → raw (unescaped) — use for HTML fields
 *   {{#each path}}…{{/each}} → renders the inner block once per array item,
 *                              with the item as the placeholder context.
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

function renderPlaceholders(text: string, ctx: Record<string, unknown>): string {
  return text
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_m, path: string) =>
      String(resolvePath(ctx, path) ?? "")
    )
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) =>
      escapeHtml(resolvePath(ctx, path))
    );
}

export function renderTemplate(html: string, doc: Record<string, unknown>): string {
  // Resolve loops first so placeholders inside iterate per-item. Non-greedy
  // match keeps same-level siblings correct; nested same-name loops are not
  // supported (fine for the page loops we expose).
  const withLoops = html.replace(
    /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, path: string, inner: string) => {
      const items = resolvePath(doc, path);
      if (!Array.isArray(items)) return "";
      return items
        .map((item) => renderPlaceholders(inner, (item ?? {}) as Record<string, unknown>))
        .join("");
    }
  );
  return renderPlaceholders(withLoops, doc);
}

// Self-check
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = renderTemplate(
    "<h1>{{title}}</h1><p>{{excerpt}}</p><img src={{{coverImage.url}}}> author={{author.email}}" +
      "{{#each posts}}<li>{{title}}@{{slug}}</li>{{/each}}",
    {
      title: "Hi & bye",
      excerpt: "A <em>tag</em>",
      coverImage: { url: "https://x/y.jpg" },
      author: { email: "a@b.com" },
      posts: [
        { title: "One", slug: "one" },
        { title: "Two <b>", slug: "two" },
      ],
    }
  );
  const expected =
    "<h1>Hi &amp; bye</h1><p>A &lt;em&gt;tag&lt;/em&gt;</p><img src=https://x/y.jpg> author=a@b.com" +
    "<li>One@one</li><li>Two &lt;b&gt;@two</li>";
  if (out !== expected) {
    console.error("FAIL");
    console.error("got:  ", out);
    console.error("want: ", expected);
    process.exit(1);
  }
  console.log("ok");
}
