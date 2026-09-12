import type { CollectionConfig } from "payload";

export const Blog: CollectionConfig = {
  slug: "blog",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "_status", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    components: {
      edit: {
        beforeDocumentControls: ["@/components/admin/ViewLink#ViewBlogLink"],
      },
    },
  },
  access: { read: () => true },
  versions: { drafts: { autosave: false, schedulePublish: false } },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL segment: /blog/<slug>." },
    },
    { name: "excerpt", type: "textarea", maxLength: 320 },
    { name: "content", type: "richText" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "author", type: "relationship", relationTo: "users" },
    { name: "publishedAt", type: "date" },
    {
      type: "collapsible",
      label: "SEO & Social",
      admin: { initCollapsed: true },
      fields: [
        { name: "metaDescription", type: "textarea", maxLength: 320 },
        { name: "shareImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
