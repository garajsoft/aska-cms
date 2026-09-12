import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "postType", "slug", "_status", "updatedAt"],
    description:
      "Entries of a given post type. Editable as a form (no visual editor) — the template controls the layout.",
    listSearchableFields: ["title", "slug"],
  },
  access: { read: () => true },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
      admin: { description: "URL segment within the post type." },
    },
    {
      name: "postType",
      type: "relationship",
      relationTo: "post-types",
      required: true,
      admin: {
        description: "Determines the template + which custom fields apply.",
      },
    },
    {
      type: "collapsible",
      label: "SEO & Social",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "metaDescription",
          type: "textarea",
          maxLength: 320,
        },
        {
          name: "shareImage",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
    {
      name: "fields",
      type: "json",
      admin: {
        description:
          "Values keyed by custom-field `key`. e.g. { \"hero_image\": \"https://...\", \"lede\": \"...\" }.",
      },
    },
  ],
  indexes: [{ fields: ["postType", "slug"], unique: true }],
};
