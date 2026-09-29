import type { CollectionConfig } from "payload";
import { isContentManager } from "@/lib/auth/roles";
import { isSignedIn } from "@/lib/auth/isSignedIn";

export const Themes: CollectionConfig = {
  slug: "themes",
  admin: {
    group: "Theme",
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "active"],
    description:
      "Named theme bundles. The active theme's homepage and menus override Settings → Navigation, and its tagged Styles/Templates/Components/Menus/Pages take precedence over shared (untagged) documents.",
  },
  access: {
    read: isSignedIn,
    create: isContentManager,
    update: isContentManager,
    delete: isContentManager,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        if (!data?.active || req.context.skipThemeActivation) return data;
        await req.payload.update({
          collection: "themes",
          where: {
            and: [
              { active: { equals: true } },
              ...(originalDoc?.id != null ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          data: { active: false },
          context: { skipThemeActivation: true },
        });
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    { name: "description", type: "textarea" },
    {
      name: "active",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Only one theme can be active — activating this one deactivates the others.",
      },
    },
    {
      name: "homepage",
      type: "relationship",
      relationTo: "pages",
      admin: {
        description: "Rendered at / instead of the Settings homepage while this theme is active.",
      },
    },
    {
      name: "primaryMenu",
      type: "relationship",
      relationTo: "menus",
      admin: { description: "Header nav override — falls back to Settings → Navigation." },
    },
    {
      name: "footerMenu",
      type: "relationship",
      relationTo: "menus",
      admin: { description: "Footer nav override — falls back to Settings → Navigation." },
    },
  ],
};
