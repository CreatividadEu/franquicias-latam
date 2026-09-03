import { NextResponse } from "next/server";
import { jsonError, requireAdminApi, unauthorized } from "@/lib/sandbox/admin";
import { PipelineError, runAssetExtraction } from "@/lib/sandbox/pipeline";

export const runtime = "nodejs";
export const maxDuration = 120;

type Ctx = { params: Promise<{ id: string; assetId: string }> };

/** POST — extrae un asset con Claude (§3). `?force=1` ignora DONE y la cache. */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id, assetId } = await params;
  const force = new URL(req.url).searchParams.get("force") === "1";
  try {
    const result = await runAssetExtraction(id, assetId, { force });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PipelineError) return jsonError(error.message, error.status);
    console.error("[admin/sandbox] extract", error);
    return jsonError(error instanceof Error ? error.message : "Error extrayendo el archivo", 500);
  }
}
