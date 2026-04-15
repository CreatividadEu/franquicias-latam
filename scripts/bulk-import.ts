/**
 * Franchise Landing System — Bulk Importer
 *
 * Usage:
 *   npx tsx scripts/bulk-import.ts \
 *     --csv data/franchises.csv \
 *     --models data/business-models.csv \
 *     --faqs data/faqs.csv \
 *     --assets data/assets/
 *
 * All flags are optional. Script processes whatever is provided.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { PLAN_ENTITLEMENTS } from "../src/lib/plan-entitlements";
import type { PlanTier } from "../src/lib/plan-entitlements";

const prisma = new PrismaClient();

// ── CLI args ──────────────────────────────────────────────────────────────────

function arg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] ?? null : null;
}

const CSV_PATH = arg("--csv");
const MODELS_PATH = arg("--models");
const FAQS_PATH = arg("--faqs");
const ASSETS_DIR = arg("--assets");

// ── Supabase client ───────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_FRANCHISES_BUCKET ?? "franchises";

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// ── CSV parser (RFC 4180) ─────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i++];
        }
      }
      fields.push(field);
      if (i < line.length && line[i] === ',') i++;
    } else {
      const start = i;
      while (i < line.length && line[i] !== ',') i++;
      fields.push(line.slice(start, i).trim());
      if (i < line.length) i++;
    }
  }
  return fields;
}

function parseCsv(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

// ── Asset uploader ────────────────────────────────────────────────────────────

async function uploadAsset(localPath: string, storagePath: string): Promise<string | null> {
  if (!supabase) {
    console.warn("  ⚠  Supabase not configured, skipping upload:", localPath);
    return null;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const contentType = localPath.endsWith(".pdf")
    ? "application/pdf"
    : localPath.match(/\.png$/i)
    ? "image/png"
    : "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error(`  ✗  Upload failed ${storagePath}: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── Asset scanner ─────────────────────────────────────────────────────────────

interface ScannedAssets {
  hero?: string;
  logo?: string;
  brochure?: string;
  gallery: string[];
  models: Record<string, string>;
}

async function scanAndUploadAssets(
  slug: string,
  assetsDir: string
): Promise<ScannedAssets> {
  const result: ScannedAssets = { gallery: [], models: {} };
  if (!fs.existsSync(assetsDir)) return result;

  const files = fs.readdirSync(assetsDir).filter((f) =>
    f.toLowerCase().startsWith(slug.replace(/-/g, "_") + "__") ||
    f.toLowerCase().startsWith(slug + "__")
  );

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const namePart = file.replace(/\.[^.]+$/, "").split("__")[1] ?? "";

    if (namePart === "hero") {
      const url = await uploadAsset(filePath, `${slug}/landing/hero.${file.split(".").pop()}`);
      if (url) result.hero = url;
    } else if (namePart === "logo") {
      const url = await uploadAsset(filePath, `${slug}/landing/logo.${file.split(".").pop()}`);
      if (url) result.logo = url;
    } else if (namePart === "brochure") {
      const url = await uploadAsset(filePath, `${slug}/landing/brochure.pdf`);
      if (url) result.brochure = url;
    } else if (namePart.startsWith("gallery_")) {
      const idx = namePart.replace("gallery_", "");
      const url = await uploadAsset(filePath, `${slug}/landing/gallery/${idx}.${file.split(".").pop()}`);
      if (url) result.gallery.push(url);
    } else if (namePart.startsWith("model_")) {
      const modelName = namePart.replace("model_", "").replace(/_/g, " ");
      const url = await uploadAsset(filePath, `${slug}/landing/models/${modelName}.${file.split(".").pop()}`);
      if (url) result.models[modelName] = url;
    }
  }

  return result;
}

// ── Default module config from plan ──────────────────────────────────────────

function defaultModuleConfigForPlan(plan: PlanTier) {
  const e = PLAN_ENTITLEMENTS[plan];
  const modules = e.modules as readonly string[];
  return {
    heroEnabled: modules.includes("hero"),
    videoEnabled: modules.includes("video"),
    galleryEnabled: modules.includes("gallery"),
    businessModelsEnabled: modules.includes("businessModels"),
    financialsEnabled: modules.includes("financials"),
    faqEnabled: modules.includes("faq"),
    brochureEnabled: modules.includes("brochure"),
    bookingEnabled: modules.includes("booking"),
    chatbotEnabled: modules.includes("chatbot"),
    nurturingEnabled: modules.includes("nurturing"),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n📦 Franchise Bulk Importer\n");

  const stats = { imported: 0, errors: 0, assetsUploaded: 0 };

  // Get default sector
  const sector = await prisma.sector.findFirst({ orderBy: { name: "asc" } });
  if (!sector) {
    console.error("✗ No sectors found. Run the main seed first.");
    process.exit(1);
  }

  // ── Franchises CSV ────────────────────────────────────────────────────────
  if (CSV_PATH && fs.existsSync(CSV_PATH)) {
    console.log(`📄 Processing franchises: ${CSV_PATH}`);
    const rows = parseCsv(CSV_PATH);
    console.log(`   ${rows.length} rows found\n`);

    for (const row of rows) {
      const slug = row.slug?.trim();
      if (!slug) {
        console.warn("  ⚠  Skipping row with no slug");
        stats.errors++;
        continue;
      }

      try {
        const plan = (row.planTier?.trim() || "BASIC") as PlanTier;

        // Upload assets if assets dir provided
        let assets: ScannedAssets = { gallery: [], models: {} };
        if (ASSETS_DIR) {
          assets = await scanAndUploadAssets(slug, ASSETS_DIR);
          stats.assetsUploaded +=
            (assets.hero ? 1 : 0) +
            (assets.logo ? 1 : 0) +
            (assets.brochure ? 1 : 0) +
            assets.gallery.length +
            Object.keys(assets.models).length;
        }

        const franchise = await prisma.franchise.upsert({
          where: { slug },
          update: {
            planTier: plan,
            published: row.published === "true",
            headline: row.headline || null,
            subheadline: row.subheadline || null,
            shortDescription: row.shortDescription || null,
            longDescription: row.longDescription || null,
            logoUrl: assets.logo || row.logoUrl || null,
            heroImageUrl: assets.hero || row.heroImageUrl || null,
            youtubeUrl: row.youtubeUrl || null,
            brochureUrl: assets.brochure || row.brochureUrl || null,
            bookingUrl: row.bookingUrl || null,
            credibilityLine: row.credibilityLine || null,
            cta1Label: row.cta1Label || null,
            cta1Url: row.cta1Url || null,
            cta2Label: row.cta2Label || null,
            cta2Url: row.cta2Url || null,
            investmentMin: Number(row.investmentMin) || 0,
            investmentMax: Number(row.investmentMax) || 0,
            ebitdaReference: row.ebitdaReference || null,
            paybackMonths: row.paybackMonths ? Number(row.paybackMonths) : null,
            royaltyInfo: row.royaltyInfo || null,
            operatorProfile: row.operatorProfile || null,
          },
          create: {
            slug,
            name: row.name || slug,
            description: row.shortDescription || row.name || slug,
            sectorId: sector.id,
            investmentMin: Number(row.investmentMin) || 0,
            investmentMax: Number(row.investmentMax) || 0,
            planTier: plan,
            published: row.published === "true",
            headline: row.headline || null,
            subheadline: row.subheadline || null,
            shortDescription: row.shortDescription || null,
            longDescription: row.longDescription || null,
            logoUrl: assets.logo || null,
            heroImageUrl: assets.hero || null,
            youtubeUrl: row.youtubeUrl || null,
            brochureUrl: assets.brochure || null,
            bookingUrl: row.bookingUrl || null,
            credibilityLine: row.credibilityLine || null,
            cta1Label: row.cta1Label || null,
            cta1Url: row.cta1Url || null,
            cta2Label: row.cta2Label || null,
            cta2Url: row.cta2Url || null,
            ebitdaReference: row.ebitdaReference || null,
            paybackMonths: row.paybackMonths ? Number(row.paybackMonths) : null,
            royaltyInfo: row.royaltyInfo || null,
            operatorProfile: row.operatorProfile || null,
          },
        });

        // Auto-create module config based on plan
        await prisma.franchiseModuleConfig.upsert({
          where: { franchiseId: franchise.id },
          update: {},
          create: { franchiseId: franchise.id, ...defaultModuleConfigForPlan(plan) },
        });

        // Gallery images from assets
        if (assets.gallery.length > 0) {
          const max = PLAN_ENTITLEMENTS[plan].maxGalleryImages;
          await prisma.franchiseMedia.deleteMany({
            where: { franchiseId: franchise.id, type: "image" },
          });
          await prisma.franchiseMedia.createMany({
            data: assets.gallery.slice(0, max).map((url, i) => ({
              franchiseId: franchise.id,
              type: "image",
              url,
              order: i,
            })),
          });
        }

        console.log(`  ✓ ${row.name || slug} (${plan})`);
        stats.imported++;
      } catch (e) {
        console.error(`  ✗ ${slug}:`, e instanceof Error ? e.message : e);
        stats.errors++;
      }
    }
  }

  // ── Business models CSV ───────────────────────────────────────────────────
  if (MODELS_PATH && fs.existsSync(MODELS_PATH)) {
    console.log(`\n📄 Processing business models: ${MODELS_PATH}`);
    const rows = parseCsv(MODELS_PATH);

    for (const row of rows) {
      const slug = row.franchiseSlug?.trim();
      if (!slug) continue;

      const franchise = await prisma.franchise.findUnique({ where: { slug } });
      if (!franchise) {
        console.warn(`  ⚠  Franchise not found: ${slug}`);
        continue;
      }

      try {
        await prisma.franchiseBusinessModel.create({
          data: {
            franchiseId: franchise.id,
            name: row.name || "Modelo",
            size: row.size || null,
            investmentMin: row.investmentMin ? Number(row.investmentMin) : null,
            investmentMax: row.investmentMax ? Number(row.investmentMax) : null,
            ebitda: row.ebitda || null,
            paybackMonths: row.paybackMonths ? Number(row.paybackMonths) : null,
            roiAnnual: row.roiAnnual ? Number(row.roiAnnual) : null,
            description: row.description || null,
            order: Number(row.order) || 0,
          },
        });
        console.log(`  ✓ Model "${row.name}" → ${slug}`);
      } catch (e) {
        console.error(`  ✗ Model for ${slug}:`, e instanceof Error ? e.message : e);
        stats.errors++;
      }
    }
  }

  // ── FAQs CSV ──────────────────────────────────────────────────────────────
  if (FAQS_PATH && fs.existsSync(FAQS_PATH)) {
    console.log(`\n📄 Processing FAQs: ${FAQS_PATH}`);
    const rows = parseCsv(FAQS_PATH);

    for (const row of rows) {
      const slug = row.franchiseSlug?.trim();
      if (!slug) continue;

      const franchise = await prisma.franchise.findUnique({ where: { slug } });
      if (!franchise) {
        console.warn(`  ⚠  Franchise not found: ${slug}`);
        continue;
      }

      try {
        await prisma.franchiseFaq.create({
          data: {
            franchiseId: franchise.id,
            question: row.question || "",
            answer: row.answer || "",
            order: Number(row.order) || 0,
          },
        });
        console.log(`  ✓ FAQ → ${slug}`);
      } catch (e) {
        console.error(`  ✗ FAQ for ${slug}:`, e instanceof Error ? e.message : e);
        stats.errors++;
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅ Import complete
   ✓ ${stats.imported} franchises imported
   ✗ ${stats.errors} errors
   ↑ ${stats.assetsUploaded} assets uploaded
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
