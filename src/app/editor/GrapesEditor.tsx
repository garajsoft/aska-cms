"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export type EditorTarget =
  | { mode: "page"; slug: string; title: string }
  | { mode: "template"; id: string | number; name: string; postTypeSlug: string | null };

export interface FieldMeta {
  name: string;
  type: string;
  label?: string;
  hasMany?: boolean;
}

interface Props {
  target: EditorTarget;
  initial: { html: string; css: string };
  fields?: FieldMeta[];
  /** Palette section for the per-field blocks (e.g. "Ecommerce", "Blog"). */
  fieldCategory?: string;
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
      return f.hasMany
        ? `<img data-aska-field="${f.name}" src="{{${f.name}.0.url}}" alt="{{${f.name}.0.alt}}">`
        : `<img data-aska-field="${f.name}" src="{{${f.name}.url}}" alt="{{${f.name}.alt}}">`;
    case "textarea":
      return `<p data-aska-field="${f.name}">{{${f.name}}}</p>`;
    case "relationship":
      return `<span data-aska-field="${f.name}">{{${f.name}.id}}</span>`;
    default:
      return `<span data-aska-field="${f.name}">{{${f.name}}}</span>`;
  }
}

/** Icons as SVG strings for block palette */
const ICONS = {
  heading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
  paragraph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12v2H6V4zm0 4h12v2H6V8zm0 4h12v2H6v-2zm0 4h8v2H6v-2z"/></svg>`,
  button: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="10" rx="1"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  divider: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/></svg>`,
  spacer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16M4 12h16"/></svg>`,
  quote: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 4 3 4zm16 0c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 4 3 4z"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 3v18"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  form: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 5h3v3H6V8zm0 5h3v3H6v-3z"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
};

/** Layout & component blocks */
const COMPONENT_BLOCKS = [
  {
    id: "aska-hero",
    label: "Hero section",
    category: "Layout",
    icon: "heading",
    content: '<section style="padding:120px 24px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-align:center"><h1 style="font-size:56px;margin:0 0 24px;font-weight:700">Stunning hero section</h1><p style="font-size:20px;margin:0 0 32px;opacity:0.9">Your compelling value proposition here</p><button style="padding:12px 32px;background:#fff;color:#667eea;border:none;border-radius:4px;font-weight:600;cursor:pointer">Get started</button></section>',
  },
  {
    id: "aska-features",
    label: "Features grid (3 cols)",
    category: "Layout",
    icon: "grid",
    content: '<section style="padding:64px 24px;max-width:1200px;margin:0 auto"><h2 style="text-align:center;font-size:36px;margin:0 0 48px">Key features</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px"><div style="padding:24px"><h3 style="margin:0 0 12px;font-size:20px">Feature 1</h3><p style="color:#666;margin:0">Description goes here</p></div><div style="padding:24px"><h3 style="margin:0 0 12px;font-size:20px">Feature 2</h3><p style="color:#666;margin:0">Description goes here</p></div><div style="padding:24px"><h3 style="margin:0 0 12px;font-size:20px">Feature 3</h3><p style="color:#666;margin:0">Description goes here</p></div></div></section>',
  },
  {
    id: "aska-cta",
    label: "Call-to-action",
    category: "Layout",
    icon: "button",
    content: '<section style="padding:64px 24px;background:#f9f9f9;text-align:center"><h2 style="font-size:36px;margin:0 0 16px">Ready to get started?</h2><p style="color:#666;margin:0 0 24px;font-size:18px">Join thousands of happy users</p><button style="padding:14px 40px;background:#000;color:#fff;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-size:16px">Start free trial</button></section>',
  },
  {
    id: "aska-testimonial",
    label: "Testimonial card",
    category: "Layout",
    icon: "quote",
    content: '<div style="padding:32px;background:#f9f9f9;border-radius:8px;border-left:4px solid #667eea;max-width:600px"><p style="margin:0 0 16px;font-style:italic;font-size:18px">"This product changed how we work."</p><p style="margin:0;font-weight:600">– Customer Name</p></div>',
  },
];

