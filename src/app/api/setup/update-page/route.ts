import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

const SETUP_SECRET = process.env.SETUP_SECRET || "dev-only-secret";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");

  if (secret !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });
    const { slug, html, css, title } = await req.json();

    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (!result.docs[0]) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updated = await payload.update({
      collection: "pages",
      id: result.docs[0].id,
      data: {
        title: title || result.docs[0].title,
        html,
        css: css || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Page updated",
      slug: updated.slug,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
