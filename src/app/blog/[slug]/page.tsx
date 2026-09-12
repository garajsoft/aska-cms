import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@/payload.config";
import { readTemplateForCollection } from "@/lib/templates/repo";
import { renderTemplate } from "@/lib/templates/render";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function fetchPublished(slug: string) {
  const p = await getPayload({ config });
  const r = await p.find({
    collection: "blog",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
    draft: false,
  });
  return r.docs[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchPublished(slug);
  if (!doc) return { title: "Not found" };
  const description = (doc as { metaDescription?: string }).metaDescription || undefined;
  const share = (doc as { shareImage?: { url?: string } }).shareImage?.url;
  const cover = (doc as { coverImage?: { url?: string } }).coverImage?.url;
  const images = share || cover ? [share || cover!] : undefined;
  return {
    title: (doc as { title?: string }).title,
    description,
    openGraph: { title: (doc as { title?: string }).title, description, images, type: "article" },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: (doc as { title?: string }).title,
      description,
      images,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const doc = await fetchPublished(slug);
  if (!doc) notFound();
  const template = await readTemplateForCollection("blog");
  if (!template) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif" }}>
        <h1>{(doc as { title?: string }).title}</h1>
        <p style={{ color: "#a00" }}>
          No template for the Blog collection yet. Create one under Theme → Templates.
        </p>
      </div>
    );
  }
  const rendered = renderTemplate(template.html, doc as Record<string, unknown>);
  return (
    <>
      {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
      <div dangerouslySetInnerHTML={{ __html: rendered }} />
    </>
  );
}
