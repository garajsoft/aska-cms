"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import type { CSSProperties } from "react";

const style: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-elevation-1000)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 500,
  marginRight: "8px",
};

/** "View" link for Pages using the doc's slug. */
export const ViewPageLink = () => {
  const info = useDocumentInfo() as { savedDocumentData?: { slug?: string; _status?: string } };
  const slug = info.savedDocumentData?.slug;
  if (!slug) return null;
  const isDraft = info.savedDocumentData?._status !== "published";
  return (
    <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" style={style}>
      View{isDraft ? " (draft)" : ""} →
    </a>
  );
};

/** "View" link for Blog posts — /blog/<slug>. */
export const ViewBlogLink = () => {
  const info = useDocumentInfo() as { savedDocumentData?: { slug?: string; _status?: string } };
  const slug = info.savedDocumentData?.slug;
  if (!slug) return null;
  const isDraft = info.savedDocumentData?._status !== "published";
  return (
    <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" style={style}>
      View{isDraft ? " (draft)" : ""} →
    </a>
  );
};

/** "View" link for Products — /products/<slug>. */
export const ViewProductLink = () => {
  const info = useDocumentInfo() as { savedDocumentData?: { slug?: string } };
  const slug = info.savedDocumentData?.slug;
  if (!slug) return null;
  return (
    <a href={`/products/${slug}`} target="_blank" rel="noopener noreferrer" style={style}>
      View →
    </a>
  );
};

export default ViewPageLink;
