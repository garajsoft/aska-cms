"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export type EditorTarget =
  | { mode: "page"; slug: string; title: string }
  | { mode: "template"; id: string | number; name: string; postTypeSlug: string | null };

export interface FieldMeta {
  name: string;
  type: string;
}

interface Props {
  target: EditorTarget;
  initial: { html: string; css: string };
  fields?: FieldMeta[];
}

/**
 * Return the GrapesJS block content for a given field, using the correct
 * placeholder syntax so the render engine substitutes safely:
 *   richText → {{{name}}} (raw HTML)
 *   upload   → <img src="{{name.url}}" alt="{{name.alt}}"> (populated media object)
 *   date     → {{name}} (string form)
 *   text/textarea/number/… → {{name}} (escaped)
 */
function contentForField(f: FieldMeta): string {
  switch (f.type) {
    case "richText":
      return `<div data-aska-field="${f.name}">{{{${f.name}}}}</div>`;
    case "upload":
      return `<img data-aska-field="${f.name}" src="{{${f.name}.url}}" alt="{{${f.name}.alt}}">`;
    case "textarea":
      return `<p data-aska-field="${f.name}">{{${f.name}}}</p>`;
    case "relationship":
      return `<span data-aska-field="${f.name}">{{${f.name}.id}}</span>`;
    default:
      return `<span data-aska-field="${f.name}">{{${f.name}}}</span>`;
  }
}

function buildSaveUrl(t: EditorTarget) {
  return t.mode === "page"
    ? `/api/editor/pages/${encodeURIComponent(t.slug)}`
    : `/api/editor/templates/${encodeURIComponent(String(t.id))}`;
}

function buildSaveBody(t: EditorTarget, html: string, css: string) {
  return t.mode === "page"
    ? { title: t.title, html, css }
    : { html, css };
}

function viewHref(t: EditorTarget): string | null {
  if (t.mode === "page") return `/${t.slug}`;
  return null;
}

function label(t: EditorTarget): string {
  return t.mode === "page" ? `/${t.slug}` : `${t.name} (template)`;
}

export function GrapesEditor({ target, initial, fields = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [
        { default: grapesjs },
        { default: presetWebpage },
        { default: blocksBasic },
        { default: forms },
      ] = await Promise.all([
        import("grapesjs"),
        import("grapesjs-preset-webpage"),
        import("grapesjs-blocks-basic"),
        import("grapesjs-plugin-forms"),
      ]);
      if (cancelled || !containerRef.current) return;

      const editor = grapesjs.init({
        container: containerRef.current,
        height: "calc(100vh - 44px)",
        width: "auto",
        storageManager: false,
        fromElement: false,
        components:
          initial.html ||
          `<section style="padding:64px 24px;text-align:center;font-family:sans-serif"><h1>${
            target.mode === "page" ? target.title : target.name
          }</h1></section>`,
        style: initial.css || "",
        plugins: [presetWebpage, blocksBasic, forms],
        pluginsOpts: { "grapesjs-blocks-basic": { flexGrid: true } },
      });

      // Add built-in placeholders (title, slug) always available.
      const bm = editor.BlockManager;
      bm.add("aska-field-title", {
        label: "Post title",
        category: "Fields",
        content: '<h1>{{title}}</h1>',
      });
      bm.add("aska-field-slug", {
        label: "Post slug",
        category: "Fields",
        content: "<code>{{slug}}</code>",
      });
      for (const f of fields) {
        if (f.name === "title" || f.name === "slug") continue;
        bm.add(`aska-field-${f.name}`, {
          label: `${f.name}${f.type !== "text" ? ` · ${f.type}` : ""}`,
          category: "Collection Fields",
          content: contentForField(f),
        });
      }

      editorRef.current = editor;
    })();
    return () => {
      cancelled = true;
      editorRef.current?.destroy();
    };
  }, [initial.html, initial.css, target, fields]);

  async function handleSave() {
    if (!editorRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const html = editorRef.current.getHtml() ?? "";
      const css = editorRef.current.getCss() ?? "";
      const res = await fetch(buildSaveUrl(target), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSaveBody(target, html, css)),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const view = viewHref(target);

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 text-sm">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-zinc-500 hover:text-black">←</a>
          <span className="font-medium">Editing</span>
          <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs">{label(target)}</code>
          {error && (
            <span className="text-xs text-red-600" title={error}>
              Save failed
            </span>
          )}
          {!error && lastSaved && (
            <span className="text-xs text-zinc-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {view && (
            <a
              href={view}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5"
            >
              View
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-black px-4 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
