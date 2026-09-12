import type { CollectionConfig } from "payload";
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  InlineCodeFeature,
  ParagraphFeature,
  HeadingFeature,
  AlignFeature,
  IndentFeature,
  UnorderedListFeature,
  OrderedListFeature,
  ChecklistFeature,
  LinkFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";

export const Blog: CollectionConfig = {
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
      type: "richText",
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          SubscriptFeature(),
          SuperscriptFeature(),
          InlineCodeFeature(),
          AlignFeature(),
          IndentFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          ChecklistFeature(),
          BlockquoteFeature(),
          HorizontalRuleFeature(),
          LinkFeature({ enabledCollections: ["pages", "blog", "products"] }),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: "width",
                    type: "text",
                    label: "Width",
                    admin: {
                      description:
                        "CSS width — e.g. 100%, 400px, 50vw. (Drag-to-resize planned.)",
                    },
                  },
                  { name: "alt", type: "text", label: "Alt text" },
                  { name: "caption", type: "text", label: "Caption" },
                ],
              },
            },
          }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
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
  ],
};
