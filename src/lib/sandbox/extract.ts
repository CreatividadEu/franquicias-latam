/**
 * Extracción de contenido por tipo de archivo (§3). Devuelve bloques listos
 * para el mensaje a Claude: los PDF e imágenes van nativos (documento / visión,
 * como la ruta de autofill del repo); DOCX pasa por mammoth, XLSX/CSV por
 * xlsx y el texto plano tal cual. Sin red, sin estado.
 */
import { createHash } from "crypto";
import type Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export type AssetHandler = "pdf" | "image" | "docx" | "xlsx" | "text";

export const ASSET_SIZE_LIMITS: Record<AssetHandler, number> = {
  pdf: 25 * 1024 * 1024,
  image: 5 * 1024 * 1024,
  docx: 10 * 1024 * 1024,
  xlsx: 10 * 1024 * 1024,
  text: 5 * 1024 * 1024,
};

/** Tope de caracteres de texto por documento (~20k tokens). */
export const TEXT_CHAR_LIMIT = 80_000;

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);
const TEXT_TYPES = new Set(["text/plain", "text/markdown", "text/csv", "application/json"]);

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".docx",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".md",
  ".json",
];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

/** Decide el handler por MIME y, si el navegador no lo manda, por extensión. */
export function classifyAsset(mime: string, name: string): AssetHandler | null {
  const m = (mime || "").toLowerCase();
  const ext = extensionOf(name);
  if (m === "application/pdf" || ext === ".pdf") return "pdf";
  if (IMAGE_TYPES.has(m) || [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) return "image";
  if (m === DOCX_TYPE || ext === ".docx") return "docx";
  if (XLSX_TYPES.has(m) || ext === ".xlsx" || ext === ".xls") return "xlsx";
  if (TEXT_TYPES.has(m) || [".txt", ".md", ".csv", ".json"].includes(ext)) return "text";
  return null;
}

export function normalizeMime(mime: string, name: string): string {
  const handler = classifyAsset(mime, name);
  const ext = extensionOf(name);
  if (handler === "pdf") return "application/pdf";
  if (handler === "image") {
    if (IMAGE_TYPES.has(mime.toLowerCase())) return mime.toLowerCase();
    return ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  }
  if (handler === "docx") return DOCX_TYPE;
  if (handler === "xlsx") return ext === ".xls" ? "application/vnd.ms-excel" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (handler === "text") return ext === ".csv" ? "text/csv" : ext === ".md" ? "text/markdown" : ext === ".json" ? "application/json" : "text/plain";
  return mime || "application/octet-stream";
}

export function validateAssetSize(handler: AssetHandler, size: number): string | null {
  if (!Number.isFinite(size) || size <= 0) return "El archivo está vacío";
  const limit = ASSET_SIZE_LIMITS[handler];
  if (size > limit) return `Supera el máximo de ${Math.round(limit / (1024 * 1024))} MB para este tipo`;
  return null;
}

export type AssetContent = {
  blocks: Anthropic.ContentBlockParam[];
  handler: AssetHandler;
  /** sha256 del contenido: entra en la clave de cache de IA. */
  contentHash: string;
  truncated: boolean;
  chars: number;
};

export function sha256(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function textBlock(name: string, text: string, truncated: boolean): Anthropic.TextBlockParam {
  const header = `### Documento: ${name}${truncated ? " (truncado)" : ""}\n\n`;
  return { type: "text", text: header + text };
}

function capText(text: string): { text: string; truncated: boolean } {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (clean.length <= TEXT_CHAR_LIMIT) return { text: clean, truncated: false };
  return { text: clean.slice(0, TEXT_CHAR_LIMIT) + "\n\n[… documento truncado …]", truncated: true };
}

/** Construye los bloques de contenido para Claude a partir del archivo. */
export async function buildAssetContent(buffer: Buffer, mime: string, name: string): Promise<AssetContent> {
  const handler = classifyAsset(mime, name);
  if (!handler) throw new Error(`Tipo de archivo no soportado: ${mime || name}`);
  const contentHash = sha256(buffer);

  if (handler === "pdf") {
    return {
      handler,
      contentHash,
      truncated: false,
      chars: 0,
      blocks: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") },
          title: name,
        },
      ],
    };
  }

  if (handler === "image") {
    const media = normalizeMime(mime, name) as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
    return {
      handler,
      contentHash,
      truncated: false,
      chars: 0,
      blocks: [
        { type: "text", text: `### Imagen: ${name}` },
        { type: "image", source: { type: "base64", media_type: media, data: buffer.toString("base64") } },
      ],
    };
  }

  let raw = "";
  if (handler === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    raw = result.value;
  } else if (handler === "xlsx") {
    const wb = XLSX.read(buffer, { type: "buffer" });
    raw = wb.SheetNames.map((sheet) => `## Hoja: ${sheet}\n${XLSX.utils.sheet_to_csv(wb.Sheets[sheet])}`).join("\n\n");
  } else {
    raw = buffer.toString("utf8");
  }

  const { text, truncated } = capText(raw);
  if (!text) throw new Error("El documento no contiene texto legible");
  return {
    handler,
    contentHash,
    truncated,
    chars: text.length,
    blocks: [textBlock(name, text, truncated)],
  };
}