/** Loop blocks: render the inner content once per post/product on pages. */
const LOOP_BLOCKS = [
  {
    id: "aska-loop-posts",
    label: "Posts loop",
    category: "Loops",
    icon: "list",
    content: '<div data-aska-loop="posts">{{#each posts}}<article style="margin-bottom:24px;padding:24px;border:1px solid #e5e5e5;border-radius:8px"><h3 style="margin:0 0 8px"><a href="/blog/{{slug}}" style="color:#667eea;text-decoration:none">{{title}}</a></h3><p style="margin:0;color:#666">{{excerpt}}</p></article>{{/each}}</div>',
  },
  {
    id: "aska-loop-products",
    label: "Products loop",
    category: "Loops",
    icon: "grid",
    content: '<div data-aska-loop="products" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">{{#each products}}<div style="padding:24px;border:1px solid #e5e5e5;border-radius:8px;text-align:center"><h3 style="margin:0 0 8px">{{name}}</h3><p style="font-size:24px;font-weight:700;color:#667eea;margin:0 0 16px">{{price}}</p><button style="padding:8px 16px;background:#667eea;color:#fff;border:none;border-radius:4px;cursor:pointer">Add to cart</button></div>{{/each}}</div>',
  },
];

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

export function GrapesEditor({ target, initial, fields = [], fieldCategory = "Collection Fields" }: Props) {
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
        { default: pluginExport },
      ] = await Promise.all([
        import("grapesjs"),
        import("grapesjs-preset-webpage"),
        import("grapesjs-blocks-basic"),
        import("grapesjs-plugin-forms"),
        import("grapesjs-plugin-export"),
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
        plugins: [presetWebpage, blocksBasic, forms, pluginExport],
        pluginsOpts: { "grapesjs-blocks-basic": { flexGrid: true } },
      });

      // Custom CSS for white/blue theme (lightweight)
      const stylesheet = document.createElement("style");
      stylesheet.textContent = `
        .gjs-block { background: white; border: 1px solid #e0e6ed; }
        .gjs-block:hover { background: #f0f4ff; }
        .gjs-category-title { background: #e8ecf7; color: #667eea; }
      `;
      document.head.appendChild(stylesheet);

      // Built-in placeholders and layout components
      const bm = editor.BlockManager;

      // Add layout components
      for (const block of COMPONENT_BLOCKS) {
        const iconSvg = ICONS[block.icon as keyof typeof ICONS] || ICONS.paragraph;
        bm.add(block.id, {
          label: block.label,
          category: block.category,
          content: block.content,
          attributes: { class: "gjs-block-custom" },
          media: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f0f4ff;border-radius:4px;color:#667eea">${iconSvg}</div>`,
        });
      }

      // Add field blocks
      bm.add("aska-field-title", {
        label: "Title",
        category: "Fields",
        content: '<h1 style="margin:0;font-size:32px;font-weight:700">{{title}}</h1>',
        media: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f0f4ff;border-radius:4px;color:#667eea">${ICONS.heading}</div>`,
      });
      bm.add("aska-field-slug", {
        label: "Slug",
        category: "Fields",
        content: '<code style="padding:4px 8px;background:#f0f4ff;border-radius:4px;color:#667eea">{{slug}}</code>',
        media: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f0f4ff;border-radius:4px;color:#667eea">${ICONS.code}</div>`,
      });

      // Add loop blocks
      for (const loop of LOOP_BLOCKS) {
        const iconSvg = ICONS[loop.icon as keyof typeof ICONS] || ICONS.list;
        bm.add(loop.id, {
          label: loop.label,
          category: loop.category,
          content: loop.content,
          media: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f0f4ff;border-radius:4px;color:#667eea">${iconSvg}</div>`,
        });
      }

      // Add collection field blocks
      for (const f of fields) {
        if (f.name === "title" || f.name === "slug") continue;
        const iconMap: { [key: string]: string } = {
          richText: "paragraph",
          upload: "image",
          date: "paragraph",
          textarea: "paragraph",
          relationship: "list",
        };
        const iconKey = iconMap[f.type] || "paragraph";
        const iconSvg = ICONS[iconKey as keyof typeof ICONS] || ICONS.paragraph;

        bm.add(`aska-field-${f.name}`, {
          label: `${f.label ?? f.name}${f.type !== "text" ? ` (${f.type})` : ""}`,
          category: fieldCategory,
          content: contentForField(f),
          media: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f0f4ff;border-radius:4px;color:#667eea">${iconSvg}</div>`,
        });
      }

      editorRef.current = editor;
    })();
    return () => {
      cancelled = true;
      editorRef.current?.destroy();
    };
  }, [initial.html, initial.css, target, fields, fieldCategory]);

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
          <Link href="/admin" className="text-zinc-500 hover:text-black">←</Link>
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
