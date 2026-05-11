/**
 * Sector heuristic for restaurants — spec §3.4 layer 2.
 *
 *   est_low  = seats * 0.4 * avg_ticket_low  * 26 days * 12 months
 *   est_high = seats * 0.6 * avg_ticket_high * 26 days * 12 months
 *
 * seats_estimate comes from Google Places photo count: 10 photos ≈ 30 seats
 * per spec. (Rough; Claude Vision-based seat count is a planned upgrade.)
 *
 * avg_ticket: spec says "Rappi menu median × 1.4 (dine-in premium). If no
 * Rappi, use sector default by city." We did not fetch Rappi menus in Phase 2
 * (only store_id from suggestions). Using Bogotá restaurant city defaults:
 *   - low end:  COP 25,000  (street/casual)
 *   - high end: COP 60,000  (mid-range)
 *
 * Outputs COP as bigint (per spec: "all monetary values in COP, stored as
 * BigInt. Never store as float.").
 */

const WORK_DAYS_PER_MONTH = 26;
const MONTHS_PER_YEAR = 12;
const ANNUAL_DAYS = BigInt(WORK_DAYS_PER_MONTH * MONTHS_PER_YEAR);

const TURNOVER_LOW = 0.4;
const TURNOVER_HIGH = 0.6;

// Bogotá restaurant city defaults. Adjust per-business later if Rappi menu
// data is fetched.
const DEFAULT_TICKET_LOW_COP = 25_000n;
const DEFAULT_TICKET_HIGH_COP = 60_000n;

const PHOTOS_PER_SEAT_BLOCK = 10;
const SEATS_PER_PHOTO_BLOCK = 30;
const SECTOR_DEFAULT_SEATS = 24; // ~3 photo-blocks for an "average" listing

export interface SectorEstimateInput {
  /** Photos visible on Google Places (from observation.payload). */
  photoCount: number | null;
  /** Optional override: average ticket in COP from Rappi menu × 1.4. */
  avgTicketLowCop?: bigint;
  avgTicketHighCop?: bigint;
}

export interface SectorEstimateResult {
  estRevenueLow: bigint;
  estRevenueHigh: bigint;
  seatsEstimate: number;
  confidence: number;
  method: 'photo_count' | 'sector_default';
}

export function estimateRestaurantRevenue(
  input: SectorEstimateInput,
): SectorEstimateResult {
  // Seats: 10 photos ≈ 30 seats. Use sector default if no photos.
  let seats: number;
  let method: SectorEstimateResult['method'];
  if (input.photoCount && input.photoCount > 0) {
    seats = Math.round((input.photoCount / PHOTOS_PER_SEAT_BLOCK) * SEATS_PER_PHOTO_BLOCK);
    if (seats < 8) seats = 8;
    if (seats > 200) seats = 200;
    method = 'photo_count';
  } else {
    seats = SECTOR_DEFAULT_SEATS;
    method = 'sector_default';
  }

  const ticketLow = input.avgTicketLowCop ?? DEFAULT_TICKET_LOW_COP;
  const ticketHigh = input.avgTicketHighCop ?? DEFAULT_TICKET_HIGH_COP;

  // Use BigInt math throughout for COP money. Convert turnover via fractional
  // multiplication first (×4 / 10 = ×0.4 ; ×6 / 10 = ×0.6) to keep it integer.
  const seatsBig = BigInt(seats);
  const estLow = (seatsBig * 4n * ticketLow * ANNUAL_DAYS) / 10n;
  const estHigh = (seatsBig * 6n * ticketHigh * ANNUAL_DAYS) / 10n;

  // Confidence: photo-based gets 0.30, sector default 0.10. SuperSociedades
  // direct match would set 1.0 (layer 1, deferred — no CSVs loaded yet).
  // Regression layer 3 would land somewhere between.
  const confidence = method === 'photo_count' ? 0.3 : 0.1;
  void TURNOVER_LOW;
  void TURNOVER_HIGH; // documented in JSDoc; values are spec-derived

  return {
    estRevenueLow: estLow,
    estRevenueHigh: estHigh,
    seatsEstimate: seats,
    confidence,
    method,
  };
}
