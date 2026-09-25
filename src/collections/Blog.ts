import type { CollectionConfig } from "payload";
import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import { withImportExportUI } from "@/lib/importExport/withImportExportUI";
import { embedBlock } from "@/lib/richtext/embedBlock";

export const Blog: CollectionConfig = withImportExportUI({
  slug: "blog",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  // Native Payload trash: delete in the admin UI sets deletedAt (soft delete)
  // and the doc moves to the collection's Trash view; find/count/findByID
  // automatically exclude trashed docs. Permanent delete is a separate action.
  trash: true,
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
  versions: { drafts: { autosave: true, schedulePublish: true } },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "content",
      label: "Body",
      type: "richText",
      required: true,
      admin: {
        description:
          "Write the blog post body here. Use the toolbar or slash menu to format text and insert images.",
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          BlocksFeature({ blocks: [embedBlock] }),
          UploadFeature({
            enabledCollections: ["media"],
            collections: {
              media: {
                fields: [
                  { name: "alt", type: "text", label: "Alt text" },
                  { name: "caption", type: "text", label: "Caption" },
                  {
                    name: "width",
                    type: "text",
                    label: "Width",
                    admin: {
                      description:
                        "CSS width — e.g. 100%, 400px, 50vw. Or drag the corner handle on the image.",
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
      name: "category",
      type: "relationship",
      relationTo: "categories",
      admin: { position: "sidebar" },
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      admin: { position: "sidebar", description: "Press Enter to add each tag." },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Pin this post as sticky/featured.",
      },
    },
    {
      name: "visibility",
      type: "select",
      defaultValue: "public",
      options: [
        { label: "Public", value: "public" },
        { label: "Password protected", value: "password" },
        { label: "Private (admins only)", value: "private" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "postPassword",
      type: "text",
      admin: {
        position: "sidebar",
        description: "Required when visibility is password protected.",
        condition: (_data, siblingData) => siblingData?.visibility === "password",
      },
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
  ],
});
