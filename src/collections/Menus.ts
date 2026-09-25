import type { Block, CollectionConfig, Field } from "payload";

/** One menu entry. A function, not a shared array: each block/array needs its
 * own field objects so Payload's per-field config sanitization doesn't mutate
 * one copy through another's reference (same pattern as Forms.ts). */
const linkFields = (withChildren: boolean): Field[] => [
  { name: "label", type: "text", required: true },
  {
    name: "linkType",
    type: "select",
    defaultValue: "url",
    options: [
      { label: "Page", value: "page" },
      { label: "Blog post", value: "post" },
      { label: "Custom URL", value: "url" },
    ],
  },
  {
    name: "page",
    type: "relationship",
    relationTo: "pages",
    admin: {
      description: "Internal page this item links to.",
      condition: (_data, siblingData) => siblingData?.linkType === "page",
    },
  },
  {
    name: "post",
    type: "relationship",
    relationTo: "blog",
    admin: {
      description: "Blog post this item links to.",
      condition: (_data, siblingData) => siblingData?.linkType === "post",
    },
  },
  {
    name: "url",
    type: "text",
    admin: {
      description: "Any absolute or relative URL, e.g. https://example.com or /about.",
      condition: (_data, siblingData) => siblingData?.linkType === "url",
    },
  },
  ...(withChildren
    ? [
        {
          name: "children",
          type: "array",
          label: "Submenu items",
          admin: { description: "One level of nesting — these render as a dropdown." },
          fields: linkFields(false),
        } satisfies Field,
      ]
    : []),
];

const LinkBlock: Block = {
  slug: "link",
  labels: { singular: "Link", plural: "Links" },
  fields: linkFields(true),
};

export const Menus: CollectionConfig = {
  slug: "menus",
  labels: { singular: "Menu", plural: "Menus" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "updatedAt"],
    description: "Navigation menus — assigned to header/footer in Settings → Navigation.",
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "items",
      type: "blocks",
      blocks: [LinkBlock],
      admin: { description: "Top-level menu items, in display order." },
    },
  ],
};
