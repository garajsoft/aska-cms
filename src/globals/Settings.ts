import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: "settings",
  access: { read: () => true },
  admin: { description: "Site-wide settings." },
  fields: [
    {
      name: "homepage",
      type: "relationship",
      relationTo: "pages",
      admin: {
        description: "The page rendered at /. Leave empty to show the page list.",
      },
    },
  ],
};
