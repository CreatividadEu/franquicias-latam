import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  EXTRACTION_TOOL_SCHEMA,
  validateExtraction,
} from "@/lib/landing-extraction-schema";

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

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Body invalido. Se esperaba multipart/form-data" },
      { status: 400 }
    );
  }

  const strategic = formData.get("strategic");
  const financial = formData.get("financial");

  if (!(strategic instanceof File) || !(financial instanceof File)) {
    return NextResponse.json(
      { error: "Faltan archivos. Adjunta 'strategic' y 'financial' como PDFs" },
      { status: 400 }
    );
  }

  for (const [label, file] of [["strategic", strategic], ["financial", financial]] as const) {
    if (!isPdf(file)) {
      return NextResponse.json(
        { error: `El archivo '${label}' debe ser PDF` },
        { status: 400 }
      );
    }
    if (file.size <= 0) {
      return NextResponse.json(
        { error: `El archivo '${label}' esta vacio` },
        { status: 400 }
      );
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: `El archivo '${label}' supera 25MB` },
        { status: 400 }
      );
    }
  }

  const [strategicBase64, financialBase64] = await Promise.all([
    fileToBase64(strategic),
    fileToBase64(financial),
  ]);

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

  return NextResponse.json({
    extracted,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  });
}
