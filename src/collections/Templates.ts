import type { CollectionConfig, Where } from "payload";
import { isContentManager } from "@/lib/auth/roles";
import { withImportExportUI } from "@/lib/importExport/withImportExportUI";
import { CODE_FIELD_ADMIN } from "@/lib/adminFields/codeEditor";

/**
 * Slugs of collections that can be rendered through a template. Add new
 * collection slugs here as they get promoted to "renderable" content.
 */
export const RENDERABLE_COLLECTIONS = [
  { label: "Blog Posts", value: "blog" },
  { label: "Products", value: "products" },
  { label: "House Designs", value: "house-designs" },
] as const;

export const Templates: CollectionConfig = withImportExportUI({
  slug: "templates",
  hooks: {
    beforeChange: [
      async ({ req, operation, data, originalDoc }) => {
        // Uniqueness used to live on the `collection` field itself, but one
        // collection now has two templates (detail + index). Enforce the
        // (collection, kind, theme) triple here instead — a find with an id
        // inequality also lets a doc keep its own row on update. Untagged
        // (shared) templates and per-theme templates coexist; two docs with
        // the same values AND the same theme (null counts as a theme) clash.
        const collection = data?.collection;
        const kind = data?.kind ?? "detail";
        if (!collection) return data;
        const theme = data?.theme !== undefined ? data.theme : originalDoc?.theme;
        const themeClause: Where =
          theme == null ? { theme: { exists: false } } : { theme: { equals: theme } };
        const existing = await req.payload.find({
          collection: "templates",
          where: {
            and: [
              { collection: { equals: collection } },
              { kind: { equals: kind } },
              themeClause,
              ...(operation === "update" && originalDoc?.id != null
                ? [{ id: { not_equals: originalDoc.id } }]
                : []),
            ],
          },
          limit: 1,
          depth: 0,
        });
        if (existing.docs.length > 0) {
          throw new Error(
            `A ${kind} template for "${collection}" already exists in this theme — one template per collection, kind, and theme.`
          );
        }
        return data;
      },
    ],
  },
  admin: {
    group: "Theme",
    useAsTitle: "name",
    defaultColumns: ["name", "collection", "kind", "theme", "updatedAt"],
    description:
      "Layouts for a collection (Blog, Products, …). Edit visually in GrapesJS; use {{title}}, {{slug}}, {{fieldName}} placeholders — or {{{fieldName}}} to render raw HTML.",
    components: {
      edit: {
        beforeDocumentControls: [
          "@/components/admin/EditVisuallyLink#EditTemplateVisuallyLink",
        ],
      },
    },
  },
  access: {
    read: () => true,
    create: isContentManager,
    update: isContentManager,
    delete: isContentManager,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "collection",
      type: "select",
      required: true,
      options: RENDERABLE_COLLECTIONS as unknown as { label: string; value: string }[],
      admin: { description: "Which collection this template renders." },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "detail",
      options: [
        { label: "Detail", value: "detail" },
        { label: "Index", value: "index" },
      ],
      admin: {
        description:
          "Detail renders a single document (/blog/my-post); index renders the collection listing (/blog). One template per collection + kind.",
      },
    },
    {
      name: "html",
      type: "code",
      admin: { language: "html", description: "Template HTML with {{placeholders}}.", ...CODE_FIELD_ADMIN },
    },
    { name: "css", type: "code", admin: { language: "css", ...CODE_FIELD_ADMIN } },
    {
      name: "theme",
      type: "relationship",
      relationTo: "themes",
      admin: { position: "sidebar", description: "Leave empty to share across all themes." },
    },
  ],
});
