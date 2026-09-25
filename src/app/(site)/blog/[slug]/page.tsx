import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";
import { readTemplateForCollection } from "@/lib/templates/repo";
import { renderTemplate } from "@/lib/templates/render";
import { flattenLexical } from "@/lib/templates/flatten";
import { getBrandingAssets } from "@/lib/settings/repo";
import { checkPrivateAccess } from "@/lib/auth/gate";
import { postPasswordCookieName, isValidPostPasswordCookie } from "@/lib/auth/postPassword";
import { renderCommentsSection } from "@/lib/comments/render";
import { RenderedHtml } from "@/components/RenderedHtml";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ postpw?: string }>;
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

type BlogDoc = {
  id: number;
  title?: string;
  visibility?: "public" | "password" | "private" | null;
  postPassword?: string | null;
  metaDescription?: string | null;
  shareImage?: { url?: string } | null;
  coverImage?: { url?: string } | null;
  category?: { name?: string; slug?: string } | number | string | null;
  tags?: string[] | null;
  featured?: boolean | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchPublished(slug);
  if (!doc) return { title: "Not found", robots: { index: false } };
  const d = doc as unknown as BlogDoc;
  // Private posts: never resolve real metadata for a logged-out request.
  if (d.visibility === "private" && !(await checkPrivateAccess())) {
    return { title: "Sign in required", robots: { index: false } };
  }
  const description = d.metaDescription || undefined;
  const share = d.shareImage?.url;
  const cover = d.coverImage?.url;
  const images = share || cover ? [share || cover!] : undefined;
  const noindex = d.visibility !== "public" ? { index: false as const } : undefined;
  return {
    title: d.title,
    description,
    robots: noindex,
    openGraph: { title: d.title, description, images, type: "article" },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: d.title,
      description,
      images,
    },
  };
}

/** Password wall for visibility=password posts whose cookie isn't stamped. */
function PasswordGate({ slug, error }: { slug: string; error: boolean }) {
  return (
    <div style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <h1>Password protected</h1>
      <p style={{ color: "#555" }}>This post is password protected. Enter the password to continue.</p>
      {error && <p style={{ color: "#a00" }}>Incorrect password — try again.</p>}
      <form action="/api/post-password" method="post" style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="slug" value={slug} />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          style={{ padding: "8px 10px", border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          type="submit"
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #333", cursor: "pointer" }}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const doc = await fetchPublished(slug);
  if (!doc) notFound();
  const d = doc as unknown as BlogDoc;

  // Visibility gate — runs before any content resolution/rendering below.
  if (d.visibility === "private") {
    if (!(await checkPrivateAccess())) {
      redirect(`/admin/login?redirect=${encodeURIComponent(`/blog/${slug}`)}`);
    }
  } else if (d.visibility === "password") {
    const cookieStore = await cookies();
    const ok = isValidPostPasswordCookie(
      d.id,
      cookieStore.get(postPasswordCookieName(d.id))?.value
    );
    if (!ok) {
      const { postpw } = await searchParams;
      return <PasswordGate slug={slug} error={postpw === "1"} />;
    }
  }

  const settings = await getBrandingAssets();
  const commentsHtml = await renderCommentsSection(d.id);
  const category =
    d.category && typeof d.category === "object" ? d.category : null;
  const context: Record<string, unknown> = {
    ...flattenLexical(doc as unknown as Record<string, unknown>),
    settings,
    // Normalized for templates: a single relationship in the model, but
    // exposed as an array so {{#each categories}} works uniformly.
    categories: category?.slug
      ? [{ name: category.name ?? "", slug: category.slug }]
      : [],
    categoryName: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    tags: d.tags ?? [],
    featured: d.featured ?? false,
    commentsHtml,
  };

  const template = await readTemplateForCollection("blog");
  if (!template) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif" }}>
        <h1>{d.title}</h1>
        <p style={{ color: "#a00" }}>
          No template for the Blog collection yet. Create one under Theme → Templates.
        </p>
        <RenderedHtml html={commentsHtml} />
      </div>
    );
  }

  let rendered = renderTemplate(template.html, context);
  if (!template.html.includes("{{{commentsHtml}}}")) {
    rendered += commentsHtml;
  }
  return (
    <>
      {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
      <RenderedHtml html={rendered} />
    </>
  );
}
