import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: { read: () => true },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL path, e.g. 'home' or 'about'." },
    },
    {
      name: "html",
      type: "code",
      admin: { language: "html", description: "HTML from GrapesJS." },
    },
    {
      name: "css",
      type: "code",
      admin: { language: "css", description: "CSS from GrapesJS." },
    },
  ],
};
