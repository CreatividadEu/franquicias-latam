import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

/**
 * Repone los datos demo antes de la suite. Los specs consumen XP, validan
 * checkpoints y republican capítulos, así que sin esto la segunda ejecución
 * fallaría por estado sucio en vez de por una regresión.
 *
 * Se salta con TW_E2E_SKIP_SEED=1 cuando la base ya está preparada.
 */
export default async function globalSetup() {
  if (process.env.TW_E2E_SKIP_SEED === "1") {
    console.log("[e2e] siembra omitida (TW_E2E_SKIP_SEED=1)");
    return;
  }
  console.log("[e2e] sembrando datos demo…");
  const { stdout } = await run("npx", ["tsx", "prisma/seed-totto-way.ts"], {
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
  });
  const line = stdout.split("\n").find((row) => row.includes("Totto Way listo"));
  console.log(`[e2e] ${line?.trim() ?? "siembra completada"}`);
}
