import { redirect, notFound } from "next/navigation";
import { GrapesEditor } from "../../GrapesEditor";
import { readTemplate } from "@/lib/templates/repo";
import { getCurrentUser } from "@/lib/auth/requireUser";
import { getPayload } from "payload";
import config from "@/payload.config";

export const metadata = { title: "Template editor — Aska CMS" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function loadFieldKeysForPostType(
  postTypeId: string | number | null
): Promise<string[]> {
  if (postTypeId == null) return [];
  const p = await getPayload({ config });
  const r = await p.find({
    collection: "custom-fields",
    where: { attachedTo: { in: [postTypeId] } },
    limit: 500,
    depth: 0,
  });
  return r.docs.map((d) => d.key).filter(Boolean);
}

async function loadPostTypeSlug(
  postTypeId: string | number | null
): Promise<string | null> {
  if (postTypeId == null) return null;
  const p = await getPayload({ config });
  const doc = await p.findByID({ collection: "post-types", id: postTypeId, depth: 0 }).catch(() => null);
  return doc?.slug ?? null;
}

export default async function TemplateEditorPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    const back = `/editor/template/${encodeURIComponent(id)}`;
    redirect(`/admin/login?redirect=${encodeURIComponent(back)}`);
  }
  const template = await readTemplate(id);
  if (!template) notFound();

  const [fieldKeys, postTypeSlug] = await Promise.all([
    loadFieldKeysForPostType(template.postTypeId),
    loadPostTypeSlug(template.postTypeId),
  ]);

  return (
    <GrapesEditor
      target={{ mode: "template", id: template.id, name: template.name, postTypeSlug }}
      initial={{ html: template.html, css: template.css }}
      fieldKeys={fieldKeys}
    />
  );
}
