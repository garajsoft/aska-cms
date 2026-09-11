"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

interface Props {
  slug: string;
  initial: { title: string; slug: string; html: string; css: string };
}

export function GrapesEditor({ slug, initial }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ default: grapesjs }, { default: presetWebpage }, { default: blocksBasic }, { default: forms }] =
        await Promise.all([
          import("grapesjs"),
          import("grapesjs-preset-webpage"),
          import("grapesjs-blocks-basic"),
          import("grapesjs-plugin-forms"),
        ]);
      if (cancelled || !containerRef.current) return;
      editorRef.current = grapesjs.init({
        container: containerRef.current,
        height: "calc(100vh - 44px)",
        width: "auto",
        storageManager: false,
        fromElement: false,
        components:
          initial.html ||
          `<section style="padding:64px 24px;text-align:center;font-family:sans-serif"><h1>${initial.title}</h1></section>`,
        style: initial.css || "",
        plugins: [presetWebpage, blocksBasic, forms],
        pluginsOpts: { "grapesjs-blocks-basic": { flexGrid: true } },
      });
    })();
    return () => {
      cancelled = true;
      editorRef.current?.destroy();
    };
  }, [initial.html, initial.css, initial.title]);

  async function handleSave() {
    if (!editorRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss();
      const res = await fetch(`/api/editor/pages/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: initial.title, html, css }),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 text-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="text-zinc-500 hover:text-black">←</a>
          <span className="font-medium">Editing</span>
          <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs">/{slug}</code>
          {error && <span className="text-xs text-red-600" title={error}>Save failed</span>}
          {!error && lastSaved && (
            <span className="text-xs text-zinc-500">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5"
          >
            View
          </a>
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
