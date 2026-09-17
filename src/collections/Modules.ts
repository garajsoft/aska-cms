import type { CollectionConfig } from "payload";

/**
 * Reusable content modules. Configure one here, give it a name, then drag it
 * into any page from the visual editor's "Modules" block category (labeled
 * by the name set below). Currently supports Google Reviews; add new `type`
 * options here as more module kinds are built.
 */
export const Modules: CollectionConfig = {
  slug: "modules",
  labels: { singular: "Module", plural: "Modules" },
  admin: {
    group: "Theme",
    useAsTitle: "name",
    defaultColumns: ["name", "type", "displayStyle", "updatedAt"],
    description:
      "Reusable content blocks you can drag into pages from the visual editor, found under the block palette's Modules category.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Shown as the block's label in the visual editor." },
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "googleReviews",
      options: [{ label: "Google Reviews", value: "googleReviews" }],
    },
    {
      name: "googleMapsUrl",
      type: "text",
      required: true,
      admin: {
        description:
          "Paste the Google Maps URL for the business location - e.g. copied from the address bar after finding it on Google Maps.",
        condition: (_, siblingData) => siblingData?.type === "googleReviews",
      },
    },
    {
      name: "displayStyle",
      type: "select",
      required: true,
      defaultValue: "grid",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Marquee (scrolling)", value: "marquee" },
        { label: "Single review carousel", value: "carousel" },
      ],
      admin: { condition: (_, siblingData) => siblingData?.type === "googleReviews" },
    },
    {
      name: "maxReviews",
      type: "number",
      defaultValue: 5,
      min: 1,
      max: 5,
      admin: {
        description: "Google's API returns at most 5 reviews per location - this can't be raised.",
        condition: (_, siblingData) => siblingData?.type === "googleReviews",
      },
    },
    {
      name: "minRating",
      type: "number",
      min: 1,
      max: 5,
      admin: {
        description: "Optional - hide reviews below this star rating.",
        condition: (_, siblingData) => siblingData?.type === "googleReviews",
      },
    },
    // Resolved/cached state, written by the render pipeline - not hand-edited.
    {
      name: "placeId",
      type: "text",
      admin: {
        readOnly: true,
        description: "Auto-resolved from the Maps URL above on first render.",
        condition: (_, siblingData) => siblingData?.type === "googleReviews",
      },
    },
    { name: "cachedReviews", type: "json", admin: { readOnly: true, hidden: true } },
    { name: "cachedAt", type: "date", admin: { readOnly: true, hidden: true } },
    { name: "cacheError", type: "text", admin: { readOnly: true, hidden: true } },
  ],
};
