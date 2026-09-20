import { readPage } from "@/lib/pages/repo";
import { pageRenderContext } from "@/lib/pages/context";
import { renderTemplate } from "@/lib/templates/render";
import { resolveModules } from "@/lib/modules/resolveModules";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await readPage(slug, { publishedOnly: true });
  if (!page) return { title: "Not found" };

  const description = page.metaDescription || undefined;
  const images = page.shareImageUrl ? [page.shareImageUrl] : undefined;

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      images,
      type: "website",
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: page.title,
      description,
      images,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await readPage(slug, { publishedOnly: true });
  if (!page) notFound();
  const ctx = await pageRenderContext(page);
  // Modules run after template substitution - review text could otherwise
  // contain `{{`-like sequences the Handlebars-lite engine would try to
  // resolve as placeholders.
  const html = await resolveModules(renderTemplate(page.html, ctx));
  return (
    <>
      {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
