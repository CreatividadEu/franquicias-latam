/**
 * Comprobación manual de la recuperación del Asistente contra la base de
 * datos: reindexa y lanza preguntas reales de tienda para ver qué fragmentos
 * devuelve el full-text en español.
 *
 * Run: npx tsx scripts/tw-kb-check.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { reindexFranchise, searchKnowledge } from "../src/lib/totto-way/assistant/retrieval";

const prisma = new PrismaClient();

const QUESTIONS = [
  "como marco mi jornada en geovictoria",
  "que hago si suena la antena",
  "cuantas herramientas tiene el ecosistema SER",
  "cuanto puedo ahorrar en el fondo de empleados",
  "quien fundo totto",
  "cual es la politica de vacaciones en marte",
];

async function main() {
  const franchise = await prisma.franchise.findFirstOrThrow({ where: { slug: "totto" }, select: { id: true } });
  const chunks = await reindexFranchise(franchise.id);
  console.log(`Indexados ${chunks} fragmentos\n`);

  for (const question of QUESTIONS) {
    const hits = await searchKnowledge(franchise.id, question, 3);
    console.log(`? ${question}`);
    if (hits.length === 0) {
      console.log("  (sin resultados — el Asistente dirá que no está en el manual)\n");
      continue;
    }
    for (const hit of hits) console.log(`  · ${hit.title}  [${hit.rank.toFixed(4)}]`);
    console.log();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
