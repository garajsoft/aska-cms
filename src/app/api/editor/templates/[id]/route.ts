import { NextRequest, NextResponse } from "next/server";
import { readTemplate, updateTemplateContent } from "@/lib/templates/repo";
import { getCurrentUser } from "@/lib/auth/requireUser";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const unauth = await requireUser();
  if (unauth) return unauth;
  const { id } = await params;
  const t = await readTemplate(id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const unauth = await requireUser();
  if (unauth) return unauth;
  const { id } = await params;
  const body = (await req.json()) as { html?: string; css?: string };
  const saved = await updateTemplateContent({
    id,
    html: body.html,
    css: body.css,
  });
  return NextResponse.json(saved);
}
