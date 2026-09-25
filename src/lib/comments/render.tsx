import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * Server-side renderer for the blog comments section. Returns an HTML string
 * (handed to templates as {{{commentsHtml}}}) — everything in it is escaped,
 * the only trusted markup is what this file writes itself. The submission
 * form posts JSON to /api/comments (public create, status defaults to
 * "pending") via the tiny inline script below; a plain form POST would be
 * form-encoded, which the Payload REST API rejects.
 */

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface CommentDoc {
  id: string | number;
  parent?: string | number | null;
  authorName: string;
  authorUrl?: string | null;
  content: string;
  createdAt: string;
}

function commentHtml(c: CommentDoc, isReply: boolean): string {
  const name = c.authorUrl
    ? `<a href="${esc(c.authorUrl)}" rel="nofollow ugc">${esc(c.authorName)}</a>`
    : esc(c.authorName);
  const indent = isReply ? ' style="margin-left:2rem"' : "";
  return (
    `<div class="aska-comment"${indent}>` +
    `<p class="aska-comment-meta"><strong>${name}</strong> · ` +
    `<time datetime="${esc(c.createdAt)}">${esc(new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</time></p>` +
    `<p>${esc(c.content)}</p>` +
    `</div>`
  );
}

export async function renderCommentsSection(postId: string | number): Promise<string> {
  const p = await getPayload({ config });
  const r = await p.find({
    collection: "comments",
    where: {
      and: [{ post: { equals: postId } }, { status: { equals: "approved" } }],
    },
    sort: "createdAt",
    limit: 200,
    depth: 0,
  });
  const docs = r.docs as unknown as CommentDoc[];
  const top = docs.filter((c) => !c.parent);
  const replies = docs.filter((c) => c.parent);
  const byParent = new Map<string | number, CommentDoc[]>();
  for (const rep of replies) {
    const list = byParent.get(rep.parent as string | number) ?? [];
    list.push(rep);
    byParent.set(rep.parent as string | number, list);
  }

  const listHtml = top
    .map((c) => {
      const kids = byParent.get(c.id) ?? [];
      return commentHtml(c, false) + kids.map((k) => commentHtml(k, true)).join("");
    })
    .join("");

  const commentsBlock = listHtml
    ? `<div class="aska-comments-list">${listHtml}</div>`
    : `<p class="aska-comments-empty">No comments yet.</p>`;

  const formHtml =
    `<form id="aska-comment-form" class="aska-comment-form">` +
    `<input type="hidden" name="post" value="${esc(String(postId))}">` +
    `<p><label>Name <input name="authorName" required class="aska-input"></label></p>` +
    `<p><label>Email <input name="authorEmail" type="email" required class="aska-input"></label></p>` +
    `<p><label>Website <input name="authorUrl" type="url" class="aska-input"></label></p>` +
    `<p><label>Comment <textarea name="content" required class="aska-input"></textarea></label></p>` +
    `<p class="aska-comment-error" hidden>Could not submit your comment — please try again.</p>` +
    `<p class="aska-comment-success" hidden>Thanks — your comment was submitted and is awaiting moderation.</p>` +
    `<button type="submit">Post comment</button>` +
    `</form>`;

  const script =
    `<script>(() => {` +
    `const f = document.getElementById('aska-comment-form');` +
    `if (!f) return;` +
    `f.addEventListener('submit', async (e) => {` +
    `e.preventDefault();` +
    `const d = Object.fromEntries(new FormData(f).entries());` +
    `d.post = Number(d.post);` +
    `try {` +
    `const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });` +
    `if (!res.ok) throw new Error('bad status');` +
    `f.reset();` +
    `f.querySelector('.aska-comment-success').hidden = false;` +
    `f.querySelector('.aska-comment-error').hidden = true;` +
    `} catch {` +
    `f.querySelector('.aska-comment-error').hidden = false;` +
    `}` +
    `});` +
    `})();</script>`;

  return (
    `<section class="aska-comments" style="max-width:42rem;margin:2rem auto;padding:0 1rem;font-family:sans-serif">` +
    `<h2>Comments</h2>` +
    commentsBlock +
    `<h3>Leave a comment</h3>` +
    formHtml +
    script +
    `</section>`
  );
}
