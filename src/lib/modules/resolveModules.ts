import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";
import { resolvePlaceId, fetchPlaceReviews, type GoogleReview } from "./googlePlaces";
import { renderGrid, renderMarquee, renderCarousel, renderPlaceholder } from "./renderGoogleReviews";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Module blocks are always flat (no nested <div>s) - see GrapesEditor's
// MODULE_BLOCKS - so a non-greedy match to the first closing tag is safe and
// avoids needing a real HTML parser for this "lite" templating step.
const MODULE_TAG_RE =
  /<div[^>]*data-aska-module="google-reviews"[^>]*data-module-id="(\d+)"[^>]*>[\s\S]*?<\/div>/g;

/** Replaces `data-aska-module="google-reviews"` placeholders with rendered review markup. */
export async function resolveModules(html: string): Promise<string> {
  if (!html.includes('data-aska-module="google-reviews"')) return html;

  const ids = new Set<string>();
  for (const m of html.matchAll(MODULE_TAG_RE)) ids.add(m[1]);
  if (!ids.size) return html;

  const payload = await getPayload({ config });
  const rendered = new Map<string, string>();
  await Promise.all(
    Array.from(ids).map(async (id) => {
      rendered.set(id, await renderModule(payload, id));
    })
  );

  return html.replace(MODULE_TAG_RE, (match, id) => rendered.get(id) ?? match);
}

async function renderModule(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: string
): Promise<string> {
  try {
    const doc = await payload.findByID({ collection: "modules", id, depth: 0 });
    if (!doc || doc.type !== "googleReviews") return "";

    let reviews: GoogleReview[];
    const cachedAt = doc.cachedAt ? new Date(doc.cachedAt as string).getTime() : 0;
    const isFresh = Date.now() - cachedAt < CACHE_TTL_MS;

    if (isFresh && Array.isArray(doc.cachedReviews)) {
      reviews = doc.cachedReviews as GoogleReview[];
    } else {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        return renderPlaceholder("Google Reviews module: set GOOGLE_PLACES_API_KEY to display reviews.");
      }

      let placeId = doc.placeId as string | undefined;
      if (!placeId) {
        placeId = (await resolvePlaceId(doc.googleMapsUrl as string, apiKey)) ?? undefined;
      }
      if (!placeId) {
        return renderPlaceholder("Google Reviews module: couldn't resolve a place from the given Maps URL.");
      }

      const result = await fetchPlaceReviews(placeId, apiKey);
      reviews = result.reviews;
      await payload.update({
        collection: "modules",
        id,
        data: { placeId, cachedReviews: reviews, cachedAt: new Date().toISOString(), cacheError: null },
      });
    }

    const minRating = (doc.minRating as number) || 0;
    const maxReviews = (doc.maxReviews as number) || 5;
    const filtered = reviews.filter((r) => r.rating >= minRating).slice(0, maxReviews);
    if (!filtered.length) return renderPlaceholder("No reviews to show yet.");

    switch (doc.displayStyle) {
      case "marquee":
        return renderMarquee(filtered);
      case "carousel":
        return renderCarousel(filtered);
      default:
        return renderGrid(filtered);
    }
  } catch (err) {
    payload.logger.error({ err, moduleId: id }, "Failed to render Google Reviews module");
    return renderPlaceholder("Google Reviews module failed to load.");
  }
}
