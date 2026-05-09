-- Cohort views — applied as a follow-up migration after `prisma migrate dev --name init`.
-- Rename this folder to `<timestamp>_add_cohort_views` before running `prisma migrate deploy`.

-- new_winner cohort
CREATE OR REPLACE VIEW v_cohort_new_winner AS
WITH latest AS (
  SELECT DISTINCT ON (business_id) *
  FROM snapshot
  ORDER BY business_id, date DESC
),
velocity AS (
  SELECT business_id,
         COUNT(*)::float / 3.0 AS reviews_per_month_recent
  FROM review
  WHERE posted_at > NOW() - INTERVAL '90 days'
  GROUP BY business_id
)
SELECT b.*,
       l.google_review_count,
       l.google_rating,
       l.ig_followers,
       l.ig_engagement_rate,
       v.reviews_per_month_recent
FROM business b
JOIN latest l ON l.business_id = b.id
LEFT JOIN velocity v ON v.business_id = b.id
WHERE b.opened_at > NOW() - INTERVAL '24 months'
  AND l.google_review_count >= 30
  AND l.google_rating >= 4.3
  AND COALESCE(v.reviews_per_month_recent, 0) >= 5;

-- mature_painful cohort
CREATE OR REPLACE VIEW v_cohort_mature_painful AS
WITH latest AS (
  SELECT DISTINCT ON (business_id) *
  FROM snapshot
  ORDER BY business_id, date DESC
),
trend AS (
  SELECT business_id,
         AVG(rating) FILTER (WHERE posted_at > NOW() - INTERVAL '90 days') AS recent_avg,
         AVG(rating) FILTER (
           WHERE posted_at BETWEEN NOW() - INTERVAL '12 months' AND NOW() - INTERVAL '90 days'
         ) AS prior_avg
  FROM review
  GROUP BY business_id
)
SELECT b.*,
       l.google_review_count,
       l.google_rating,
       (t.recent_avg - t.prior_avg) AS rating_delta_90d
FROM business b
JOIN latest l ON l.business_id = b.id
JOIN trend t ON t.business_id = b.id
WHERE b.opened_at < NOW() - INTERVAL '36 months'
  AND l.google_review_count >= 100
  AND l.google_rating BETWEEN 3.5 AND 4.3
  AND (t.recent_avg - t.prior_avg) <= -0.15;
