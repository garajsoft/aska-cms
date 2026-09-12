import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readPostByPath } from "@/lib/posts/repo";
import { readTemplateForPostType } from "@/lib/templates/repo";
import { renderTemplate } from "@/lib/templates/render";

interface Props {
  params: Promise<{ slug: string; postSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: postType, postSlug } = await params;
  const post = await readPostByPath(postType, postSlug, { publishedOnly: true });
  if (!post) return { title: "Not found" };
  const description = post.metaDescription || undefined;
  const images = post.shareImageUrl ? [post.shareImageUrl] : undefined;
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, images, type: "article" },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug: postType, postSlug } = await params;
  const post = await readPostByPath(postType, postSlug, { publishedOnly: true });
  if (!post || post.postTypeId == null) notFound();

  const template = await readTemplateForPostType(post.postTypeId);
  if (!template) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif" }}>
        <h1>{post.title}</h1>
        <p style={{ color: "#a00" }}>
          No template configured for post type <code>{postType}</code>. Create one in the
          admin under Theme → Templates.
        </p>
      </div>
    );
  }

  const rendered = renderTemplate(template.html, {
    id: post.id,
    title: post.title,
    slug: post.slug,
    fields: post.fields,
  });

  return (
    <>
      {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
      <div dangerouslySetInnerHTML={{ __html: rendered }} />
    </>
  );
}
