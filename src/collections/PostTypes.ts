import type { CollectionConfig } from "payload";

export const PostTypes: CollectionConfig = {
  slug: "post-types",
  admin: {
    group: "Configuration",
    useAsTitle: "singular",
    defaultColumns: ["singular", "slug", "updatedAt"],
    description:
      "Content shapes (e.g. Blog Post, Product, Recipe). Each has its own template and custom fields.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "singular",
      type: "text",
      required: true,
      admin: { description: "e.g. 'Blog Post'." },
    },
    {
      name: "plural",
      type: "text",
      required: true,
      admin: { description: "e.g. 'Blog Posts'." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "URL segment for posts of this type. e.g. 'blog' -> /blog/my-post.",
      },
    },
  ],
};
