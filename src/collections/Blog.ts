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
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL segment: /blog/<slug>." },
    },
    { name: "excerpt", type: "textarea", maxLength: 320 },
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
                        "CSS width — e.g. 100%, 400px, 50vw. Leave empty for full width. (Drag-to-resize planned.)",
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
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "author", type: "relationship", relationTo: "users" },
    { name: "publishedAt", type: "date" },
    {
      type: "collapsible",
      label: "SEO & Social",
      admin: { initCollapsed: true },
      fields: [
        { name: "metaDescription", type: "textarea", maxLength: 320 },
        { name: "shareImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
