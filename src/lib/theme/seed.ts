/**
 * The aska sample theme: design tokens, the block pattern library, collection
 * templates, pages, menus, forms, widgets and starter content — defined as
 * plain data plus one idempotent `applyTheme(payload)` that finds-or-creates
 * every item by its natural key (slug / name / title / area), so it can run
 * on every deploy without ever duplicating content.
 *
 * Typography is deliberately untouched: Settings → Typography owns the master
 * font, and the site forces `--font-master` on every element. All theme CSS
 * below therefore sets no font-family at all — everything inherits.
 *
 * Token contract (src/lib/styles/tokens.ts): a Color / Spacing / Border
 * Radius & Shadow token with slug `x` is exposed as `var(--x)`. The slugs
 * chosen here (ink, paper, primary, …) are the variable names the CSS
 * references.
 */

import type { Payload } from "payload";
import type { Widgets } from "@/payload-types";

export interface ThemeSeedSummary {
  created: string[];
  existing: string[];
  skipped: string[];
}

/* ----------------------------------------------------------------------- */
/* Lexical helpers                                                          */
/* ----------------------------------------------------------------------- */

type LexicalChild = { type: string; version: number; [k: string]: unknown };

interface LexicalRootDoc {
  root: {
    children: LexicalChild[];
    direction: null;
    format: "";
    indent: number;
    type: "root";
    version: number;
  };
  [k: string]: unknown;
}

