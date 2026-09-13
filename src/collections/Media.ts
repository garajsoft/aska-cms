import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      admin: {
        description: "Describe the image for accessibility and search previews.",
      },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description: "Optional caption used when the image is embedded in rich text.",
      },
    },
  ],
};
