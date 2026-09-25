import "server-only";
import { getPayload, type Payload } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import config from "@/payload.config";
import type { Widgets as WidgetsGlobal } from "@/payload-types";

/**
 * Server-side renderer for the Widgets global's `sidebar` area, handed to
 * templates as {{{sidebarHtml}}} (same contract as {{{commentsHtml}}}).
 * Everything user-supplied is escaped; the only trusted markup is what this
 * file writes itself plus the `html` widget, which follows the RenderedHtml
 * model (content-manager-only input). Form widgets POST JSON to
 * /api/form-submissions via the tiny inline script below — a plain form POST
 * would be form-encoded, which the Payload REST API rejects.
 */

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type WidgetItem = NonNullable<NonNullable<WidgetsGlobal["areas"]>[number]["items"]>[number];

interface FormFieldBlock {
  blockType: "text" | "email" | "textarea" | "select";
  name: string;
  label: string;
  required?: boolean | null;
  options?: { label: string; value: string }[] | null;
}

interface FormDoc {
  id: number;
  title: string;
  submitButtonLabel?: string | null;
  fields?: FormFieldBlock[] | null;
  confirmationMessage?: unknown;
}

const FORM_SCRIPT =
  `<script>(() => {` +
  `document.querySelectorAll('.ax-widget-form').forEach((wrap) => {` +
  `if (wrap.dataset.axBound) return;` +
  `wrap.dataset.axBound = '1';` +
  `const f = wrap.querySelector('form');` +
  `if (!f) return;` +
  `f.addEventListener('submit', async (e) => {` +
  `e.preventDefault();` +
  `const submissionData = Object.fromEntries(new FormData(f).entries());` +
  `try {` +
  `const res = await fetch('/api/form-submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form: wrap.dataset.formId, submissionData }) });` +
  `if (!res.ok) throw new Error('bad status');` +
  `f.hidden = true;` +
  `wrap.querySelector('.ax-widget-form-success').hidden = false;` +
  `wrap.querySelector('.ax-widget-form-error').hidden = true;` +
  `} catch {` +
  `wrap.querySelector('.ax-widget-form-error').hidden = false;` +
  `}` +
  `});` +
  `});` +
  `})();</script>`;

function formFieldHtml(field: FormFieldBlock): string {
  const req = field.required ? " required" : "";
  const name = esc(field.name);
  switch (field.blockType) {
    case "textarea":
      return `<label>${esc(field.label)}<textarea name="${name}" rows="4"${req}></textarea></label>`;
    case "select":
      return (
        `<label>${esc(field.label)}<select name="${name}"${req}>` +
        `<option value="">Choose…</option>` +
        (field.options ?? [])
          .map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`)
          .join("") +
        `</select></label>`
      );
    case "email":
      return `<label>${esc(field.label)}<input type="email" name="${name}"${req}></label>`;
    default:
      return `<label>${esc(field.label)}<input type="text" name="${name}"${req}></label>`;
  }
}

async function renderWidget(p: Payload, item: WidgetItem): Promise<string> {
  switch (item.blockType) {
    case "heading":
      return `<h3 class="ax-widget-title">${esc(item.text)}</h3>`;

    case "richText":
      if (!item.content) return "";
      return convertLexicalToHTML({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: item.content as any,
      });

    case "recentPosts": {
      const count = Math.max(1, item.count ?? 5);
      const r = await p.find({
        collection: "blog",
        where: { _status: { equals: "published" } },
        sort: "-publishedAt",
        limit: count,
        depth: 0,
      });
      const docs = r.docs as unknown as { slug?: string; title?: string }[];
      if (docs.length === 0) return "";
      const items = docs
        .map(
          (doc) =>
            `<li><a href="/blog/${esc(doc.slug ?? "")}">${esc(doc.title ?? doc.slug ?? "")}</a></li>`
        )
        .join("");
      return `<ul class="ax-widget-list">${items}</ul>`;
    }

    case "categories": {
      const r = await p.find({ collection: "categories", sort: "name", limit: 100, depth: 0 });
      const docs = r.docs as unknown as { id: number; name?: string; slug?: string }[];
      if (docs.length === 0) return "";
      const withCounts = await Promise.all(
        docs.map(async (doc) => {
          const c = await p.count({
            collection: "blog",
            where: {
              and: [{ category: { equals: doc.id } }, { _status: { equals: "published" } }],
            },
          });
          return { ...doc, count: c.totalDocs };
        })
      );
      const items = withCounts
        .map(
          (doc) =>
            `<li><a href="/blog?category=${esc(doc.slug ?? "")}">${esc(doc.name ?? doc.slug ?? "")} (${doc.count})</a></li>`
        )
        .join("");
      return `<ul class="ax-widget-list">${items}</ul>`;
    }

    case "searchBox":
      return (
        `<form class="ax-widget-search" action="/search" method="get" role="search">` +
        `<input type="search" name="q" placeholder="Search…" aria-label="Search" required>` +
        `</form>`
      );

    case "form": {
      const rel = item.form;
      const formId = typeof rel === "object" && rel !== null ? rel.id : rel;
      if (formId === undefined || formId === null) return "";
      const form = (await p
        .findByID({ collection: "forms", id: formId, depth: 0 })
        .catch(() => null)) as FormDoc | null;
      if (!form) return "";
      const confirmationHtml = form.confirmationMessage
        ? convertLexicalToHTML({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: form.confirmationMessage as any,
          })
        : "";
      const fieldsHtml = (form.fields ?? []).map(formFieldHtml).join("");
      return (
        `<div class="ax-widget-form" data-form-id="${esc(String(form.id))}">` +
        `<form aria-label="${esc(form.title)}">${fieldsHtml}` +
        `<button type="submit">${esc(form.submitButtonLabel || "Submit")}</button>` +
        `</form>` +
        `<div class="ax-widget-form-success" hidden>${confirmationHtml || "<p>Thanks — your submission was received.</p>"}</div>` +
        `<p class="ax-widget-form-error" hidden>Could not submit — please try again.</p>` +
        `</div>` +
        FORM_SCRIPT
      );
    }

    case "html":
      return item.code ?? "";

    default:
      return "";
  }
}

/** Renders one widget area of the Widgets global to an HTML string ("" when
 * the global or area is missing/empty, or on any query failure). */
export async function renderAreaHtml(area: string): Promise<string> {
  try {
    const p = await getPayload({ config });
    const global = (await p.findGlobal({ slug: "widgets", depth: 2 })) as WidgetsGlobal;
    const match = (global.areas ?? []).find((a) => a.area === area);
    if (!match?.items?.length) return "";
    const parts = await Promise.all(match.items.map((item) => renderWidget(p, item)));
    return parts
      .filter(Boolean)
      .map((html) => `<div class="ax-widget">${html}</div>`)
      .join("");
  } catch {
    return "";
  }
}
