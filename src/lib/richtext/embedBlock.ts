import type { Block } from "payload";
import { CODE_FIELD_ADMIN } from "@/lib/adminFields/codeEditor";

type OEmbedResponse = {
  html?: string;
  provider_name?: string;
  title?: string;
};

const OEMBED_FETCH_TIMEOUT_MS = 8000;

// Field-level hooks run inside Payload's richText sanitization, so this also
// executes for blocks nested in a Lexical field — not just top-level fields.
const findOEmbedEndpoint = (html: string): string | null => {
  const linkTags = html.match(/<link[^>]*>/gi) ?? [];
  const oembedTag = linkTags.find(
    (tag) =>
      /rel=["']alternate["']/i.test(tag) && /type=["']application\/json\+oembed["']/i.test(tag)
  );
  if (!oembedTag) return null;
  const href = oembedTag.match(/href=["']([^"']+)["']/i)?.[1];
  return href ? href.replace(/&amp;/g, "&") : null;
};

const fetchOEmbed = async (pageUrl: string): Promise<OEmbedResponse | null> => {
  const pageRes = await fetch(pageUrl, {
    signal: AbortSignal.timeout(OEMBED_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "aska-cms/oembed" },
  });
  if (!pageRes.ok) return null;
  const pageHtml = await pageRes.text();
  const oembedUrl = findOEmbedEndpoint(pageHtml);
  if (!oembedUrl) return null;
  const oembedRes = await fetch(oembedUrl, {
    signal: AbortSignal.timeout(OEMBED_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "aska-cms/oembed" },
  });
  if (!oembedRes.ok) return null;
  return (await oembedRes.json()) as OEmbedResponse;
};

export const embedBlock: Block = {
  slug: "embed",
  labels: { singular: "Embed", plural: "Embeds" },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "Page URL to embed — oEmbed data is resolved automatically on save.",
      },
      hooks: {
        // beforeChange (not afterChange): the document is already persisted by
        // the time afterChange runs, so sibling writes there would need a second
        // update operation. Mutating siblingData here lands in the same save.
        beforeChange: [
          async ({ value, previousValue, siblingData }) => {
            const url = typeof value === "string" ? value.trim() : "";
            const siblings = siblingData as {
              html?: string;
              provider?: string;
              title?: string;
            };
            if (!url || (url === previousValue && siblings.html)) return value;
            try {
              const oembed = await fetchOEmbed(url);
              siblings.html = oembed?.html ?? "";
              siblings.title = oembed?.title ?? "";
              siblings.provider = oembed?.provider_name ?? "";
            } catch {
              // Unreachable host, missing oEmbed tag, non-JSON provider — leave
              // the resolved fields empty rather than failing the save.
              siblings.html = "";
              siblings.title = "";
              siblings.provider = "";
            }
            return value;
          },
        ],
      },
    },
    {
      name: "provider",
      type: "text",
      admin: { readOnly: true, description: "Resolved automatically on save." },
    },
    {
      name: "html",
      type: "code",
      admin: {
        language: "html",
        readOnly: true,
        description: "Resolved oEmbed HTML",
        ...CODE_FIELD_ADMIN,
      },
    },
    {
      name: "title",
      type: "text",
      admin: { readOnly: true },
    },
  ],
};
