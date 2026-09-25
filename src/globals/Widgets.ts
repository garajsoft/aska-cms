import type { Block, GlobalConfig } from "payload";
import { isContentManager } from "@/lib/auth/roles";
import { CODE_FIELD_ADMIN } from "@/lib/adminFields/codeEditor";

const HeadingBlock: Block = {
  slug: "heading",
  labels: { singular: "Heading", plural: "Headings" },
  fields: [{ name: "text", type: "text", required: true }],
};

const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Rich Text", plural: "Rich Text" },
  fields: [{ name: "content", type: "richText" }],
};

const RecentPostsBlock: Block = {
  slug: "recentPosts",
  labels: { singular: "Recent Posts", plural: "Recent Posts" },
  fields: [
    {
      name: "count",
      type: "number",
      defaultValue: 5,
      admin: { description: "How many latest blog posts to list." },
    },
  ],
};

const CategoriesBlock: Block = {
  slug: "categories",
  labels: { singular: "Category List", plural: "Category Lists" },
  fields: [],
};

const SearchBoxBlock: Block = {
  slug: "searchBox",
  labels: { singular: "Search Box", plural: "Search Boxes" },
  fields: [],
};

const FormBlock: Block = {
  // interfaceName avoids a generated-types collision with the Forms collection
  // (singularized to "Form") once `payload generate:types` works again.
  slug: "form",
  interfaceName: "WidgetsForm",
  labels: { singular: "Form", plural: "Forms" },
  fields: [
    {
      name: "form",
      type: "relationship",
      relationTo: "forms",
      required: true,
    },
  ],
};

const HtmlBlock: Block = {
  slug: "html",
  labels: { singular: "Custom HTML", plural: "Custom HTML" },
  fields: [
    {
      name: "code",
      type: "code",
      required: true,
      admin: { language: "html", ...CODE_FIELD_ADMIN },
    },
  ],
};

export const Widgets: GlobalConfig = {
  slug: "widgets",
  label: "Widgets",
  access: { read: () => true, update: isContentManager },
  admin: {
    group: "Theme",
    description: "Sidebar and footer widgets for the public site.",
  },
  fields: [
    {
      name: "areas",
      type: "array",
      admin: { description: "One row per widget area on the site." },
      fields: [
        {
          name: "area",
          type: "select",
          required: true,
          options: [
            { label: "Sidebar", value: "sidebar" },
            { label: "Footer column 1", value: "footer_1" },
            { label: "Footer column 2", value: "footer_2" },
            { label: "Footer column 3", value: "footer_3" },
          ],
        },
        {
          name: "items",
          type: "blocks",
          blocks: [
            HeadingBlock,
            RichTextBlock,
            RecentPostsBlock,
            CategoriesBlock,
            SearchBoxBlock,
            FormBlock,
            HtmlBlock,
          ],
        },
      ],
    },
  ],
};
