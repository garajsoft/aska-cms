import type { CollectionConfig } from "payload";

export const CustomFields: CollectionConfig = {
  slug: "custom-fields",
  admin: {
    group: "Configuration",
    useAsTitle: "label",
    defaultColumns: ["label", "key", "type", "updatedAt"],
    description:
      "Field definitions. Attach to post types to make them editable per post; reference by key from templates as {{fields.KEY}}.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "Human name shown in editor forms." },
    },
    {
      name: "key",
      type: "text",
      required: true,
      index: true,
      admin: {
        description:
          "Snake_case identifier used in template placeholders, e.g. `hero_image`.",
      },
      validate: (val: unknown) => {
        if (typeof val !== "string" || !/^[a-z][a-z0-9_]*$/.test(val)) {
          return "Key must be lowercase letters/digits/underscores, starting with a letter.";
        }
        return true;
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "text",
      options: [
        { label: "Text", value: "text" },
        { label: "Textarea", value: "textarea" },
        { label: "Rich text (HTML)", value: "richText" },
        { label: "Number", value: "number" },
        { label: "Date", value: "date" },
        { label: "Media URL", value: "media" },
        { label: "URL", value: "url" },
      ],
    },
    {
      name: "attachedTo",
      type: "relationship",
      relationTo: "post-types",
      hasMany: true,
      admin: {
        description: "Which post types this field appears on.",
      },
    },
  ],
};
