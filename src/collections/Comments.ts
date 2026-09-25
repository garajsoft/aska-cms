import type { CollectionConfig } from "payload";
import { isEditorOrAbove } from "@/lib/auth/roles";

export const Comments: CollectionConfig = {
  slug: "comments",
  labels: { singular: "Comment", plural: "Comments" },
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "post", "status", "createdAt"],
    listSearchableFields: ["authorName", "content"],
  },
  access: {
    // Anyone can comment; the public only ever sees approved comments while
    // signed-in staff see everything (moderation happens in /admin).
    create: () => true,
    read: ({ req }) => (req.user ? true : { status: { equals: "approved" } }),
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      name: "post",
      type: "relationship",
      relationTo: "blog",
      required: true,
      index: true,
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "comments",
      admin: {
        description: "Comment this is a reply to — one level of threading.",
      },
    },
    { name: "authorName", type: "text", required: true },
    { name: "authorEmail", type: "text", required: true },
    { name: "authorUrl", type: "text", label: "Author URL" },
    { name: "content", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Spam", value: "spam" },
        { label: "Trash", value: "trash" },
      ],
    },
  ],
};
