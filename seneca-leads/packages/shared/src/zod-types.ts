import { z } from 'zod';

export const SourceEnum = z.enum([
  'google_places',
  'rues',
  'ccb',
  'instagram',
  'rappi',
  'super_sociedades',
]);
export type Source = z.infer<typeof SourceEnum>;

export const SectorEnum = z.enum(['restaurant', 'spa', 'clinic', 'retail', 'other']);
export type Sector = z.infer<typeof SectorEnum>;

export const CohortEnum = z.enum(['new_winner', 'mature_painful']);
export type Cohort = z.infer<typeof CohortEnum>;

export const LeadStatusEnum = z.enum(['new', 'qualified', 'contacted', 'won', 'lost']);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const PainCategoryEnum = z.enum([
  'service_speed',
  'service_quality',
  'food_quality',
  'food_portion_price',
  'hygiene',
  'ambience_noise',
  'reservation_booking',
  'delivery_timing',
  'order_accuracy',
  'pricing_value',
  'payment_systems',
  'staff_turnover',
  'facility_condition',
  'digital_experience',
  'communication',
  'other',
]);
export type PainCategory = z.infer<typeof PainCategoryEnum>;

export const HaikuPainExtractionSchema = z.object({
  pains: z.array(
    z.object({
      category: PainCategoryEnum,
      subcategory: z.string().min(1),
      severity: z.number().int().min(1).max(5),
      frequency_in_sample: z.number().min(0).max(1),
      representative_quote: z.string().min(1),
      evidence_count: z.number().int().min(1),
      solution_hint: z.string().min(1),
    }),
  ),
  overall_sentiment: z.number().min(-1).max(1),
  notable_strength: z.string().nullable(),
});
export type HaikuPainExtraction = z.infer<typeof HaikuPainExtractionSchema>;

export const RunSummarySchema = z.object({
  source: SourceEnum,
  startedAt: z.string(),
  finishedAt: z.string(),
  durationSeconds: z.number(),
  rowsProcessed: z.number(),
  rowsCreated: z.number(),
  rowsUpdated: z.number(),
  errors: z.number(),
  notes: z.array(z.string()).default([]),
});
export type RunSummary = z.infer<typeof RunSummarySchema>;
