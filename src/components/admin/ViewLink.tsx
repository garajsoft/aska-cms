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

/** Renders a "View" link for Pages using the doc's own slug. */
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

/** Renders a "View" link for Posts using postType.slug + doc slug. */
export const ViewPostLink = () => {
  const info = useDocumentInfo() as {
    savedDocumentData?: {
      slug?: string;
      _status?: string;
      postType?: { slug?: string } | string | number;
    };
  };
  const data = info.savedDocumentData;
  const slug = data?.slug;
  const pt = data?.postType;
  const ptSlug = pt && typeof pt === "object" ? pt.slug : undefined;
  if (!slug || !ptSlug) return null;
  const isDraft = data?._status !== "published";
  return (
    <a
      href={`/${ptSlug}/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      View{isDraft ? " (draft)" : ""} →
    </a>
  );
};

export default ViewPageLink;
