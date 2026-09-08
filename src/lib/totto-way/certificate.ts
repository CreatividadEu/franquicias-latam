/**
 * Certificado de capítulo en PDF (PLAN §10). Se genera en el servidor con
 * pdf-lib, en horizontal carta y con los tokens de marca. El folio es
 * determinista: el mismo colaborador y capítulo devuelven siempre el mismo
 * número, así que volver a descargarlo no emite un certificado distinto.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

const BLACK = rgb(0, 0, 0);
const YELLOW = rgb(0.988, 0.808, 0.004); // #FCCE01
const RED = rgb(0.965, 0.188, 0.243); // #F6303E
const GREY = rgb(0.4, 0.4, 0.4);
const WHITE = rgb(1, 1, 1);

/** Carta apaisada, la misma caja que el manual impreso. */
const WIDTH = 792;
const HEIGHT = 612;

export type CertificateInput = {
  userId: string;
  name: string;
  roleTitle: string;
  store: string | null;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  completedAt: Date;
  xpEarned: number;
};

/**
 * Folio determinista. No hace falta una tabla de emisiones: el par
 * (colaborador, capítulo) ya identifica el certificado de forma única.
 */
export function certificateFolio(userId: string, chapterId: string, chapterNumber: number): string {
  const digest = createHash("sha256").update(`${userId}:${chapterId}`).digest("hex").slice(0, 8).toUpperCase();
  return `TW-C${String(chapterNumber).padStart(2, "0")}-${digest}`;
}

/**
 * Dibuja texto con espaciado entre letras. pdf-lib 1.x no expone
 * `characterSpacing`, y los eyebrows de la marca lo necesitan (.14em en
 * mayúsculas), así que se dibuja carácter a carácter.
 */
function drawTracked(
  page: PDFPage,
  text: string,
  options: { x: number; y: number; size: number; font: PDFFont; color: RGB; tracking: number },
) {
  const { x, y, size, font, color, tracking } = options;
  let cursor = x;
  for (const char of text) {
    page.drawText(char, { x: cursor, y, size, font, color });
    cursor += font.widthOfTextAtSize(char, size) + tracking;
  }
}

async function loadBrandFont(pdf: PDFDocument): Promise<PDFFont | null> {
  // Centra No1 Medium es la única licenciada (la Regular entregada es TRIAL).
  try {
    const file = path.join(process.cwd(), "public", "fonts", "totto", "CentraNo1-Medium.ttf");
    const bytes = await readFile(file);
    return await pdf.embedFont(bytes, { subset: true });
  } catch (error) {
    console.warn("[totto-way/certificate] sin Centra No1, se usa Helvetica:", error);
    return null;
  }
}

export async function buildCertificate(input: CertificateInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const brand = await loadBrandFont(pdf);
  const display = brand ?? (await pdf.embedFont(StandardFonts.HelveticaBold));
  const body = await pdf.embedFont(StandardFonts.Helvetica);

  const page = pdf.addPage([WIDTH, HEIGHT]);
  const folio = certificateFolio(input.userId, input.chapterId, input.chapterNumber);

  // Banda negra superior con el lema y el número del capítulo en amarillo.
  page.drawRectangle({ x: 0, y: HEIGHT - 132, width: WIDTH, height: 132, color: BLACK });
  drawTracked(page, "TOTTO WAY", { x: 56, y: HEIGHT - 62, size: 13, font: display, color: YELLOW, tracking: 3 });
  drawTracked(page, "PLATAFORMA DE FORMACIÓN EN TIENDA", {
    x: 56,
    y: HEIGHT - 86,
    size: 9,
    font: body,
    color: rgb(0.78, 0.78, 0.78),
    tracking: 1.6,
  });
  page.drawText(String(input.chapterNumber).padStart(2, "0"), {
    x: WIDTH - 150,
    y: HEIGHT - 112,
    size: 76,
    font: display,
    color: YELLOW,
  });

  // Cuerpo.
  drawTracked(page, "CERTIFICADO DE CAPÍTULO", { x: 56, y: HEIGHT - 190, size: 11, font: display, color: RED, tracking: 2.4 });
  page.drawText(input.name, { x: 56, y: HEIGHT - 244, size: 40, font: display, color: BLACK });

  const subtitle = [input.roleTitle, input.store].filter(Boolean).join(" · ");
  page.drawText(subtitle, { x: 56, y: HEIGHT - 272, size: 12, font: body, color: GREY });

  page.drawText("completó el capítulo", { x: 56, y: HEIGHT - 322, size: 13, font: body, color: GREY });
  page.drawText(`${String(input.chapterNumber).padStart(2, "0")} · ${input.chapterTitle}`, {
    x: 56,
    y: HEIGHT - 358,
    size: 26,
    font: display,
    color: BLACK,
  });

  // Banda amarilla con la fecha y el XP: el equivalente del "Traducción simple".
  const dateLabel = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "long", year: "numeric" }).format(input.completedAt);
  page.drawRectangle({ x: 56, y: 150, width: WIDTH - 112, height: 58, color: YELLOW });
  page.drawText(dateLabel, { x: 76, y: 180, size: 12, font: body, color: BLACK });
  page.drawText(`${input.xpEarned.toLocaleString("es-CO")} XP`, { x: 76, y: 162, size: 12, font: display, color: BLACK });
  page.drawText("¿LISTOS? ¡VAMOS!", { x: WIDTH - 246, y: 170, size: 20, font: display, color: BLACK });

  // Pie con el folio, que es lo que hace verificable el documento.
  page.drawRectangle({ x: 0, y: 0, width: WIDTH, height: 46, color: BLACK });
  drawTracked(page, `FOLIO ${folio}`, { x: 56, y: 18, size: 10, font: display, color: WHITE, tracking: 1.6 });
  page.drawText("Verificable con el equipo de formación de TOTTO", {
    x: WIDTH - 320,
    y: 18,
    size: 9,
    font: body,
    color: rgb(0.68, 0.68, 0.68),
  });

  pdf.setTitle(`Certificado ${folio} · ${input.chapterTitle}`);
  pdf.setAuthor("Totto Way");
  pdf.setSubject(`Capítulo ${input.chapterNumber} · ${input.chapterTitle}`);
  pdf.setProducer("Totto Way · Franquicias LATAM");

  return pdf.save();
}
