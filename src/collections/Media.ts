import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  // Must match the persistent volume mounted in Coolify at /app/public/media
  // (relative to cwd, which is /app at runtime) - without this, uploads
  // default to /app/media, an unmounted path wiped on every deploy.
  upload: {
    staticDir: "public/media",
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 800 },
      { name: "hero", width: 1600 },
    ],
  },
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
