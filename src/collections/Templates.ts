import type { CollectionConfig } from "payload";

export const Templates: CollectionConfig = {
  slug: "templates",
  admin: {
    group: "Theme",
    useAsTitle: "name",
    defaultColumns: ["name", "postType", "updatedAt"],
    description:
      "Layouts for a post type. Edit visually in GrapesJS; drop 'Field' blocks referencing custom fields as {{fields.KEY}}, or built-ins like {{title}} and {{slug}}.",
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "postType",
      type: "relationship",
      relationTo: "post-types",
      required: true,
      unique: true,
      admin: { description: "One template per post type." },
    },
    {
      name: "html",
      type: "code",
      admin: { language: "html", description: "Template HTML with {{placeholders}}." },
    },
    {
      name: "css",
      type: "code",
      admin: { language: "css" },
    },
  ],
};
