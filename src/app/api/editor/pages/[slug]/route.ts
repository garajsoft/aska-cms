import { NextRequest, NextResponse } from "next/server";
import { readPage, upsertPage } from "@/lib/pages/repo";
import { getCurrentUser } from "@/lib/auth/requireUser";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ slug: string }>;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const unauth = await requireUser();
  if (unauth) return unauth;
  const { slug } = await params;
  const page = await readPage(slug);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const unauth = await requireUser();
  if (unauth) return unauth;
  const { slug } = await params;
  const body = (await req.json()) as { title?: string; html?: string; css?: string };
  const saved = await upsertPage({ slug, title: body.title, html: body.html, css: body.css });
  return NextResponse.json(saved);
}
