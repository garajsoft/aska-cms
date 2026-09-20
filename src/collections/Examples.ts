import type { CollectionConfig } from "payload";

/**
 * Showcase of ALL Payload field types available for reference.
 * This collection demonstrates every field type so you can understand
 * what's possible when building your own collections.
 */
export const Examples: CollectionConfig = {
  slug: "examples",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "updatedAt"],
    description: "Field type reference - shows all Payload capabilities",
  },
  versions: {
    drafts: { autosave: false },
  },
  access: { read: () => true },
  fields: [
    // Text fields
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "Basic text field" },
    },
    {
      name: "description",
      type: "textarea",
      admin: { description: "Textarea for longer text" },
    },

    // Rich text
    {
      name: "richContent",
      type: "richText",
      admin: { description: "Full WYSIWYG editor with formatting" },
    },

    // Numbers
    {
      name: "quantity",
      type: "number",
      admin: { description: "Numeric field" },
    },
    {
      name: "price",
      type: "number",
      admin: { description: "Can be number with decimals" },
    },

    // Dates
    {
      name: "publishDate",
      type: "date",
      admin: { description: "Date picker field" },
    },

    // Checkboxes
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Boolean checkbox" },
    },

    // Select/Radio
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      admin: { description: "Dropdown select field" },
    },

    // Radio buttons
    {
      name: "format",
      type: "radio",
      options: [
        { label: "Article", value: "article" },
        { label: "Guide", value: "guide" },
        { label: "Tutorial", value: "tutorial" },
      ],
      admin: { description: "Radio button group" },
    },

    // Upload/Media
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "File/image upload" },
    },

    // Arrays
    {
      name: "tags",
      type: "array",
      admin: { description: "Array of simple values" },
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },

    // Groups (nested fields)
    {
      type: "group",
      name: "metadata",
      label: "Metadata",
      admin: { description: "Grouped/nested fields" },
      fields: [
        {
          name: "author",
          type: "text",
        },
        {
          name: "keywords",
          type: "textarea",
        },
      ],
    },

    // Relationships
    {
      name: "relatedPages",
      type: "relationship",
      relationTo: "pages",
      hasMany: true,
      admin: { description: "Link to other documents" },
    },

    // JSON
    {
      name: "customData",
      type: "json",
      admin: { description: "Store arbitrary JSON" },
    },

    // Point (for maps)
    {
      name: "location",
      type: "point",
      admin: { description: "Geolocation field" },
    },

    // Collapsible section
    {
      type: "collapsible",
      label: "Advanced Options",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "customClass",
          type: "text",
          admin: { description: "CSS class name" },
        },
        {
          name: "hideFromSearch",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },

    // Tabs
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "bodyContent",
              type: "richText",
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              maxLength: 60,
            },
            {
              name: "metaDescription",
              type: "textarea",
              maxLength: 160,
            },
          ],
        },
        {
          label: "Analytics",
          fields: [
            {
              name: "views",
              type: "number",
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
};
