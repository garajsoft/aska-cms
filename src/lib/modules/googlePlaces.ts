import "server-only";

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

export interface PlaceReviewsResult {
  placeName: string;
  rating: number;
  userRatingsTotal: number;
  reviews: GoogleReview[];
}

interface PlaceHint {
  placeId?: string;
  name?: string;
  lat?: number;
  lng?: number;
}

/**
 * Google Maps location URLs vary a lot depending on how they were copied
 * (share link, address bar after searching, etc). We only need enough of a
 * hint to resolve a place_id via the Find Place API - a direct place_id
 * query param if present, otherwise the place name + coordinates for a text
 * search.
 */
export function extractPlaceHint(url: string): PlaceHint {
  const placeIdMatch = url.match(/[?&]place_id=([^&]+)/);
  if (placeIdMatch) return { placeId: decodeURIComponent(placeIdMatch[1]) };

  const nameMatch = url.match(/\/place\/([^/@]+)/);
  const latLngMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return {
    name: nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, " ")) : undefined,
    lat: latLngMatch ? parseFloat(latLngMatch[1]) : undefined,
    lng: latLngMatch ? parseFloat(latLngMatch[2]) : undefined,
  };
}

/** Resolves a Google Maps URL to a place_id, using the legacy Find Place API. */
export async function resolvePlaceId(url: string, apiKey: string): Promise<string | null> {
  const hint = extractPlaceHint(url);
  if (hint.placeId) return hint.placeId;
  if (!hint.name) return null;

  const params = new URLSearchParams({
    input: hint.name,
    inputtype: "textquery",
    fields: "place_id",
    key: apiKey,
  });
  if (hint.lat != null && hint.lng != null) {
    params.set("locationbias", `point:${hint.lat},${hint.lng}`);
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`
  );
  const data = (await res.json()) as { candidates?: { place_id?: string }[]; status?: string };
  return data.candidates?.[0]?.place_id ?? null;
}

/** Fetches place details + reviews. Google caps this endpoint at 5 reviews. */
export async function fetchPlaceReviews(
  placeId: string,
  apiKey: string
): Promise<PlaceReviewsResult> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,reviews",
    key: apiKey,
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    result?: {
      name?: string;
      rating?: number;
      user_ratings_total?: number;
      reviews?: {
        author_name: string;
        profile_photo_url?: string;
        rating: number;
        text: string;
        relative_time_description: string;
        time: number;
      }[];
    };
  };

  if (data.status !== "OK") {
    throw new Error(`Google Places API error: ${data.status} ${data.error_message ?? ""}`.trim());
  }

  const result = data.result ?? {};
  return {
    placeName: result.name ?? "",
    rating: result.rating ?? 0,
    userRatingsTotal: result.user_ratings_total ?? 0,
    reviews: (result.reviews ?? []).map((r) => ({
      authorName: r.author_name,
      authorPhotoUrl: r.profile_photo_url,
      rating: r.rating,
      text: r.text,
      relativeTime: r.relative_time_description,
      time: r.time,
    })),
  };
}
