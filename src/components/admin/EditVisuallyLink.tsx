"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import type { CSSProperties } from "react";

const style: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  background: "var(--theme-success-500)",
  color: "#fff",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 500,
  marginRight: "8px",
};

const disabledStyle: CSSProperties = {
  ...style,
  background: "var(--theme-elevation-100)",
  color: "var(--theme-elevation-500)",
  cursor: "not-allowed",
};

/** Opens the GrapesJS canvas for a Page (by its slug). */
export const EditPageVisuallyLink = () => {
  const info = useDocumentInfo() as { savedDocumentData?: { slug?: string } };
  const slug = info.savedDocumentData?.slug;
  if (!slug) {
    return <span style={disabledStyle}>Save the page to edit visually</span>;
  }
  return (
    <a
      href={`/editor?slug=${encodeURIComponent(slug)}`}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      Edit visually →
    </a>
  );
};

/** Opens the GrapesJS canvas for a Template (by its id). */
export const EditTemplateVisuallyLink = () => {
  const info = useDocumentInfo() as { id?: string | number };
  const id = info.id;
  if (!id) {
    return <span style={disabledStyle}>Save the template to edit visually</span>;
  }
  return (
    <a
      href={`/editor/template/${encodeURIComponent(String(id))}`}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      Edit visually →
    </a>
  );
};

export default EditPageVisuallyLink;
