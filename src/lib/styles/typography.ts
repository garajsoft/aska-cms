import type { StyleDoc } from "./tokens";

/**
 * Font-loading CSS (@import / @font-face) for Typography Scale style docs.
 *
 * Adaptation note: the reference repo's /api/styles/typography.css route
 * served a site-wide "master font" from a separate Settings → Typography
 * global that aska-cms doesn't have. aska-cms's `styles` collection already
 * carries per-token font source fields (fontSourceType/googleFontUrl/
 * customFontFile), so this builds the font-loading CSS from those instead —
 * one @import per distinct Google Font URL, one @font-face per custom
 * upload. The actual `--font-family-{slug}` etc. custom properties still
 * come from tokens.ts/buildStyleTokensCss (served by /api/styles/tokens.css).
 */

type FontFileRef = { url?: string | null; filename?: string | null } | number | string | null | undefined;

export interface TypographyStyleDoc extends StyleDoc {
  fontSourceType?: string | null;
  googleFontUrl?: string | null;
  customFontFile?: FontFileRef;
}

function fontFormat(file: FontFileRef): "woff2" | "truetype" | "opentype" | "woff" | null {
  const name = file && typeof file === "object" ? (file.filename ?? file.url ?? "") : "";
  const ext = name?.split(".").pop()?.toLowerCase();
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "ttf") return "truetype";
  if (ext === "otf") return "opentype";
  return null;
}

function fileUrl(file: FontFileRef): string | null {
  return file && typeof file === "object" ? (file.url ?? null) : null;
}

export function buildTypographyCss(docs: TypographyStyleDoc[]): string {
  const typeScaleDocs = docs.filter((d) => d.category === "Typography Scale");

  const googleFontUrls = Array.from(
    new Set(
      typeScaleDocs
        .filter((d) => d.fontSourceType === "Google Font URL" && d.googleFontUrl)
        .map((d) => d.googleFontUrl as string)
    )
  );

  const fontFaceBlocks = typeScaleDocs
    .filter((d) => d.fontSourceType === "Custom File Upload" && d.fontFamily && d.customFontFile)
    .map((d) => {
      const url = fileUrl(d.customFontFile);
      const format = fontFormat(d.customFontFile);
      if (!url || !format) return null;
      return (
        `@font-face {\n` +
        `  font-family: '${d.fontFamily}';\n` +
        `  src: url('${url}') format('${format}');\n` +
        (d.fontWeight ? `  font-weight: ${d.fontWeight};\n` : "") +
        `  font-display: swap;\n` +
        `}`
      );
    })
    .filter((block): block is string => Boolean(block));

  const parts: string[] = [];
  for (const url of googleFontUrls) parts.push(`@import url('${url}');`);
  parts.push(...fontFaceBlocks);
  return parts.join("\n");
}

// Self-check
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = buildTypographyCss([
    {
      slug: "h1",
      category: "Typography Scale",
      fontSourceType: "Google Font URL",
      googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter",
    },
    {
      slug: "h2",
      category: "Typography Scale",
      fontSourceType: "Google Font URL",
      googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter",
    },
    {
      slug: "display-lg",
      category: "Typography Scale",
      fontSourceType: "Custom File Upload",
      fontFamily: "Acme Sans",
      fontWeight: "700",
      customFontFile: { url: "https://cdn.example/acme.woff2", filename: "acme.woff2" },
    },
    { slug: "color-primary", category: "Color", colorValue: "#000" },
  ]);
  const expected =
    "@import url('https://fonts.googleapis.com/css2?family=Inter');\n" +
    "@font-face {\n" +
    "  font-family: 'Acme Sans';\n" +
    "  src: url('https://cdn.example/acme.woff2') format('woff2');\n" +
    "  font-weight: 700;\n" +
    "  font-display: swap;\n" +
    "}";
  if (out !== expected) {
    console.error("FAIL");
    console.error("got:  ", JSON.stringify(out));
    console.error("want: ", JSON.stringify(expected));
    process.exit(1);
  }
  console.log("ok");
}
