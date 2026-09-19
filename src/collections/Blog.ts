import type { CollectionConfig } from "payload";
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import { withImportExportUI } from "@/lib/importExport/withImportExportUI";

export const Blog: CollectionConfig = withImportExportUI({
  slug: "blog",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "_status", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    components: {
      edit: {
        beforeDocumentControls: ["@/components/admin/ViewLink#ViewBlogLink"],
      },
    },
  },
  access: { read: () => true },
  versions: { drafts: { autosave: false, schedulePublish: false } },
  fields: [
    // Main column (large, on the right in Payload's split view).
    { name: "title", type: "text", required: true },
    {
      name: "content",
      label: "Body",
      type: "richText",
      required: true,
      admin: {
        description:
          "Write the blog post body here. Use the toolbar or slash menu to format text and insert images. Drag image corners to resize.",
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          UploadFeature({
            enabledCollections: ["media"],
            collections: {
              media: {
                fields: [
                  { name: "alt", type: "text", label: "Alt text", required: true },
                  { name: "caption", type: "text", label: "Caption" },
                  {
                    name: "width",
                    type: "text",
                    label: "Width",
                    admin: {
                      description: "CSS width — e.g. 100%, 400px, 600px. Drag bottom-right corner to resize.",
                    },
                  },
                  {
                    name: "height",
                    type: "text",
                    label: "Height",
                    admin: {
                      description: "CSS height — e.g. auto, 300px. Leave auto to maintain aspect ratio.",
                    },
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
    // Sidebar column (all settings / metadata / SEO on the left of the editor).
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "URL segment: /blog/<slug>." },
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 320,
      admin: { position: "sidebar" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "metaDescription",
      type: "textarea",
      maxLength: 320,
      admin: { position: "sidebar", description: "SEO meta description." },
    },
    {
      name: "shareImage",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar", description: "Social share image." },
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Technology", value: "technology" },
        { label: "Business", value: "business" },
        { label: "Design", value: "design" },
        { label: "Marketing", value: "marketing" },
        { label: "Engineering", value: "engineering" },
        { label: "Culture", value: "culture" },
        { label: "Other", value: "other" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "tags",
      type: "array",
      admin: { position: "sidebar", description: "Search and filtering tags." },
      fields: [
        { name: "tag", type: "text", required: true },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Show on homepage and featured sections." },
    },
    {
      name: "readingTime",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Estimated minutes to read (auto-calculate based on word count).",
        readOnly: true,
      },
    },
    {
      name: "metaTitle",
      type: "text",
      maxLength: 60,
      admin: { position: "sidebar", description: "SEO page title (60 chars max)." },
    },
    {
      name: "keywords",
      type: "textarea",
      admin: { position: "sidebar", description: "SEO keywords (comma-separated)." },
    },
  ],
});
