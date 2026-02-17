import Link from "next/link";
import type { ExperienceLevel, InvestmentRange } from "@prisma/client";
import { findMatches } from "@/lib/matching";
import { ResultsPageContent } from "@/components/results/ResultsPageContent";

export const metadata = {
  title: "Resultados - Franquicias LATAM",
  description: "Resultados de franquicias recomendadas para tu perfil",
};

const INVESTMENT_RANGE_VALUES: ReadonlySet<string> = new Set([
  "RANGE_50K_100K",
  "RANGE_100K_200K",
  "RANGE_200K_PLUS",
]);

const EXPERIENCE_LEVEL_VALUES: ReadonlySet<string> = new Set([
  "INVERSOR",
  "OPERACIONES",
  "VENTAS",
  "OTRO",
]);

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  value: string | string[] | undefined
): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }
  return null;
}

function parseSectors(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((sector) => sector.trim())
    .filter((sector) => sector.length > 0);
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;

  const sectors = parseSectors(getSingleParam(resolvedSearchParams.sectors));
  const investmentRangeParam = getSingleParam(resolvedSearchParams.investmentRange);
  const countryId = getSingleParam(resolvedSearchParams.countryId)?.trim() ?? "";
  const experienceLevelParam = getSingleParam(resolvedSearchParams.experienceLevel);

  const investmentRange = investmentRangeParam as InvestmentRange | null;
  const experienceLevel = experienceLevelParam as ExperienceLevel | null;
  const hasValidCriteria =
    sectors.length > 0 &&
    !!countryId &&
    !!investmentRange &&
    INVESTMENT_RANGE_VALUES.has(investmentRange) &&
    !!experienceLevel &&
    EXPERIENCE_LEVEL_VALUES.has(experienceLevel);

  if (!hasValidCriteria) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/70 bg-white/70 p-8 text-center shadow-[0_24px_65px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            No hay resultados para mostrar
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Completa el quiz para generar recomendaciones de franquicias.
          </p>
          <Link
            href="/quiz"
            className="mt-6 inline-flex rounded-xl bg-[#2F5BFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#264BDB]"
          >
            Ir al quiz
          </Link>
        </div>
      </main>
    );
  }

  const results = await findMatches({
    sectors,
    investmentRange,
    countryId,
    experienceLevel,
  });

  const canonicalParams = new URLSearchParams({
    sectors: sectors.join(","),
    investmentRange,
    countryId,
    experienceLevel,
  });
  const resultsUrl = `/results?${canonicalParams.toString()}`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <ResultsPageContent results={results} resultsUrl={resultsUrl} />
      </div>
    </main>
  );
}
