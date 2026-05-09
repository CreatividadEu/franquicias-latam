import { normalizeBusinessName } from '@seneca/shared';
import type { SerpLocalResult, SerpReview } from './serpapi.js';

export interface PlaceUpsertPayload {
  placeId: string;
  nameCanonical: string;
  nameNormalized: string;
  sector: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  domain: string | null;
  igHandle: string | null;
  rating: number | null;
  reviewCount: number | null;
}

function extractDomain(website: string | undefined): string | null {
  if (!website) return null;
  try {
    const u = new URL(website);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function extractIgHandleFromWebsite(website: string | undefined): string | null {
  if (!website) return null;
  const m = website.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return m ? (m[1] ?? null) : null;
}

export function normalizePlace(
  place: SerpLocalResult,
  ctx: { sector: string; city: string },
): PlaceUpsertPayload | null {
  const placeId = place.place_id;
  const title = place.title;
  if (!placeId || !title) return null;

  const lat = place.gps_coordinates?.latitude ?? null;
  const lng = place.gps_coordinates?.longitude ?? null;
  const domain = extractDomain(place.website);
  const igHandle =
    extractIgHandleFromWebsite(place.website) ??
    (domain && /instagram\.com$/i.test(domain) ? null : null);

  return {
    placeId,
    nameCanonical: title,
    nameNormalized: normalizeBusinessName(title),
    sector: ctx.sector,
    city: ctx.city,
    address: place.address ?? null,
    lat,
    lng,
    phone: place.phone ?? null,
    domain,
    igHandle,
    rating: typeof place.rating === 'number' ? place.rating : null,
    reviewCount: typeof place.reviews === 'number' ? place.reviews : null,
  };
}

export interface ReviewUpsertPayload {
  externalId: string;
  rating: number;
  textOriginal: string;
  postedAt: Date;
}

function parseIsoDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeReview(
  review: SerpReview,
  placeId: string,
): ReviewUpsertPayload | null {
  const text = review.snippet?.trim();
  if (!text) return null;
  const rating = typeof review.rating === 'number' ? review.rating : null;
  if (rating === null) return null;

  const postedAt = parseIsoDate(review.iso_date) ?? parseIsoDate(review.iso_date_of_last_edit);
  if (!postedAt) return null;

  const externalId = review.review_id ?? `${placeId}:${review.iso_date ?? ''}:${text.length}`;

  return {
    externalId,
    rating,
    textOriginal: text,
    postedAt,
  };
}

export function stripPiiFromPlacePayload(place: SerpLocalResult): SerpLocalResult {
  const out: SerpLocalResult = { ...place };
  if ('user_review' in out) delete (out as Record<string, unknown>).user_review;
  if ('user_reviews' in out) delete (out as Record<string, unknown>).user_reviews;
  return out;
}

export function stripPiiFromReviewPayload(review: SerpReview): SerpReview {
  const out: SerpReview = { ...review, user: undefined };
  if ('link' in out) delete (out as Record<string, unknown>).link;
  return out;
}
