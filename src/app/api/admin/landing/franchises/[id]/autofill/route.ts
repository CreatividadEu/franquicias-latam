import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  EXTRACTION_TOOL_SCHEMA,
  validateExtraction,
} from "@/lib/landing-extraction-schema";
import {
  getSupabaseAdminClient,
  getFranchiseStorageBucket,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `Eres un extractor de datos para landing pages de franquicias en LATAM.

Recibes dos PDFs de una franquicia:
1. Definicion estrategica (marca, propuesta de valor, mercado, modelo de negocio)
2. Viabilidad financiera (inversion, retorno, EBITDA, payback)

Tu trabajo: extraer SOLO los campos que aparecen LITERAL o claramente derivables de los documentos.

Reglas estrictas:
- NO inventes datos. Si un campo no aparece, omitelo del output (no lo incluyas en el JSON).
- Cifras financieras: usa exactamente los numeros del documento. Si la moneda no es USD, convierte usando el tipo de cambio implicito en el documento (si lo hay) o omite el campo.
- Respeta los maxLength de cada campo. Acortar si es necesario sin perder sentido.
- Para campos de texto: usa el tono profesional B2B en español. Sin emojis. Sin nombre de la marca dentro de headlines (eso va en el campo 'name').
- Modelos de negocio: extrae solo si los documentos describen formatos diferenciados (Express vs Standalone, etc).
- FAQs: solo crea preguntas/respuestas que el documento responde directamente. No inventes preguntas.

Devuelves el resultado SIEMPRE invocando la herramienta extract_landing_data una sola vez.`;

async function downloadPdfAsBase64(storagePath: string, label: string): Promise<string> {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase storage no disponible");
  }
  const bucket = getFranchiseStorageBucket();
  const { data, error } = await client.storage.from(bucket).download(storagePath);
  if (error || !data) {
    throw new Error(`No se pudo descargar el PDF '${label}': ${error?.message ?? "desconocido"}`);
  }
  const arrayBuffer = await data.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PDF_SIZE_BYTES) {
    throw new Error(`El PDF '${label}' supera 25MB`);
  }
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada en el servidor" },
      { status: 500 }
    );
  }

  const { id: franchiseId } = await params;

  const franchise = await prisma.franchise.findUnique({
    where: { id: franchiseId },
    select: { id: true },
  });
  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  let body: { strategicPath?: unknown; financialPath?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body invalido. Se esperaba JSON { strategicPath, financialPath }" },
      { status: 400 }
    );
  }

  const strategicPath = typeof body.strategicPath === "string" ? body.strategicPath : "";
  const financialPath = typeof body.financialPath === "string" ? body.financialPath : "";

  if (!strategicPath || !financialPath) {
    return NextResponse.json(
      { error: "Faltan strategicPath o financialPath en el body" },
      { status: 400 }
    );
  }

  const expectedPrefix = `dossiers/${franchiseId}/`;
  if (!strategicPath.startsWith(expectedPrefix) || !financialPath.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: "storagePath no corresponde a esta franquicia" },
      { status: 400 }
    );
  }

  let strategicBase64: string;
  let financialBase64: string;
  try {
    [strategicBase64, financialBase64] = await Promise.all([
      downloadPdfAsBase64(strategicPath, "estrategica"),
      downloadPdfAsBase64(financialPath, "financiera"),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error descargando PDFs";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "extract_landing_data",
          description:
            "Devuelve los datos extraidos de los dos PDFs para rellenar la landing page. Omite cualquier campo que no aparezca claramente en los documentos.",
          input_schema: EXTRACTION_TOOL_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "extract_landing_data" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: strategicBase64,
              },
              title: "Definicion Estrategica",
            },
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: financialBase64,
              },
              title: "Viabilidad Financiera",
            },
            {
              type: "text",
              text: "Extrae los datos relevantes de ambos documentos para rellenar la landing page de esta franquicia. Sigue las reglas del system prompt. Invoca extract_landing_data una sola vez.",
            },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error("[autofill] Anthropic API error", error.status, error.message);
      return NextResponse.json(
        { error: `Error de Claude API (${error.status}): ${error.message}` },
        { status: 502 }
      );
    }
    console.error("[autofill] unexpected error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      { error: "Claude no devolvio el tool_use esperado" },
      { status: 502 }
    );
  }

  const extracted = validateExtraction(toolUse.input);

  // Apply everything atomically: franchise fields + business models + FAQs
  const heroUpdate: Record<string, string | number | null> = {};
  if (extracted.hero) {
    for (const [k, v] of Object.entries(extracted.hero)) {
      if (v !== undefined && v !== null) heroUpdate[k] = v;
    }
  }
  const financialUpdate: Record<string, string | number | null> = {};
  if (extracted.financials) {
    for (const [k, v] of Object.entries(extracted.financials)) {
      if (v !== undefined && v !== null) financialUpdate[k] = v;
    }
  }
  const franchiseData = { ...heroUpdate, ...financialUpdate };

  const modelsToCreate = (extracted.businessModels ?? []).map((m, i) => ({
    franchiseId,
    name: typeof m.name === "string" ? m.name : "Modelo",
    size: typeof m.size === "string" ? m.size : null,
    investmentMin: typeof m.investmentMin === "number" ? m.investmentMin : null,
    investmentMax: typeof m.investmentMax === "number" ? m.investmentMax : null,
    ebitda: typeof m.ebitda === "string" ? m.ebitda : null,
    paybackMonths: typeof m.paybackMonths === "number" ? m.paybackMonths : null,
    roiAnnual: typeof m.roiAnnual === "number" ? m.roiAnnual : null,
    description: typeof m.description === "string" ? m.description : null,
    order: i,
  }));

  const faqsToCreate = (extracted.faqs ?? [])
    .filter((f) => f.question && f.answer)
    .map((f, i) => ({
      franchiseId,
      question: f.question as string,
      answer: f.answer as string,
      order: i,
    }));

  try {
    await prisma.$transaction([
      ...(Object.keys(franchiseData).length > 0
        ? [prisma.franchise.update({ where: { id: franchiseId }, data: franchiseData })]
        : []),
      ...(modelsToCreate.length > 0
        ? [prisma.franchiseBusinessModel.createMany({ data: modelsToCreate })]
        : []),
      ...(faqsToCreate.length > 0
        ? [prisma.franchiseFaq.createMany({ data: faqsToCreate })]
        : []),
    ]);
  } catch (error) {
    console.error("[autofill] DB write failed", error);
    return NextResponse.json(
      {
        error: "Error guardando los datos extraídos en la base de datos",
        extracted,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    applied: {
      fields: Object.keys(franchiseData).length,
      models: modelsToCreate.length,
      faqs: faqsToCreate.length,
    },
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  });
}
