import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { postPasswordCookieName, signPostPassword } from "@/lib/auth/postPassword";

export const dynamic = "force-dynamic";

/**
 * Password-gate submission for password-protected blog posts (the page at
 * /blog/[slug] is GET-only, so the form posts here with the slug + password):
 * verify against postPassword, stamp the signed cookie, bounce back. The page
 * shows an error when redirected with ?postpw=1.
 */
export async function POST(request: Request) {
  const fail = (slug: string) =>
    NextResponse.redirect(new URL(`/blog/${slug}?postpw=1`, request.url), 303);

  const form = await request.formData().catch(() => null);
  const slug = form ? String(form.get("slug") ?? "") : "";
  const password = form ? String(form.get("password") ?? "") : "";
  if (!slug || !password) return fail(slug || "unknown");

  const p = await getPayload({ config });
  const r = await p.find({
    collection: "blog",
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    limit: 1,
    depth: 0,
  });
  const doc = r.docs[0] as
    | { id: number; visibility?: string | null; postPassword?: string | null }
    | undefined;
  if (!doc || doc.visibility !== "password" || !doc.postPassword || doc.postPassword !== password) {
    return fail(slug);
  }

  const res = NextResponse.redirect(new URL(`/blog/${slug}`, request.url), 303);
  res.cookies.set(postPasswordCookieName(doc.id), signPostPassword(doc.id), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
