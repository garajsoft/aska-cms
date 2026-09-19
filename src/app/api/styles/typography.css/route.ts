import { NextResponse } from "next/server";
import { getStyleTypographyCss } from "@/lib/styles/repo";

export const dynamic = "force-dynamic";

/** Font-loading CSS (@import / @font-face) for Typography Scale style
 * tokens — loaded by the GrapesJS canvas iframe (see GrapesEditor.tsx) and
 * by ComponentPreview's srcDoc iframe, same pattern as ./tokens.css for the
 * CSS custom properties themselves. */
export async function GET() {
  const css = await getStyleTypographyCss();
  return new NextResponse(css, {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
}
