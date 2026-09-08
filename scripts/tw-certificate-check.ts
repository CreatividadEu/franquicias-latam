/**
 * Genera un certificado de ejemplo para revisarlo a ojo y comprobar que el
 * folio es determinista. No forma parte del build.
 *
 * Run: npx tsx scripts/tw-certificate-check.ts [ruta-de-salida.pdf]
 */
import { writeFileSync } from "node:fs";
import { buildCertificate, certificateFolio } from "../src/lib/totto-way/certificate";

async function main() {
  const out = process.argv[2] ?? "certificado-ejemplo.pdf";
  const bytes = await buildCertificate({
    userId: "user-camila",
    name: "Camila Rojas",
    roleTitle: "Asesor comercial",
    store: "Totto Andino",
    chapterId: "chapter-01",
    chapterNumber: 1,
    chapterTitle: "Introducción",
    completedAt: new Date("2026-09-07T12:00:00Z"),
    xpEarned: 620,
  });
  writeFileSync(out, bytes);

  const folio = certificateFolio("user-camila", "chapter-01", 1);
  console.log(`PDF: ${out} (${bytes.length} bytes)`);
  console.log(`Folio: ${folio}`);
  console.log(`Determinista: ${folio === certificateFolio("user-camila", "chapter-01", 1)}`);
  console.log(`Otro capítulo: ${certificateFolio("user-camila", "chapter-02", 2)}`);
  console.log(`Otra persona:  ${certificateFolio("user-andres", "chapter-01", 1)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