function textNode(text: string): LexicalChild {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function paragraph(text: string): LexicalChild {
  return {
    children: [textNode(text)],
    direction: null,
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

function heading(text: string, tag = "h2"): LexicalChild {
  return {
    children: [textNode(text)],
    direction: null,
    format: "",
    indent: 0,
    tag,
    type: "heading",
    version: 1,
  };
}

function lexicalDoc(...children: LexicalChild[]): LexicalRootDoc {
  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/* ----------------------------------------------------------------------- */
/* Design tokens (styles collection — slug becomes the CSS variable name)   */
/* ----------------------------------------------------------------------- */

const STYLE_TOKENS = [
  { name: "Ink", slug: "ink", category: "Color", colorValue: "#18181b" },
  { name: "Paper", slug: "paper", category: "Color", colorValue: "#fafaf9" },
  { name: "Primary", slug: "primary", category: "Color", colorValue: "#e11d48" },
  { name: "Muted", slug: "muted", category: "Color", colorValue: "#71717a" },
  { name: "Border", slug: "border", category: "Color", colorValue: "#e7e5e4" },
  { name: "Accent", slug: "accent", category: "Color", colorValue: "#f59e0b" },
  {
    name: "Radius MD",
    slug: "radius-md",
    category: "Border Radius & Shadow",
    radiusShadowValue: "0.5rem",
  },
  {
    name: "Radius LG",
    slug: "radius-lg",
    category: "Border Radius & Shadow",
    radiusShadowValue: "1rem",
  },
  {
    name: "Shadow Card",
    slug: "shadow",
    category: "Border Radius & Shadow",
    radiusShadowValue: "0 12px 32px -12px rgba(24, 24, 27, 0.18)",
  },
  {
    name: "Spacing Unit",
    slug: "spacing-unit",
    category: "Spacing / Container",
    spacingValue: "0.5rem",
  },
  {
    name: "Container Max",
    slug: "container-max",
    category: "Spacing / Container",
    spacingValue: "72rem",
  },
] as const;

/* ----------------------------------------------------------------------- */
/* Block pattern library (components collection)                            */
/* ----------------------------------------------------------------------- */

const AX_BUTTON_CSS = `
.ax-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.8rem 1.6rem;border-radius:var(--radius-md);font-size:.9375rem;font-weight:600;line-height:1;text-decoration:none;cursor:pointer;border:1px solid transparent;transition:transform .15s ease,box-shadow .15s ease,background-color .15s ease,border-color .15s ease}
.ax-btn:hover{transform:translateY(-1px)}
.ax-btn--primary{background:var(--primary);color:#fff;box-shadow:0 8px 20px -8px rgba(225,29,72,.55)}
.ax-btn--primary:hover{background:#be123c}
.ax-btn--ghost-dark{border-color:var(--border);color:var(--ink)}
.ax-btn--ghost-dark:hover{border-color:var(--ink)}
.ax-btn--outline-light{border-color:rgba(250,250,249,.3);color:var(--paper)}
.ax-btn--outline-light:hover{border-color:var(--paper)}
.ax-btn--light{background:#fff;color:var(--primary)}
.ax-btn--light:hover{background:#ffe4e9}`;

const AX_SECTION_HEAD_CSS = `
.ax-section-head{max-width:44rem;margin:0 0 calc(var(--spacing-unit)*10)}
.ax-section-head--center{margin-inline:auto;text-align:center}
.ax-section-head h2{margin:0;font-size:clamp(1.875rem,3.5vw,2.5rem);letter-spacing:-0.02em;line-height:1.15}
.ax-section-head p:not(.ax-eyebrow){margin:calc(var(--spacing-unit)*3) 0 0;color:var(--muted);line-height:1.7}`;

const AX_EYEBROW = (text: string) =>
  `<p class="ax-eyebrow">${text}</p>`;

const PATTERN_HERO_HTML = `<section class="ax-hero">
  <div class="ax-container ax-hero__inner">
    <p class="ax-eyebrow">Now in public beta</p>
    <h1 class="ax-hero__title">Content, design and code in one calm workspace</h1>
    <p class="ax-hero__sub">Aska brings structured content, a visual editor and production-grade rendering together, so your team ships pages, posts and products without ever leaving the browser.</p>
    <div class="ax-hero__actions">
      <a class="ax-btn ax-btn--primary" href="#">Start building free</a>
      <a class="ax-btn ax-btn--outline-light" href="#">Watch the 3-minute tour</a>
    </div>
    <p class="ax-hero__note">No credit card required &middot; Self-hostable</p>
  </div>
</section>`;

const PATTERN_HERO_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-hero{background:var(--ink);color:var(--paper);padding-block:calc(var(--spacing-unit)*20) calc(var(--spacing-unit)*16);position:relative;overflow:hidden}
.ax-hero::after{content:"";position:absolute;right:-15%;bottom:-55%;width:70%;height:140%;background:radial-gradient(closest-side,rgba(225,29,72,.32),transparent 72%);pointer-events:none}
.ax-hero__inner{position:relative;max-width:52rem}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#fb7185}
.ax-hero__title{margin:0;font-size:clamp(2.5rem,6vw,4.25rem);line-height:1.04;letter-spacing:-0.03em;font-weight:700;max-width:18ch}
.ax-hero__sub{margin:calc(var(--spacing-unit)*4) 0 0;font-size:1.125rem;line-height:1.7;color:rgba(250,250,249,.72);max-width:56ch}
.ax-hero__actions{display:flex;flex-wrap:wrap;gap:calc(var(--spacing-unit)*3);margin-top:calc(var(--spacing-unit)*6)}
.ax-hero__note{margin:calc(var(--spacing-unit)*4) 0 0;font-size:.8125rem;color:rgba(250,250,249,.55)}${AX_BUTTON_CSS}`;

const iconLines = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7"/></svg>`;
const iconLayout = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>`;
const iconBolt = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>`;

const PATTERN_FEATURES_HTML = `<section class="ax-features">
  <div class="ax-container">
    <header class="ax-section-head">
      ${AX_EYEBROW("Why Aska")}
      <h2>Everything a publishing team needs</h2>
      <p>Three pillars that remove the usual friction between writing, designing and shipping.</p>
    </header>
    <div class="ax-features__grid">
      <article class="ax-feature">
        <div class="ax-feature__icon">${iconLines}</div>
        <h3>Structured content</h3>
        <p>Collections, blocks and relationships instead of loose pages. Your content stays queryable, reusable and safe to redesign around.</p>
      </article>
      <article class="ax-feature">
        <div class="ax-feature__icon">${iconLayout}</div>
        <h3>Visual editing</h3>
        <p>A drag-and-drop canvas backed by real templates. Designers work visually; developers keep clean, versionable markup.</p>
      </article>
      <article class="ax-feature">
        <div class="ax-feature__icon">${iconBolt}</div>
        <h3>Fast by default</h3>
        <p>Server-rendered pages, optimized images and no plugin bloat. Everything ships fast on day one and stays that way.</p>
      </article>
    </div>
  </div>
</section>`;

const PATTERN_FEATURES_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-features{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}
.ax-features__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*6)}
.ax-feature{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:calc(var(--spacing-unit)*6);transition:box-shadow .2s ease,transform .2s ease}
.ax-feature:hover{box-shadow:var(--shadow);transform:translateY(-3px)}
.ax-feature__icon{width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);background:rgba(225,29,72,.08);color:var(--primary)}
.ax-feature h3{margin:calc(var(--spacing-unit)*4) 0 calc(var(--spacing-unit)*2);font-size:1.125rem;letter-spacing:-0.01em}
.ax-feature p{margin:0;color:var(--muted);line-height:1.7;font-size:.9375rem}
@media (max-width:800px){.ax-features__grid{grid-template-columns:1fr}}${AX_SECTION_HEAD_CSS}`;

const PATTERN_CTA_HTML = `<section class="ax-cta">
  <div class="ax-container ax-cta__inner">
    <h2>Ready to publish your next big thing?</h2>
    <p>Spin up a project in minutes and invite your whole team.</p>
    <a class="ax-btn ax-btn--light" href="#">Get started</a>
  </div>
</section>`;

const PATTERN_CTA_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-cta{background:var(--primary);color:#fff;padding-block:calc(var(--spacing-unit)*14);text-align:center}
.ax-cta__inner{max-width:40rem}
.ax-cta h2{margin:0;font-size:clamp(1.75rem,3.5vw,2.5rem);letter-spacing:-0.02em}
.ax-cta p{margin:calc(var(--spacing-unit)*3) 0 calc(var(--spacing-unit)*6);color:rgba(255,255,255,.82);line-height:1.6}${AX_BUTTON_CSS}`;

const PATTERN_TESTIMONIAL_HTML = `<section class="ax-quote">
  <div class="ax-container ax-quote__inner">
    <div class="ax-quote__stars" aria-label="Rated 5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <blockquote>
      <p>&ldquo;We replaced four tools with Aska in an afternoon. The editorial team now ships pages without filing a single ticket &mdash; it&rsquo;s the first CMS our designers and developers both actually like.&rdquo;</p>
    </blockquote>
    <figure class="ax-quote__person">
      <div class="ax-avatar" aria-hidden="true">MJ</div>
      <figcaption><strong>Mara Jensen</strong><span>Head of Digital, Northwind Press</span></figcaption>
    </figure>
  </div>
</section>`;

const PATTERN_TESTIMONIAL_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-quote{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-quote__inner{max-width:46rem;text-align:center}
.ax-quote__stars{color:var(--accent);letter-spacing:.25em;font-size:1rem}
.ax-quote blockquote{margin:calc(var(--spacing-unit)*4) 0}
.ax-quote blockquote p{margin:0;font-size:clamp(1.25rem,2.5vw,1.625rem);line-height:1.5;letter-spacing:-0.01em;color:var(--ink)}
.ax-quote__person{display:flex;align-items:center;justify-content:center;gap:calc(var(--spacing-unit)*3);margin:0}
.ax-avatar{width:3rem;height:3rem;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.8125rem;font-weight:700;letter-spacing:.04em}
.ax-quote__person figcaption{display:flex;flex-direction:column;text-align:left;gap:.125rem}
.ax-quote__person strong{font-size:.9375rem}
.ax-quote__person span{font-size:.8125rem;color:var(--muted)}`;

const planFeatures = (items: string[]) => items.map((i) => `<li>${i}</li>`).join("");

const PATTERN_PRICING_HTML = `<section class="ax-pricing">
  <div class="ax-container">
    <header class="ax-section-head ax-section-head--center">
      ${AX_EYEBROW("Pricing")}
      <h2>Simple pricing that scales with you</h2>
      <p>Start free, upgrade when your audience does. Every plan includes all editing features.</p>
    </header>
    <div class="ax-pricing__grid">
      <article class="ax-plan">
        <h3>Starter</h3>
        <p class="ax-plan__price"><span>$19</span>/mo</p>
        <p class="ax-plan__desc">For personal sites and portfolios.</p>
        <ul>${planFeatures(["1 project", "5k page views / month", "Community support"])}</ul>
        <a class="ax-btn ax-btn--ghost-dark ax-plan__cta" href="#">Choose Starter</a>
      </article>
      <article class="ax-plan ax-plan--featured">
        <p class="ax-plan__badge">Most popular</p>
        <h3>Studio</h3>
        <p class="ax-plan__price"><span>$49</span>/mo</p>
        <p class="ax-plan__desc">For growing teams and agencies.</p>
        <ul>${planFeatures(["10 projects", "100k page views / month", "Custom domains", "Priority support"])}</ul>
        <a class="ax-btn ax-btn--primary ax-plan__cta" href="#">Choose Studio</a>
      </article>
      <article class="ax-plan">
        <h3>Scale</h3>
        <p class="ax-plan__price"><span>$99</span>/mo</p>
        <p class="ax-plan__desc">For high-traffic publications.</p>
        <ul>${planFeatures(["Unlimited projects", "1M page views / month", "SSO &amp; roles", "Dedicated support"])}</ul>
        <a class="ax-btn ax-btn--ghost-dark ax-plan__cta" href="#">Choose Scale</a>
      </article>
    </div>
  </div>
</section>`;

const PATTERN_PRICING_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-pricing{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}
.ax-pricing__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*5);align-items:stretch}
.ax-plan{position:relative;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:calc(var(--spacing-unit)*7);display:flex;flex-direction:column}
.ax-plan--featured{border-color:var(--primary);box-shadow:var(--shadow)}
.ax-plan__badge{position:absolute;top:-0.8rem;left:50%;transform:translateX(-50%);margin:0;background:var(--primary);color:#fff;font-size:.6875rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.35rem .9rem;border-radius:999px;white-space:nowrap}
.ax-plan h3{margin:0;font-size:1rem}
.ax-plan__price{margin:calc(var(--spacing-unit)*3) 0 0;color:var(--muted);font-size:.9375rem}
.ax-plan__price span{font-size:2.25rem;font-weight:700;letter-spacing:-0.02em;color:var(--ink);margin-right:.25rem}
.ax-plan__desc{margin:calc(var(--spacing-unit)*2) 0 0;font-size:.875rem;color:var(--muted)}
.ax-plan ul{list-style:none;margin:calc(var(--spacing-unit)*5) 0 0;padding:0;display:flex;flex-direction:column;gap:calc(var(--spacing-unit)*2.5);font-size:.9375rem;flex:1}
.ax-plan li{position:relative;padding-left:1.4rem}
.ax-plan li::before{content:"\u2713";position:absolute;left:0;color:var(--primary);font-weight:700}
.ax-plan__cta{margin-top:calc(var(--spacing-unit)*5)}
@media (max-width:860px){.ax-pricing__grid{grid-template-columns:1fr;max-width:26rem;margin-inline:auto}}${AX_SECTION_HEAD_CSS}${AX_BUTTON_CSS}`;

const galleryItem = (variant: number, caption: string) =>
  `<figure class="ax-gallery__item"><div class="ax-gallery__ph ax-gallery__ph--${variant}"></div><figcaption>${caption}</figcaption></figure>`;

const PATTERN_GALLERY_HTML = `<section class="ax-gallery">
  <div class="ax-container">
    <header class="ax-section-head">
      ${AX_EYEBROW("Showcase")}
      <h2>Made with Aska</h2>
      <p>A few recent launches from teams publishing on the platform.</p>
    </header>
    <div class="ax-gallery__grid">
      ${galleryItem(1, "Editorial layout")}
      ${galleryItem(2, "Commerce storefront")}
      ${galleryItem(3, "Agency portfolio")}
      ${galleryItem(4, "Magazine archive")}
      ${galleryItem(5, "Product docs")}
      ${galleryItem(6, "Community hub")}
    </div>
  </div>
</section>`;

const PATTERN_GALLERY_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-gallery{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}
.ax-gallery__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*4)}
.ax-gallery__item{margin:0}
.ax-gallery__ph{aspect-ratio:4/3;border-radius:var(--radius-md);transition:transform .2s ease}
.ax-gallery__item:hover .ax-gallery__ph{transform:scale(1.02)}
.ax-gallery__ph--1{background:linear-gradient(135deg,var(--ink),#3f3f46)}
.ax-gallery__ph--2{background:linear-gradient(135deg,var(--primary),var(--accent))}
.ax-gallery__ph--3{background:linear-gradient(135deg,var(--border),var(--muted))}
.ax-gallery__ph--4{background:linear-gradient(135deg,var(--accent),var(--primary))}
.ax-gallery__ph--5{background:linear-gradient(135deg,#3f3f46,var(--primary))}
.ax-gallery__ph--6{background:linear-gradient(135deg,var(--muted),var(--ink))}
.ax-gallery__item figcaption{margin-top:calc(var(--spacing-unit)*2);font-size:.8125rem;color:var(--muted)}
@media (max-width:700px){.ax-gallery__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:460px){.ax-gallery__grid{grid-template-columns:1fr}}${AX_SECTION_HEAD_CSS}`;

const MARQUEE_NAMES = ["Northwind", "Acme Corp", "Lumen &amp; Co", "Vertex", "Halcyon", "Papertrail"];
const marqueeSet = MARQUEE_NAMES.map((n) => `<span>${n}</span>`).join("");

const PATTERN_MARQUEE_HTML = `<div class="ax-marquee" aria-label="Trusted by">
  <div class="ax-marquee__track">
    ${marqueeSet}
    ${marqueeSet}
  </div>
</div>`;

const PATTERN_MARQUEE_CSS = `
.ax-marquee{overflow:hidden;padding-block:calc(var(--spacing-unit)*8);border-block:1px solid var(--border);background:var(--paper);-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.ax-marquee__track{display:flex;gap:calc(var(--spacing-unit)*12);width:max-content;animation:ax-marquee 28s linear infinite}
.ax-marquee__track span{font-size:1.25rem;font-weight:700;letter-spacing:-0.01em;color:var(--muted);white-space:nowrap}
@keyframes ax-marquee{to{transform:translateX(-50%)}}`;

const stat = (num: string, label: string) =>
  `<div class="ax-stat"><p class="ax-stat__num">${num}</p><p class="ax-stat__label">${label}</p></div>`;

const PATTERN_STATS_HTML = `<section class="ax-stats">
  <div class="ax-container ax-stats__grid">
    ${stat("12k+", "Pages published")}
    ${stat("99.99%", "Uptime, trailing year")}
    ${stat("4.9/5", "Average customer rating")}
    ${stat("38ms", "Median response time")}
  </div>
</section>`;

const PATTERN_STATS_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-stats{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*12)}
.ax-stats__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--spacing-unit)*6);text-align:center}
.ax-stat__num{margin:0;font-size:clamp(1.875rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.03em;color:var(--ink)}
.ax-stat__label{margin:.5rem 0 0;font-size:.875rem;color:var(--muted)}
@media (max-width:700px){.ax-stats__grid{grid-template-columns:repeat(2,1fr);gap:calc(var(--spacing-unit)*8) calc(var(--spacing-unit)*4)}}`;

const faqItem = (q: string, a: string) =>
  `<details class="ax-faq__item"><summary>${q}</summary><p>${a}</p></details>`;

const PATTERN_FAQ_HTML = `<section class="ax-faq">
  <div class="ax-container ax-faq__inner">
    <header class="ax-section-head">
      ${AX_EYEBROW("FAQ")}
      <h2>Frequently asked questions</h2>
    </header>
    <div class="ax-faq__list">
      ${faqItem("Do I need to know how to code?", "No. Editors get a visual canvas with pre-built blocks, while developers can drop into the markup, styles and templates whenever they want. Both work on the same content.")}
      ${faqItem("Can I self-host Aska?", "Yes. Aska runs on your own infrastructure with a standard PostgreSQL database. Your content, your servers, no vendor lock-in.")}
      ${faqItem("How does the free trial work?", "Every plan starts with a 14-day full-feature trial. No credit card up front, and your content carries over if you subscribe.")}
      ${faqItem("Can I migrate from my current CMS?", "A guided importer maps your existing content into collections, and the templates system lets you rebuild pages incrementally rather than in one risky cutover.")}
    </div>
  </div>
</section>`;

const PATTERN_FAQ_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-faq{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}
.ax-faq__inner{max-width:46rem}
.ax-faq__list{margin-top:calc(var(--spacing-unit)*8);border-top:1px solid var(--border)}
.ax-faq__item{border-bottom:1px solid var(--border);padding-block:calc(var(--spacing-unit)*4)}
.ax-faq__item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:1rem;font-weight:600;font-size:1.0625rem;color:var(--ink)}
.ax-faq__item summary::-webkit-details-marker{display:none}
.ax-faq__item summary::after{content:"+";font-size:1.5rem;font-weight:400;color:var(--primary);line-height:1;transition:transform .2s ease}
.ax-faq__item[open] summary::after{transform:rotate(45deg)}
.ax-faq__item p{margin:calc(var(--spacing-unit)*3) 0 0;color:var(--muted);line-height:1.7;max-width:60ch}${AX_SECTION_HEAD_CSS}`;

const PATTERN_NEWSLETTER_HTML = `<section class="ax-news">
  <div class="ax-container ax-news__inner">
    <h2>Get the good stuff in your inbox</h2>
    <p>One thoughtful email a week on content, design and the web. No noise, unsubscribe anytime.</p>
    <form class="ax-news__form" action="#" method="post">
      <label class="ax-visually-hidden" for="ax-news-email">Email address</label>
      <input id="ax-news-email" type="email" name="email" placeholder="you@example.com" required>
      <button class="ax-btn ax-btn--primary" type="submit">Subscribe</button>
    </form>
  </div>
</section>`;

const PATTERN_NEWSLETTER_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-news{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*16)}
.ax-news__inner{max-width:36rem;margin-inline:auto;text-align:center;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow);padding:calc(var(--spacing-unit)*10) calc(var(--spacing-unit)*8)}
.ax-news h2{margin:0;font-size:clamp(1.5rem,3vw,1.875rem);letter-spacing:-0.02em}
.ax-news__inner>p{margin:calc(var(--spacing-unit)*3) auto 0;color:var(--muted);line-height:1.7;max-width:42ch}
.ax-news__form{display:flex;gap:calc(var(--spacing-unit)*2);margin-top:calc(var(--spacing-unit)*6)}
.ax-news__form input{flex:1;min-width:0;padding:.8rem 1rem;border:1px solid var(--border);border-radius:var(--radius-md);font-size:.9375rem;background:var(--paper);color:var(--ink)}
.ax-news__form input:focus{outline:2px solid var(--primary);outline-offset:1px;border-color:var(--primary)}
.ax-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.ax-news__form{flex-direction:column}}${AX_BUTTON_CSS}`;

interface ThemeComponent {
  name: string;
  category:
    | "header"
    | "footer"
    | "hero"
    | "feature"
    | "card"
    | "cta"
    | "pricing"
    | "form"
    | "slider"
    | "custom";
  customCategory?: string;
  html: string;
  css: string;
}

const THEME_COMPONENTS: ThemeComponent[] = [
  { name: "Hero", category: "hero", html: PATTERN_HERO_HTML, css: PATTERN_HERO_CSS },
  { name: "Features 3-col", category: "feature", html: PATTERN_FEATURES_HTML, css: PATTERN_FEATURES_CSS },
  { name: "CTA Band", category: "cta", html: PATTERN_CTA_HTML, css: PATTERN_CTA_CSS },
  { name: "Testimonial Single", category: "card", html: PATTERN_TESTIMONIAL_HTML, css: PATTERN_TESTIMONIAL_CSS },
  { name: "Pricing 3-tier", category: "pricing", html: PATTERN_PRICING_HTML, css: PATTERN_PRICING_CSS },
  { name: "Gallery Grid", category: "card", html: PATTERN_GALLERY_HTML, css: PATTERN_GALLERY_CSS },
  { name: "Logo Marquee", category: "custom", customCategory: "Logo Strip", html: PATTERN_MARQUEE_HTML, css: PATTERN_MARQUEE_CSS },
  { name: "Stats Bar", category: "feature", html: PATTERN_STATS_HTML, css: PATTERN_STATS_CSS },
  { name: "FAQ Accordion", category: "custom", customCategory: "FAQ", html: PATTERN_FAQ_HTML, css: PATTERN_FAQ_CSS },
  { name: "Newsletter Form Box", category: "form", html: PATTERN_NEWSLETTER_HTML, css: PATTERN_NEWSLETTER_CSS },
];

/* ----------------------------------------------------------------------- */
/* Collection templates                                                     */
/*                                                                         */
/* Placeholder contract (src/lib/templates/render.ts): {{path}} escaped,   */
/* {{{path}}} raw, dotted paths walk nested objects, {{#each path}} loops  */
/* over array items. Detail pages receive the flattened doc (lexical       */
/* fields as HTML strings) plus `settings`; the blog detail context        */
/* carries {{{commentsHtml}}} and {{{sidebarHtml}}}, plus a normalized     */
/* `categories` array. Index pages receive the flattened items (`posts` /  */
/* `products`), each with a prebuilt `url`, plus `page`, `totalPages`,     */
/* `categoryName` (blog), `settings`, {{{sidebarHtml}}} (blog) and          */
/* `{{{paginationHtml}}}`. House-designs uses `{{#each designs}}`.         */
/* ----------------------------------------------------------------------- */

const AX_TEMPLATE_BASE = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-eyebrow{margin:0 0 calc(var(--spacing-unit)*3);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}`;

/* Sidebar + widget styles, shared by the blog index/detail templates. The
   layout containers themselves (.ax-post-layout / .ax-blog-layout) are
   defined per template. {{{sidebarHtml}}} renders as a flat sequence of
   .ax-widget divs (src/lib/widgets/renderHtml.ts). */
const AX_WIDGET_AREA_CSS = `
.ax-sidebar{position:sticky;top:2rem}
.ax-widget{margin-bottom:calc(var(--spacing-unit)*6)}
.ax-widget-title{font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin:0 0 calc(var(--spacing-unit)*3)}
.ax-widget-list{list-style:none;margin:0;padding:0;display:grid;gap:calc(var(--spacing-unit)*2)}
.ax-widget-list a{color:var(--ink);text-decoration:none}
.ax-widget-list a:hover{color:var(--primary)}
.ax-widget-search input{width:100%;padding:.7rem 1rem;border:1px solid var(--border);border-radius:var(--radius-md);font:inherit;background:#fff;color:var(--ink)}
.ax-widget-form label{display:block;margin-bottom:calc(var(--spacing-unit)*2);font-size:.875rem;color:var(--ink)}
.ax-widget-form input[type="text"],.ax-widget-form input[type="email"],.ax-widget-form select,.ax-widget-form textarea{width:100%;box-sizing:border-box;padding:.7rem 1rem;border:1px solid var(--border);border-radius:var(--radius-md);font:inherit;background:#fff;color:var(--ink);margin-top:.35rem}
.ax-widget-form button{padding:.7rem 1.4rem;border:1px solid transparent;border-radius:var(--radius-md);background:var(--primary);color:#fff;font:inherit;font-weight:600;cursor:pointer}
@media (max-width:900px){.ax-post-layout,.ax-blog-layout{grid-template-columns:1fr}.ax-sidebar{position:static}}`;

const BLOG_DETAIL_TEMPLATE_HTML = `<article class="ax-post">
  <header class="ax-post-hero">
    <div class="ax-container ax-post-hero__inner">
      <div class="ax-post-cats">{{#each categories}}<span class="ax-post-cat">{{name}}</span>{{/each}}</div>
      <h1>{{title}}</h1>
      <p class="ax-post-meta">{{publishedAt}} &middot; {{author.email}}</p>
    </div>
  </header>
  <div class="ax-container ax-post-layout">
    <div class="ax-post-main">
      <div class="ax-post-body">
        {{{content}}}
        <p class="ax-post-tags">{{tags}}</p>
      </div>
      <section class="ax-comments">
        <div class="ax-comments__inner">
          {{{commentsHtml}}}
        </div>
      </section>
    </div>
    <aside class="ax-sidebar">{{{sidebarHtml}}}</aside>
  </div>
</article>`;

const BLOG_DETAIL_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-post-hero{background:var(--ink);color:var(--paper);padding-block:calc(var(--spacing-unit)*16)}
.ax-post-hero__inner{max-width:48rem}
.ax-post-cats{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 calc(var(--spacing-unit)*3)}
.ax-post-cat{display:inline-block;padding:.35rem .9rem;border:1px solid rgba(250,250,249,.25);border-radius:999px;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#fb7185}
.ax-post-hero h1{margin:0;font-size:clamp(2rem,5vw,3.25rem);letter-spacing:-0.02em;line-height:1.1}
.ax-post-meta{margin:calc(var(--spacing-unit)*4) 0 0;color:rgba(250,250,249,.65);font-size:.875rem}
.ax-post-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:calc(var(--spacing-unit)*8);align-items:start;padding-block:calc(var(--spacing-unit)*12)}
.ax-post-main{max-width:46rem;min-width:0}
.ax-post-body p{line-height:1.8;color:rgba(24,24,27,.88);margin:0 0 1.4em}
.ax-post-body h2{margin:2em 0 .8em;letter-spacing:-0.01em;line-height:1.25}
.ax-post-body h3{margin:2em 0 .8em;letter-spacing:-0.01em}
.ax-post-body a{color:var(--primary)}
.ax-post-body img{max-width:100%;height:auto;border-radius:var(--radius-md)}
.ax-post-body blockquote{border-left:3px solid var(--primary);margin:1.6em 0;padding:.2em 0 .2em 1.2em;color:var(--muted)}
.ax-post-tags{margin:calc(var(--spacing-unit)*8) 0 0;padding-top:calc(var(--spacing-unit)*4);border-top:1px solid var(--border);font-size:.875rem;color:var(--muted)}
.ax-comments{border-top:1px solid var(--border);padding-block:calc(var(--spacing-unit)*12)}${AX_WIDGET_AREA_CSS}`;

const BLOG_INDEX_TEMPLATE_HTML = `<main class="ax-blog">
  <header class="ax-blog-hero">
    <div class="ax-container">
      <p class="ax-blog-hero__cat">{{categoryName}}</p>
      <h1>Blog</h1>
    </div>
  </header>
  <div class="ax-container ax-blog-layout">
    <div class="ax-blog-main">
      <div class="ax-post-grid">
        {{#each posts}}
        <article class="ax-post-card">
          <a class="ax-post-card__media" href="{{url}}"><img src="{{coverImage.url}}" alt=""></a>
          <div class="ax-post-card__body">
            <p class="ax-post-card__meta">{{category.name}} &middot; {{publishedAt}}</p>
            <h2><a href="{{url}}">{{title}}</a></h2>
            <p>{{excerpt}}</p>
          </div>
        </article>
        {{/each}}
      </div>
      <nav class="ax-pagination" aria-label="Pagination">{{{paginationHtml}}}</nav>
    </div>
    <aside class="ax-sidebar">{{{sidebarHtml}}}</aside>
  </div>
</main>`;

const BLOG_INDEX_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-blog-hero{border-bottom:1px solid var(--border);background:var(--paper);padding-block:calc(var(--spacing-unit)*10)}
.ax-blog-hero h1{margin:0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-0.02em;color:var(--ink)}
.ax-blog-hero__cat{margin:0 0 .5rem;font-size:.875rem;font-weight:600;color:var(--primary)}
.ax-blog-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:calc(var(--spacing-unit)*8);align-items:start;padding-block:calc(var(--spacing-unit)*10)}
.ax-blog-main{min-width:0}
.ax-post-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*6)}
.ax-post-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .2s ease,transform .2s ease}
.ax-post-card:hover{box-shadow:var(--shadow);transform:translateY(-3px)}
.ax-post-card__media{display:block;aspect-ratio:16/9;background:linear-gradient(135deg,var(--ink),#3f3f46)}
.ax-post-card__media img{width:100%;height:100%;object-fit:cover;display:block}
.ax-post-card__body{padding:calc(var(--spacing-unit)*4)}
.ax-post-card__meta{margin:0;font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.ax-post-card__body h2{margin:.6rem 0;font-size:1.125rem;letter-spacing:-0.01em}
.ax-post-card__body h2 a{color:var(--ink);text-decoration:none}
.ax-post-card__body h2 a:hover{color:var(--primary)}
.ax-post-card__body>p{margin:0;font-size:.875rem;line-height:1.6;color:var(--muted)}
.ax-pagination{display:flex;align-items:center;justify-content:center;gap:calc(var(--spacing-unit)*3);margin-top:calc(var(--spacing-unit)*10);font-size:.875rem;color:var(--muted)}
.ax-pagination a,.ax-pagination span{padding:.6rem 1.2rem;border:1px solid var(--border);border-radius:var(--radius-md);background:#fff;color:var(--ink);text-decoration:none}
.ax-pagination a:hover{border-color:var(--ink)}
@media (max-width:900px){.ax-post-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:600px){.ax-post-grid{grid-template-columns:1fr}}${AX_WIDGET_AREA_CSS}`;

const PRODUCTS_INDEX_TEMPLATE_HTML = `<main class="ax-shop">
  <header class="ax-shop-hero">
    <div class="ax-container">
      <p class="ax-eyebrow">Store</p>
      <h1>Products</h1>
    </div>
  </header>
  <div class="ax-container ax-shop__body">
    <div class="ax-shop-grid">
      {{#each products}}
      <article class="ax-shop-card">
        <a class="ax-shop-card__media" href="{{url}}"><img src="{{images.0.url}}" alt="{{name}}"></a>
        <div class="ax-shop-card__body">
          <h2><a href="{{url}}">{{name}}</a></h2>
          <p class="ax-shop-card__price">\${{priceInUSD}}</p>
        </div>
      </article>
      {{/each}}
    </div>
    <nav class="ax-pagination" aria-label="Pagination">{{{paginationHtml}}}</nav>
  </div>
</main>`;

const PRODUCTS_INDEX_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-shop-hero{border-bottom:1px solid var(--border);background:var(--paper);padding-block:calc(var(--spacing-unit)*10)}
.ax-shop-hero h1{margin:0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-0.02em;color:var(--ink)}
.ax-shop__body{padding-block:calc(var(--spacing-unit)*10)}
.ax-shop-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*6)}
.ax-shop-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;transition:box-shadow .2s ease,transform .2s ease}
.ax-shop-card:hover{box-shadow:var(--shadow);transform:translateY(-3px)}
.ax-shop-card__media{display:block;aspect-ratio:1;background:linear-gradient(135deg,var(--border),var(--muted))}
.ax-shop-card__media img{width:100%;height:100%;object-fit:cover;display:block}
.ax-shop-card__body{padding:calc(var(--spacing-unit)*4)}
.ax-shop-card__body h2{margin:0;font-size:1.0625rem;letter-spacing:-0.01em}
.ax-shop-card__body h2 a{color:var(--ink);text-decoration:none}
.ax-shop-card__body h2 a:hover{color:var(--primary)}
.ax-shop-card__price{margin:.6rem 0 0;font-weight:700;color:var(--primary)}
.ax-pagination{display:flex;align-items:center;justify-content:center;gap:calc(var(--spacing-unit)*3);margin-top:calc(var(--spacing-unit)*10);font-size:.875rem}
.ax-pagination a,.ax-pagination span{padding:.6rem 1.2rem;border:1px solid var(--border);border-radius:var(--radius-md);background:#fff;color:var(--ink);text-decoration:none}
.ax-pagination a:hover{border-color:var(--ink)}
@media (max-width:900px){.ax-shop-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:600px){.ax-shop-grid{grid-template-columns:1fr}}`;

const PRODUCTS_DETAIL_TEMPLATE_HTML = `<main class="ax-product">
  <div class="ax-container ax-product__layout">
    <div class="ax-product__gallery">
      <img src="{{images.0.url}}" alt="{{name}}">
    </div>
    <div class="ax-product__info">
      <h1>{{name}}</h1>
      <p class="ax-product__price">\${{priceInUSD}}</p>
      <div class="ax-product__description">
        {{{description}}}
      </div>
      <a class="ax-product__buy" href="#">Add to cart</a>
    </div>
  </div>
</main>`;

const PRODUCTS_DETAIL_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-product{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*14)}
.ax-product__layout{display:grid;grid-template-columns:1.1fr 1fr;gap:calc(var(--spacing-unit)*10);align-items:start}
.ax-product__gallery{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--border),var(--muted))}
.ax-product__gallery img{width:100%;height:100%;object-fit:cover;display:block}
.ax-product__info h1{margin:0;font-size:clamp(1.75rem,4vw,2.5rem);letter-spacing:-0.02em;line-height:1.15}
.ax-product__price{margin:calc(var(--spacing-unit)*3) 0 0;font-size:1.5rem;font-weight:700;color:var(--primary)}
.ax-product__description{margin-top:calc(var(--spacing-unit)*5);color:rgba(24,24,27,.88);line-height:1.8}
.ax-product__description p{margin:0 0 1.2em}
.ax-product__buy{display:inline-block;margin-top:calc(var(--spacing-unit)*4);padding:.9rem 2rem;background:var(--primary);color:#fff;font-weight:600;text-decoration:none;border-radius:var(--radius-md)}
.ax-product__buy:hover{background:#be123c}
@media (max-width:800px){.ax-product__layout{grid-template-columns:1fr}}`;

const DESIGNS_INDEX_TEMPLATE_HTML = `<main class="ax-designs">
  <header class="ax-designs-hero">
    <div class="ax-container">
      <p class="ax-eyebrow">Catalogue</p>
      <h1>House designs</h1>
    </div>
  </header>
  <div class="ax-container ax-designs__body">
    <div class="ax-designs-grid">
      {{#each designs}}
      <article class="ax-design-card">
        <a class="ax-design-card__media" href="/house-designs/{{slug}}"><img src="{{images.0.url}}" alt="{{name}}"></a>
        <div class="ax-design-card__body">
          <h2><a href="/house-designs/{{slug}}">{{name}}</a></h2>
          <p class="ax-design-card__specs">{{bedrooms}} bed &middot; {{bathrooms}} bath &middot; {{garage}} garage &middot; {{houseSize}}</p>
        </div>
      </article>
      {{/each}}
    </div>
  </div>
</main>`;

const DESIGNS_INDEX_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-designs-hero{border-bottom:1px solid var(--border);background:var(--paper);padding-block:calc(var(--spacing-unit)*10)}
.ax-designs-hero h1{margin:0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-0.02em;color:var(--ink)}
.ax-designs__body{padding-block:calc(var(--spacing-unit)*10)}
.ax-designs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*6)}
.ax-design-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;transition:box-shadow .2s ease,transform .2s ease}
.ax-design-card:hover{box-shadow:var(--shadow);transform:translateY(-3px)}
.ax-design-card__media{display:block;aspect-ratio:4/3;background:linear-gradient(135deg,var(--ink),#3f3f46)}
.ax-design-card__media img{width:100%;height:100%;object-fit:cover;display:block}
.ax-design-card__body{padding:calc(var(--spacing-unit)*4)}
.ax-design-card__body h2{margin:0;font-size:1.125rem;letter-spacing:-0.01em}
.ax-design-card__body h2 a{color:var(--ink);text-decoration:none}
.ax-design-card__body h2 a:hover{color:var(--primary)}
.ax-design-card__specs{margin:.6rem 0 0;font-size:.875rem;color:var(--muted)}
@media (max-width:900px){.ax-designs-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:600px){.ax-designs-grid{grid-template-columns:1fr}}`;

const DESIGNS_DETAIL_TEMPLATE_HTML = `<main class="ax-design">
  <div class="ax-container ax-design__layout">
    <div class="ax-design__media">
      <img src="{{images.0.url}}" alt="{{name}}">
    </div>
    <div class="ax-design__panel">
      <h1>{{name}}</h1>
      <ul class="ax-specs">
        <li><span>Bedrooms</span><strong>{{bedrooms}}</strong></li>
        <li><span>Bathrooms</span><strong>{{bathrooms}}</strong></li>
        <li><span>Garage</span><strong>{{garage}}</strong></li>
        <li><span>Size</span><strong>{{houseSize}}</strong></li>
      </ul>
      <div class="ax-design__description">
        {{{description}}}
      </div>
    </div>
  </div>
</main>`;

const DESIGNS_DETAIL_TEMPLATE_CSS = `${AX_TEMPLATE_BASE}
.ax-design{background:var(--paper);color:var(--ink);padding-block:calc(var(--spacing-unit)*14)}
.ax-design__layout{display:grid;grid-template-columns:1.2fr 1fr;gap:calc(var(--spacing-unit)*10);align-items:start}
.ax-design__media{border-radius:var(--radius-lg);overflow:hidden;background:linear-gradient(135deg,var(--ink),#3f3f46);aspect-ratio:4/3}
.ax-design__media img{width:100%;height:100%;object-fit:cover;display:block}
.ax-design__panel h1{margin:0;font-size:clamp(1.75rem,4vw,2.5rem);letter-spacing:-0.02em;line-height:1.15}
.ax-specs{list-style:none;margin:calc(var(--spacing-unit)*5) 0 0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--spacing-unit)*3)}
.ax-specs li{background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);padding:calc(var(--spacing-unit)*3);display:flex;flex-direction:column;gap:.25rem}
.ax-specs span{font-size:.6875rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ax-specs strong{font-size:1.125rem;color:var(--ink)}
.ax-design__description{margin-top:calc(var(--spacing-unit)*5);color:rgba(24,24,27,.88);line-height:1.8}
.ax-design__description p{margin:0 0 1.2em}
@media (max-width:800px){.ax-design__layout{grid-template-columns:1fr}}`;

interface ThemeTemplate {
  name: string;
  collection: "blog" | "products" | "house-designs";
  kind: "detail" | "index";
  html: string;
  css: string;
}

// Detail first per collection: on a pre-`kind` schema (Templates.collection
// still unique) the detail template is the one the [slug] routes render, so
// it is the variant worth keeping if the index insert has to be skipped.
const THEME_TEMPLATES: ThemeTemplate[] = [
  { name: "Blog Detail", collection: "blog", kind: "detail", html: BLOG_DETAIL_TEMPLATE_HTML, css: BLOG_DETAIL_TEMPLATE_CSS },
  { name: "Blog Index", collection: "blog", kind: "index", html: BLOG_INDEX_TEMPLATE_HTML, css: BLOG_INDEX_TEMPLATE_CSS },
  { name: "Products Detail", collection: "products", kind: "detail", html: PRODUCTS_DETAIL_TEMPLATE_HTML, css: PRODUCTS_DETAIL_TEMPLATE_CSS },
  { name: "Products Index", collection: "products", kind: "index", html: PRODUCTS_INDEX_TEMPLATE_HTML, css: PRODUCTS_INDEX_TEMPLATE_CSS },
  { name: "House Designs Detail", collection: "house-designs", kind: "detail", html: DESIGNS_DETAIL_TEMPLATE_HTML, css: DESIGNS_DETAIL_TEMPLATE_CSS },
  { name: "House Designs Index", collection: "house-designs", kind: "index", html: DESIGNS_INDEX_TEMPLATE_HTML, css: DESIGNS_INDEX_TEMPLATE_CSS },
];

/* ----------------------------------------------------------------------- */
/* Pages — final, GrapesJS-editable HTML. No server-side placeholders:       */
/* navigation and content are hardcoded, per page, exactly as served.       */
/* ----------------------------------------------------------------------- */

/* Site navigation is rendered by the ThemeBuilder Header (menus) around every
   page — pages must not hardcode their own nav. Only the shared .ax-container
   utility remains here (referenced by every page's CSS). */
const PAGE_NAV_HTML = "";

const PAGE_NAV_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}`;

const PAGE_HERO_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-page-hero{background:var(--ink);color:var(--paper);padding-block:calc(var(--spacing-unit)*14)}
.ax-page-hero .ax-eyebrow{color:#fb7185}
.ax-page-hero h1{margin:0;font-size:clamp(2.25rem,5vw,3.5rem);letter-spacing:-0.03em;line-height:1.08;max-width:22ch}
.ax-page-hero__sub{margin:calc(var(--spacing-unit)*4) 0 0;color:rgba(250,250,249,.72);line-height:1.7;max-width:56ch}`;

const pageHero = (eyebrow: string, title: string, sub: string) =>
  `<section class="ax-page-hero">
  <div class="ax-container">
    <p class="ax-eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p class="ax-page-hero__sub">${sub}</p>
  </div>
</section>`;

const HOME_HERO_HTML = `<section class="ax-hero">
  <div class="ax-container ax-hero__inner">
    <p class="ax-eyebrow">The editorial CMS</p>
    <h1 class="ax-hero__title">Content, design and code in one calm workspace</h1>
    <p class="ax-hero__sub">Aska brings structured content, a visual editor and production-grade rendering together, so your team ships pages, posts and products without ever leaving the browser.</p>
    <div class="ax-hero__actions">
      <a class="ax-btn ax-btn--primary" href="/blog">Explore the blog</a>
      <a class="ax-btn ax-btn--outline-light" href="/about">Read our story</a>
    </div>
    <p class="ax-hero__note">Now in public beta &middot; Self-hostable</p>
  </div>
</section>`;

const HOME_PAGE_HTML = `<main class="ax-page">
  ${PAGE_NAV_HTML}
  ${HOME_HERO_HTML}
  ${PATTERN_FEATURES_HTML}
  ${PATTERN_STATS_HTML}
  ${PATTERN_TESTIMONIAL_HTML}
  ${PATTERN_MARQUEE_HTML}
  ${PATTERN_PRICING_HTML}
  ${PATTERN_CTA_HTML}
  ${PATTERN_NEWSLETTER_HTML}
</main>`;

const HOME_PAGE_CSS = [
  PAGE_NAV_CSS,
  PATTERN_HERO_CSS,
  PATTERN_FEATURES_CSS,
  PATTERN_STATS_CSS,
  PATTERN_TESTIMONIAL_CSS,
  PATTERN_MARQUEE_CSS,
  PATTERN_PRICING_CSS,
  PATTERN_CTA_CSS,
  PATTERN_NEWSLETTER_CSS,
].join("\n");

const ABOUT_PROSE_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-prose{max-width:44rem;padding-block:calc(var(--spacing-unit)*12)}
.ax-prose h2{margin:2em 0 .8em;font-size:1.5rem;letter-spacing:-0.01em;color:var(--ink)}
.ax-prose h2:first-child{margin-top:0}
.ax-prose p{line-height:1.8;color:rgba(24,24,27,.88);margin:0 0 1.4em}`;

const ABOUT_PAGE_HTML = `<main class="ax-page">
  ${PAGE_NAV_HTML}
  ${pageHero("About us", "We build the calm way to publish.", "Aska started as an internal tool — a CMS our own editorial team wouldn't complain about. It worked, so we made it a product.")}
  <section class="ax-prose">
    <div class="ax-container">
      <h2>Tired of fighting our tools</h2>
      <p>Every publishing team we knew had the same story: content locked in a database nobody understood, designs frozen in templates nobody could edit, and a plugin for every problem except the big one. We wanted one tool where a writer, a designer and a developer could open the same project and each find their own way to work.</p>
      <h2>One workspace, three disciplines</h2>
      <p>Aska keeps structured content, visual editing and plain markup in a single loop. Editors assemble pages from a shared pattern library; designers tune the design tokens that drive every block; developers ship templates and collections without maintaining a parallel front end. Nothing is thrown over a wall, because there is no wall.</p>
      <h2>Small team, high standards</h2>
      <p>We are a small team with a simple rule: if a feature makes the CMS harder to reason about, it doesn't ship. That discipline is why pages render fast, migrations are boring, and our customers' teams actually enjoy publishing.</p>
    </div>
  </section>
  ${PATTERN_STATS_HTML}
</main>`;

const ABOUT_PAGE_CSS = [PAGE_NAV_CSS, PAGE_HERO_CSS, ABOUT_PROSE_CSS, PATTERN_STATS_CSS].join("\n");

const CONTACT_CARDS_CSS = `
.ax-container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:calc(var(--spacing-unit)*4)}
.ax-contact{padding-block:calc(var(--spacing-unit)*12)}
.ax-contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--spacing-unit)*4);max-width:60rem}
.ax-contact-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:calc(var(--spacing-unit)*6)}
.ax-contact-card h3{margin:0 0 .5rem;font-size:1rem;color:var(--ink)}
.ax-contact-card p{margin:0;color:var(--muted);font-size:.9375rem;line-height:1.6}
.ax-contact-card a{color:var(--primary);text-decoration:none}
@media (max-width:700px){.ax-contact-grid{grid-template-columns:1fr}}`;

const CONTACT_PAGE_HTML = `<main class="ax-page">
  ${PAGE_NAV_HTML}
  ${pageHero("Contact", "Let's talk.", "Questions about Aska, partnerships, or press? We read everything and usually reply within one business day.")}
  <section class="ax-contact">
    <div class="ax-container">
      <div class="ax-contact-grid">
        <div class="ax-contact-card">
          <h3>Email</h3>
          <p><a href="mailto:hello@aska.dev">hello@aska.dev</a><br>Support: <a href="mailto:help@aska.dev">help@aska.dev</a></p>
        </div>
        <div class="ax-contact-card">
          <h3>Phone</h3>
          <p><a href="tel:+61255500142">+61 2 5550 0142</a><br>Mon&ndash;Fri, 9am&ndash;6pm AEST</p>
        </div>
        <div class="ax-contact-card">
          <h3>Office</h3>
          <p>14 Harbour Lane, Level 3<br>Sydney NSW 2000, Australia</p>
        </div>
      </div>
    </div>
  </section>
</main>`;

const CONTACT_PAGE_CSS = [PAGE_NAV_CSS, PAGE_HERO_CSS, CONTACT_CARDS_CSS].join("\n");

interface ThemePage {
  slug: string;
  title: string;
  metaDescription: string;
  html: string;
  css: string;
}

const THEME_PAGES: ThemePage[] = [
  {
    slug: "home",
    title: "Home",
    metaDescription: "Aska is a modern editorial CMS — content, design and code in one calm workspace.",
    html: HOME_PAGE_HTML,
    css: HOME_PAGE_CSS,
  },
  {
    slug: "about",
    title: "About",
    metaDescription: "The story behind Aska: a small team building a calmer way to publish on the web.",
    html: ABOUT_PAGE_HTML,
    css: ABOUT_PAGE_CSS,
  },
  {
    slug: "contact",
    title: "Contact",
    metaDescription: "Get in touch with the Aska team — email, phone and office details.",
    html: CONTACT_PAGE_HTML,
    css: CONTACT_PAGE_CSS,
  },
];

/* ----------------------------------------------------------------------- */
/* Menus, forms, categories                                                 */
/* ----------------------------------------------------------------------- */

const MENU_PRIMARY_LINKS = (pages: { homeId: number; aboutId: number; contactId: number }) => [
  { blockType: "link" as const, label: "Home", linkType: "page" as const, page: pages.homeId },
  { blockType: "link" as const, label: "Blog", linkType: "url" as const, url: "/blog" },
  { blockType: "link" as const, label: "About", linkType: "page" as const, page: pages.aboutId },
  { blockType: "link" as const, label: "Contact", linkType: "page" as const, page: pages.contactId },
];

const MENU_FOOTER_LINKS = (pages: { homeId: number; aboutId: number; contactId: number }) => [
  ...MENU_PRIMARY_LINKS(pages),
  { blockType: "link" as const, label: "Privacy", linkType: "url" as const, url: "#" },
];

const FORM_NEWSLETTER = {
  title: "Newsletter",
  fields: [
    { blockType: "email" as const, name: "email", label: "Email address", required: true },
  ],
  submitButtonLabel: "Subscribe",
  confirmationMessage: lexicalDoc(
    paragraph("Thanks for subscribing — the next issue lands in your inbox this week.")
  ),
};

const FORM_CONTACT = {
  title: "Contact",
  fields: [
    { blockType: "text" as const, name: "name", label: "Your name", required: true },
    { blockType: "email" as const, name: "email", label: "Email address", required: true },
    { blockType: "textarea" as const, name: "message", label: "Message", required: true },
  ],
  submitButtonLabel: "Send message",
  confirmationMessage: lexicalDoc(
    paragraph("Thanks for reaching out — we'll get back to you within one business day.")
  ),
};

const THEME_CATEGORIES = [
  { name: "Design", slug: "design" },
  { name: "Engineering", slug: "engineering" },
  { name: "Product", slug: "product" },
  { name: "Company", slug: "company" },
  { name: "Tutorials", slug: "tutorials" },
];

/* ----------------------------------------------------------------------- */
/* Sample content: blog posts, comments, products, house designs            */
/* ----------------------------------------------------------------------- */

interface ThemePost {
  slug: string;
  title: string;
  categorySlug: string;
  tags: string[];
  featured?: boolean;
  publishedAt: string;
  excerpt: string;
  metaDescription: string;
  body: LexicalRootDoc;
}

const THEME_POSTS: ThemePost[] = [
  {
    slug: "why-we-rebuilt-our-cms-from-scratch",
    title: "Why we rebuilt our CMS from scratch",
    categorySlug: "engineering",
    tags: ["cms", "architecture", "product"],
    featured: true,
    publishedAt: "2026-09-22T09:00:00.000Z",
    excerpt:
      "After three years of bending a general-purpose CMS to our will, we started over. Here's what broke, what we kept, and why the rewrite paid for itself in months.",
    metaDescription:
      "After three years of fighting a general-purpose CMS, we rebuilt ours from scratch. What broke, what we kept, and why it paid off.",
    body: lexicalDoc(
      paragraph(
        "Every CMS reaches a point where the workarounds outnumber the features. For us it was year three: a content model duct-taped into shapes it was never designed for, template logic split across four plugins, and a migration path that existed only in a spreadsheet nobody trusted."
      ),
      heading("The straw that broke the camel's back"),
      paragraph(
        "The breaking point was mundane. A client asked for a second language on one section of their site — a reasonable request — and we estimated six weeks. Six weeks, because every template, every relationship and every preview path had quietly accumulated assumptions about a single-locale world."
      ),
      paragraph(
        "That estimate wasn't a translation problem. It was interest on technical debt we'd been paying into for years, and it told us the foundation — not the feature list — was the thing to fix."
      ),
      heading("What we did differently"),
      paragraph(
        "The rewrite started with invariants instead of features: structured content in plain collections, rendering through explicit templates, design decisions living in tokens, and no hidden state anywhere. Every feature we added afterwards had to justify itself against those invariants."
      ),
      paragraph(
        "Six months in, the same multilingual request estimated out at four days. Not because we added translation features, but because nothing in the new foundation assumed a single language in the first place. That's the payoff of starting over that nobody puts on the slide: estimates stop being fiction."
      )
    ),
  },
  {
    slug: "design-tokens-in-practice",
    title: "Design tokens in practice: one palette, every surface",
    categorySlug: "design",
    tags: ["design-tokens", "css", "design-systems"],
    publishedAt: "2026-09-15T09:00:00.000Z",
    excerpt:
      "One palette, a handful of radii and a single shadow, exposed as CSS custom properties, keeps every page, block and template visually coherent. A field guide.",
    metaDescription:
      "How a small set of design tokens — colors, radii, shadows, spacing — keeps an entire CMS theme coherent across pages, blocks and templates.",
    body: lexicalDoc(
      paragraph(
        "Ask five designers to style a button and you'll get five reasonable answers. Ask them six months apart and you'll get ten. Design tokens exist to collapse that variance: one named decision, made once, referenced everywhere."
      ),
      heading("Fewer tokens, used more places"),
      paragraph(
        "The temptation is to model everything — forty shades of gray, eleven elevation levels. In practice we've found a tight set wins: a background, an ink color, one primary action color, muted text, a border, one accent. Six colors carry an entire editorial theme."
      ),
      paragraph(
        "The same discipline applies to radii and shadows. Two corner radii and one card shadow cover ninety percent of real UI. When everything shares a small vocabulary, a page assembled from six different blocks still looks like one design."
      ),
      heading("Tokens are a contract, not a palette"),
      paragraph(
        "The real value shows up at change time. When the brand team wanted a warmer primary color last quarter, it was a single edit to one token — and every button, badge and link on every site updated together. That's the moment a token stops being a variable and becomes a decision."
      )
    ),
  },
  {
    slug: "shipping-faster-with-a-component-library",
    title: "Shipping faster with a real component library",
    categorySlug: "product",
    tags: ["components", "workflow", "editor"],
    publishedAt: "2026-09-08T09:00:00.000Z",
    excerpt:
      "A shared block library turned our landing pages from week-long projects into afternoon edits. How we built it — and got the team to actually use it.",
    metaDescription:
      "A shared block library turned week-long landing page builds into afternoon edits. How we built ours and drove adoption.",
    body: lexicalDoc(
      paragraph(
        "Before the block library, every landing page was a bespoke project: new markup, new CSS, a review cycle, and a launch that always slipped a day or two. After it, our marketing team assembles a page in an afternoon and our developers review nothing — because there's nothing new to review."
      ),
      heading("Build the boring blocks first"),
      paragraph(
        "The library's most-used blocks are the unglamorous ones: hero, three features, a call-to-action band, a pricing table. The fancy interactive stuff gets requested constantly and used rarely. We shipped ten solid, boring patterns before anything with animation."
      ),
      paragraph(
        "Each block is hand-written HTML and CSS tuned to the design tokens — no framework output, no utility soup. That keeps them light, keeps them legible in the visual editor, and keeps them consistent by construction."
      ),
      heading("Adoption is a design problem"),
      paragraph(
        "A library nobody uses is just a folder. Naming blocks for what marketers ask for — 'CTA Band', not 'Section 4' — mattered more than any technical decision. Meet the team where their vocabulary is, and the library becomes the path of least resistance."
      )
    ),
  },
  {
    slug: "editorial-reviews-without-bottlenecks",
    title: "How we run editorial reviews without bottlenecks",
    categorySlug: "company",
    tags: ["process", "editorial"],
    publishedAt: "2026-08-27T09:00:00.000Z",
    excerpt:
      "Reviews don't have to mean queues of stuck drafts. The lightweight process that lets our editorial team ship daily without breaking things.",
    metaDescription:
      "Editorial reviews without bottlenecks: the lightweight process that lets a small team publish daily with confidence.",
    body: lexicalDoc(
      paragraph(
        "The classic editorial workflow is a queue: draft, submit, wait, review, wait, revise, wait, publish. Every handoff is a place where work goes to sit. Our goal was a process with the same rigor and almost none of the waiting."
      ),
      heading("Review the risky, ship the safe"),
      paragraph(
        "The first change was triage. A post that fixes a typo or updates a screenshot ships after a single skim. A post announcing pricing changes gets two reviewers and a legal pass. The rule is simple: review depth scales with blast radius, and everyone knows which is which."
      ),
      paragraph(
        "The second change was timing. Reviews happen in a fixed daily window, not ad hoc. Writers know exactly when feedback lands, reviewers batch their work, and nothing sits in 'waiting' for more than a day."
      ),
      heading("Boring is the feature"),
      paragraph(
        "None of this is clever, and that's the point. Process debt compounds exactly like technical debt — every exception becomes precedent. A boring, predictable review lane beats a clever one that everyone routes around."
      )
    ),
  },
  {
    slug: "structured-content-migrations-guide",
    title: "A practical guide to structured content migrations",
    categorySlug: "tutorials",
    tags: ["tutorial", "migration", "content-model"],
    publishedAt: "2026-08-18T09:00:00.000Z",
    excerpt:
      "Moving platforms without losing your content model — a step-by-step guide to auditing, mapping and validating a migration to a structured CMS.",
    metaDescription:
      "A step-by-step guide to migrating to a structured CMS: audit your content, map the model, validate, and cut over without losing data.",
    body: lexicalDoc(
      paragraph(
        "Most content migrations fail for the same reason: they start with the destination instead of the source. Before touching the new CMS, you need an honest map of what you actually have — and almost nobody has one."
      ),
      heading("Step 1: audit before you map"),
      paragraph(
        "Export everything and count it. How many posts, how many pages, how many orphaned assets, how many fields are actually populated versus technically available. Every migration surprise we've ever had was visible in this audit; we just hadn't looked."
      ),
      heading("Step 2: design the destination model first"),
      paragraph(
        "Write the new collections — fields, relationships, requiredness — before writing a single line of import code. The mapping document that falls out of this step is your contract: source field, destination field, transformation, and what happens when the source data is missing or malformed."
      ),
      heading("Step 3: validate on a sample, then automate"),
      paragraph(
        "Run the import on fifty representative documents and diff them by hand. URL slugs, embedded media, and rich-text formatting are where data hides and dies. Once the sample is clean, automate the full run — and keep the importer idempotent so re-runs are free."
      ),
      paragraph(
        "The final cutover is then almost boring: run the import, spot-check, flip DNS. Boring is exactly what you want a migration to be."
      )
    ),
  },
];

const THEME_COMMENTS: {
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  status: "approved" | "pending";
  content: string;
  replyTo?: number; // index into the created comments of this post
}[] = [
  {
    authorName: "Mara Jensen",
    authorEmail: "mara.jensen@example.com",
    status: "approved",
    content:
      "This mirrors our experience almost exactly. The 'rewrite vs refactor' framing is the clearest I've read on the topic — sharing it with my team this week.",
  },
  {
    authorName: "Tom Alvarez",
    authorEmail: "tom.alvarez@example.com",
    status: "approved",
    content:
      "Great read. How did you handle content migrations during the cutover — parallel writes, or a hard switch with a freeze window?",
  },
  {
    authorName: "Priya Nair",
    authorEmail: "priya.nair@example.com",
    status: "pending",
    content:
      "Would love a follow-up post on how you benchmarked editor performance before and after the rewrite.",
  },
  {
    authorName: "Aska Team",
    authorEmail: "team@aska.example.com",
    authorUrl: "https://aska.example.com",
    status: "approved",
    content:
      "Thanks Mara! A follow-up digging into the migration side of the rewrite is in the works — stay tuned.",
    replyTo: 0,
  },
];

const THEME_PRODUCTS = [
  {
    name: "Aska Theme — Editorial",
    slug: "aska-theme-editorial",
    inventory: 25,
    priceInUSD: 4900, // smallest currency unit — $49.00
    description: lexicalDoc(
      paragraph(
        "A production-grade editorial theme for Aska: typographic blog templates, a full pattern library and design tokens tuned for long-form publishing."
      ),
      paragraph("Includes the blog index and detail templates, six page sections and lifetime updates.")
    ),
  },
  {
    name: "Aska Theme — Commerce",
    slug: "aska-theme-commerce",
    inventory: 10,
    priceInUSD: 7900, // $79.00
    description: lexicalDoc(
      paragraph(
        "A storefront-ready theme for Aska: product grid and detail templates, pricing blocks and a checkout-ready layout."
      ),
      paragraph("Includes the products index and detail templates, commerce widgets and lifetime updates.")
    ),
  },
];

const THEME_HOUSE_DESIGNS = [
  {
    name: "The Kestrel",
    slug: "the-kestrel",
    bedrooms: 3,
    bathrooms: 2,
    garage: 1,
    houseSize: "148m²",
    description: lexicalDoc(
      paragraph(
        "A compact three-bedroom design that lives big: an open-plan kitchen and living space opens onto a north-facing deck, while a quiet wing keeps the main suite separate."
      ),
      paragraph("Designed for narrow suburban lots without sacrificing storage or natural light.")
    ),
  },
  {
    name: "The Marlow",
    slug: "the-marlow",
    bedrooms: 4,
    bathrooms: 2,
    garage: 2,
    houseSize: "236m²",
    description: lexicalDoc(
      paragraph(
        "A generous four-bedroom family home with a butler's pantry, a dedicated study and a covered alfresco that wraps the living wing."
      ),
      paragraph("The double garage and deep storage wall make it as practical as it is calm.")
    ),
  },
];

/* ----------------------------------------------------------------------- */
/* applyTheme — find-or-create everything by natural key                    */
/* ----------------------------------------------------------------------- */

type SummaryList = "created" | "existing" | "skipped";

function track(summary: ThemeSeedSummary, list: SummaryList, label: string) {
  summary[list].push(label);
}

async function seedStyleTokens(payload: Payload, summary: ThemeSeedSummary) {
  for (const token of STYLE_TOKENS) {
    const found = await payload.find({
      collection: "styles",
      where: { slug: { equals: token.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: "styles",
        id: found.docs[0].id,
        data: { ...token },
      });
      track(summary, "existing", `style:${token.slug}`);
    } else {
      await payload.create({ collection: "styles", data: { ...token } });
      track(summary, "created", `style:${token.slug}`);
    }
  }
}

async function seedComponents(payload: Payload, summary: ThemeSeedSummary) {
  for (const component of THEME_COMPONENTS) {
    const found = await payload.find({
      collection: "components",
      where: { name: { equals: component.name } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: "components",
        id: found.docs[0].id,
        data: { ...component },
      });
      track(summary, "existing", `component:${component.name}`);
    } else {
      await payload.create({ collection: "components", data: { ...component } });
      track(summary, "created", `component:${component.name}`);
    }
  }
}

async function seedTemplates(payload: Payload, summary: ThemeSeedSummary) {
  for (const template of THEME_TEMPLATES) {
    // Key on (collection, kind) — the pair is unique per the collection hook.
    // A template a user created under any name still gets converged to the
    // theme's content rather than aborting the seed.
    const found = await payload.find({
      collection: "templates",
      where: {
        and: [
          { collection: { equals: template.collection } },
          { kind: { equals: template.kind } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: "templates",
        id: found.docs[0].id,
        data: { ...template },
      });
      track(summary, "existing", `template:${template.name}`);
      continue;
    }
    try {
      await payload.create({ collection: "templates", data: { ...template } });
      track(summary, "created", `template:${template.name}`);
    } catch (err) {
      if (err instanceof Error && /unique|already exists/i.test(err.message)) {
        track(summary, "skipped", `template:${template.name} (${err.message})`);
      } else {
        throw err;
      }
    }
  }
}

async function seedPages(payload: Payload, summary: ThemeSeedSummary) {
  const ids: { homeId: number; aboutId: number; contactId: number } = {
    homeId: 0,
    aboutId: 0,
    contactId: 0,
  };
  for (const page of THEME_PAGES) {
    const found = await payload.find({
      collection: "pages",
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
    });
    const data = {
      title: page.title,
      metaDescription: page.metaDescription,
      html: page.html,
      css: page.css,
      _status: "published" as const,
    };
    let id: number;
    if (found.docs[0]) {
      const updated = await payload.update({ collection: "pages", id: found.docs[0].id, data });
      id = updated.id as number;
      track(summary, "existing", `page:${page.slug}`);
    } else {
      const created = await payload.create({ collection: "pages", data: { ...data, slug: page.slug } });
      id = created.id as number;
      track(summary, "created", `page:${page.slug}`);
    }
    if (page.slug === "home") ids.homeId = id;
    if (page.slug === "about") ids.aboutId = id;
    if (page.slug === "contact") ids.contactId = id;
  }
  return ids;
}

async function seedMenus(
  payload: Payload,
  summary: ThemeSeedSummary,
  pages: { homeId: number; aboutId: number; contactId: number }
) {
  const menus = [
    { name: "Primary", items: MENU_PRIMARY_LINKS(pages) },
    { name: "Footer", items: MENU_FOOTER_LINKS(pages) },
  ];
  const ids: { primaryId: number; footerId: number } = { primaryId: 0, footerId: 0 };
  for (const menu of menus) {
    const found = await payload.find({
      collection: "menus",
      where: { name: { equals: menu.name } },
      limit: 1,
      depth: 0,
    });
    let id: number;
    if (found.docs[0]) {
      const updated = await payload.update({
        collection: "menus",
        id: found.docs[0].id,
        data: { items: menu.items },
      });
      id = updated.id as number;
      track(summary, "existing", `menu:${menu.name}`);
    } else {
      const created = await payload.create({ collection: "menus", data: menu });
      id = created.id as number;
      track(summary, "created", `menu:${menu.name}`);
    }
    if (menu.name === "Primary") ids.primaryId = id;
    if (menu.name === "Footer") ids.footerId = id;
  }
  return ids;
}

async function seedForms(payload: Payload, summary: ThemeSeedSummary) {
  const forms = [FORM_NEWSLETTER, FORM_CONTACT];
  let newsletterId = 0;
  for (const form of forms) {
    const found = await payload.find({
      collection: "forms",
      where: { title: { equals: form.title } },
      limit: 1,
      depth: 0,
    });
    let id: number;
    if (found.docs[0]) {
      const updated = await payload.update({
        collection: "forms",
        id: found.docs[0].id,
        data: { ...form },
      });
      id = updated.id as number;
      track(summary, "existing", `form:${form.title}`);
    } else {
      const created = await payload.create({ collection: "forms", data: { ...form } });
      id = created.id as number;
      track(summary, "created", `form:${form.title}`);
    }
    if (form.title === "Newsletter") newsletterId = id;
  }
  return { newsletterId };
}

async function seedWidgets(
  payload: Payload,
  summary: ThemeSeedSummary,
  newsletterId: number
) {
  const current = await payload.findGlobal({ slug: "widgets", depth: 0 });
  const existingAreas =
    (current as { areas?: { id?: string | null; area: string }[] | null }).areas ?? [];

  // Rows mirror the Widgets global's generated block union; the cast on the
  // update below covers new area rows that don't carry an id yet.
  type WidgetArea = Omit<NonNullable<NonNullable<Widgets["areas"]>[number]>, "id">;
  const desired: WidgetArea[] = [
    {
      area: "sidebar",
      items: [
        { blockType: "searchBox" },
        { blockType: "recentPosts", count: 5 },
        { blockType: "categories" },
        { blockType: "form", form: newsletterId },
      ],
    },
    {
      area: "footer_1",
      items: [
        { blockType: "heading", text: "Aska" },
        {
          blockType: "richText",
          content: lexicalDoc(
            paragraph(
              "Aska is a modern editorial CMS — content, design and code in one calm workspace."
            )
          ),
        },
      ],
    },
    {
      area: "footer_2",
      items: [
        { blockType: "heading", text: "Explore" },
        {
          blockType: "html",
          code: `<ul><li><a href="/">Home</a></li><li><a href="/blog">Blog</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul>`,
        },
      ],
    },
    {
      area: "footer_3",
      items: [
        { blockType: "heading", text: "Newsletter" },
        { blockType: "form", form: newsletterId },
      ],
    },
  ];

  // Upsert by area name: replace the items of an existing area row (keeping
  // its id), append a new row for areas that don't exist yet.
  const merged = desired.map((row) => {
    const prev = existingAreas.find((a) => a.area === row.area);
    return prev?.id ? { ...row, id: prev.id } : row;
  });

  await payload.updateGlobal({
    slug: "widgets",
    data: { areas: merged as unknown as Widgets["areas"] },
  });
  track(summary, existingAreas.length ? "existing" : "created", "global:widgets");
}

async function seedSettings(
  payload: Payload,
  summary: ThemeSeedSummary,
  pages: { homeId: number },
  menus: { primaryId: number; footerId: number }
) {
  await payload.updateGlobal({
    slug: "settings",
    data: {
      homepage: pages.homeId,
      primaryMenu: menus.primaryId,
      footerMenu: menus.footerId,
    },
  });
  track(summary, "existing", "global:settings");
}

async function seedCategories(
  payload: Payload,
  summary: ThemeSeedSummary
): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const category of THEME_CATEGORIES) {
    const found = await payload.find({
      collection: "categories",
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      ids[category.slug] = found.docs[0].id as number;
      track(summary, "existing", `category:${category.slug}`);
    } else {
      const created = await payload.create({ collection: "categories", data: category });
      ids[category.slug] = created.id as number;
      track(summary, "created", `category:${category.slug}`);
    }
  }
  return ids;
}

async function seedPosts(
  payload: Payload,
  summary: ThemeSeedSummary,
  categoryIds: Record<string, number>
): Promise<number | null> {
  let firstPostId: number | null = null;
  for (const post of THEME_POSTS) {
    const found = await payload.find({
      collection: "blog",
      where: { slug: { equals: post.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      if (firstPostId === null) firstPostId = found.docs[0].id as number;
      track(summary, "existing", `post:${post.slug}`);
      continue;
    }
    const created = await payload.create({
      collection: "blog",
      data: {
        title: post.title,
        slug: post.slug,
        content: post.body,
        excerpt: post.excerpt,
        metaDescription: post.metaDescription,
        category: categoryIds[post.categorySlug],
        tags: post.tags,
        featured: post.featured ?? false,
        visibility: "public",
        publishedAt: post.publishedAt,
        _status: "published",
      },
    });
    if (firstPostId === null) firstPostId = created.id as number;
    track(summary, "created", `post:${post.slug}`);
  }
  return firstPostId;
}

async function seedComments(
  payload: Payload,
  summary: ThemeSeedSummary,
  postId: number | null
) {
  if (postId === null) {
    track(summary, "skipped", "comments (no blog post to attach them to)");
    return;
  }
  const createdIds: number[] = [];
  for (const comment of THEME_COMMENTS) {
    const found = await payload.find({
      collection: "comments",
      where: {
        and: [
          { post: { equals: postId } },
          { authorEmail: { equals: comment.authorEmail } },
          { content: { equals: comment.content } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      createdIds.push(found.docs[0].id as number);
      track(summary, "existing", `comment:${comment.authorName}`);
      continue;
    }
    const created = await payload.create({
      collection: "comments",
      data: {
        post: postId,
        parent: comment.replyTo !== undefined ? createdIds[comment.replyTo] : undefined,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        authorUrl: comment.authorUrl,
        content: comment.content,
        status: comment.status,
      },
    });
    createdIds.push(created.id as number);
    track(summary, "created", `comment:${comment.authorName}`);
  }
}

async function seedProducts(payload: Payload, summary: ThemeSeedSummary) {
  for (const product of THEME_PRODUCTS) {
    const found = await payload.find({
      collection: "products",
      where: { slug: { equals: product.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      track(summary, "existing", `product:${product.slug}`);
      continue;
    }
    await payload.create({
      collection: "products",
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        inventory: product.inventory,
        // The plugin's per-currency price groups are NAMELESS — their inner
        // fields (priceInUSDEnabled / priceInUSD) sit directly on the product.
        priceInUSDEnabled: true,
        priceInUSD: product.priceInUSD,
        _status: "published",
      },
    });
    track(summary, "created", `product:${product.slug}`);
  }
}

async function seedHouseDesigns(payload: Payload, summary: ThemeSeedSummary) {
  for (const design of THEME_HOUSE_DESIGNS) {
    const found = await payload.find({
      collection: "house-designs",
      where: { slug: { equals: design.slug } },
      limit: 1,
      depth: 0,
    });
    if (found.docs[0]) {
      track(summary, "existing", `house-design:${design.slug}`);
      continue;
    }
    await payload.create({
      collection: "house-designs",
      data: { ...design },
    });
    track(summary, "created", `house-design:${design.slug}`);
  }
}

async function logThemeBuilder(payload: Payload) {
  // Read-only: the spec leaves header/footer on whatever the site already
  // uses (default component unless a user picked something) — just log the
  // current modes so the seed output shows they were left untouched.
  const theme = (await payload.findGlobal({ slug: "theme-builder", depth: 0 })) as {
    header?: { mode?: string };
    footer?: { mode?: string };
  };
  payload.logger.info(
    `theme-builder left as-is (header: ${theme.header?.mode ?? "DEFAULT_COMPONENT"}, footer: ${theme.footer?.mode ?? "DEFAULT_COMPONENT"})`
  );
}

/**
 * Applies the full sample theme. Every item is found-or-created by its
 * natural key, so the function is idempotent: re-runs converge the theme
 * documents (tokens, components, templates, pages, menus, forms, widgets,
 * settings) to this data and leave user-created content untouched.
 */
export async function applyTheme(payload: Payload): Promise<ThemeSeedSummary> {
  const summary: ThemeSeedSummary = { created: [], existing: [], skipped: [] };

  await seedStyleTokens(payload, summary);
  await seedComponents(payload, summary);
  await seedTemplates(payload, summary);
  const pages = await seedPages(payload, summary);
  const menus = await seedMenus(payload, summary, pages);
  const forms = await seedForms(payload, summary);
  await seedWidgets(payload, summary, forms.newsletterId);
  await seedSettings(payload, summary, pages, menus);
  const categoryIds = await seedCategories(payload, summary);
  const firstPostId = await seedPosts(payload, summary, categoryIds);
  await seedComments(payload, summary, firstPostId);
  await seedProducts(payload, summary);
  await seedHouseDesigns(payload, summary);
  await logThemeBuilder(payload);

  payload.logger.info(
    `Sample theme applied: ${summary.created.length} created, ${summary.existing.length} already present, ${summary.skipped.length} skipped`
  );
  return summary;
}
