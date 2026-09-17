import "server-only";
import type { GoogleReview } from "./googlePlaces";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const stars = (rating: number): string => {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
};

function reviewCard(r: GoogleReview): string {
  const photo = r.authorPhotoUrl
    ? `<img src="${escapeHtml(r.authorPhotoUrl)}" alt="" style="width:40px;height:40px;border-radius:50%;flex-shrink:0">`
    : `<div style="width:40px;height:40px;border-radius:50%;background:#e0e6ed;flex-shrink:0"></div>`;
  return `<div style="padding:20px;background:#fff;border:1px solid #e5e5e5;border-radius:8px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      ${photo}
      <div>
        <div style="font-weight:600;font-size:14px">${escapeHtml(r.authorName)}</div>
        <div style="color:#f5a623;font-size:14px;letter-spacing:1px">${stars(r.rating)}</div>
      </div>
    </div>
    <p style="margin:0 0 8px;color:#444;font-size:14px;line-height:1.5">${escapeHtml(r.text)}</p>
    <div style="color:#999;font-size:12px">${escapeHtml(r.relativeTime)}</div>
  </div>`;
}

export function renderGrid(reviews: GoogleReview[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;padding:24px">${reviews
    .map(reviewCard)
    .join("")}</div>`;
}

export function renderMarquee(reviews: GoogleReview[]): string {
  const items = [...reviews, ...reviews]; // duplicated so the loop is seamless
  return `<div style="overflow:hidden;padding:20px 0">
    <div style="display:flex;gap:20px;width:max-content;animation:aska-reviews-scroll ${reviews.length * 8}s linear infinite">
      ${items.map((r) => `<div style="width:280px;flex-shrink:0">${reviewCard(r)}</div>`).join("")}
    </div>
    <style>@keyframes aska-reviews-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }</style>
  </div>`;
}

export function renderCarousel(reviews: GoogleReview[]): string {
  if (reviews.length === 0) return "";
  const secondsPerSlide = 6;
  const totalDuration = reviews.length * secondsPerSlide;
  const visiblePct = (100 / reviews.length).toFixed(3);
  const slides = reviews
    .map((r, i) => {
      const delay = -(i * secondsPerSlide);
      return `<div style="position:absolute;inset:0;opacity:0;animation:aska-review-cycle ${totalDuration}s steps(1) infinite;animation-delay:${delay}s">${reviewCard(
        r
      )}</div>`;
    })
    .join("");
  return `<div style="position:relative;max-width:400px;min-height:220px;margin:0 auto">
    ${slides}
    <style>@keyframes aska-review-cycle { 0% { opacity:1 } ${visiblePct}% { opacity:0 } 100% { opacity:0 } }</style>
  </div>`;
}

export function renderPlaceholder(message: string): string {
  return `<div style="padding:24px;text-align:center;color:#999;border:1px dashed #ccc;border-radius:8px">${escapeHtml(
    message
  )}</div>`;
}
