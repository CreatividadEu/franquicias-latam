import { cookies } from "next/headers";
import { BRAND } from "@/lib/totto/caso001";
import { CornerMotif } from "@/components/totto/parts";
import s from "@/components/totto/caso001.module.css";
import { submitCaso001Passcode } from "./actions";
import { CASO001_COOKIE } from "./gate-config";

// ── Compuerta del expediente ────────────────────────────────────────────────
// El caso es confidencial: si `TOTTO_CASO001_PASSCODE` está definido, la ruta
// pide código y guarda una cookie httpOnly con alcance solo a esta ruta. Sin la
// variable, el enlace queda abierto pero sigue siendo no listado y `noindex`
// (mismo criterio que /intel/totto).

export async function isUnlocked(): Promise<boolean> {
  const expected = process.env.TOTTO_CASO001_PASSCODE;
  if (!expected) return true;
  const store = await cookies();
  return store.get(CASO001_COOKIE)?.value === expected;
}

export default function Caso001Gate({ error }: { error?: boolean }) {
  return (
    <div className={s.root}>
      <main className={s.gate}>
        <form
          action={submitCaso001Passcode}
          className={`${s.gateCard} ${s.cornerWrap}`}
        >
          <CornerMotif className={s.cornerTL} />
          <div style={{ position: "relative" }}>
            <p className={s.eyebrow}>
              {BRAND.wordmark} · {BRAND.caseTag}
            </p>
            <h1 className={s.gateTitle}>Expediente reservado</h1>
            <p className={s.note} style={{ marginTop: 10 }}>
              {BRAND.confidential}
            </p>

            <label htmlFor="code" className={s.eyebrow} style={{ display: "block", marginTop: 26 }}>
              Código de acceso
            </label>
            <input
              id="code"
              name="code"
              type="password"
              autoComplete="off"
              autoFocus
              required
              className={s.gateField}
            />
            {error ? (
              <p className={s.gateError}>Código incorrecto. Vuelva a intentarlo.</p>
            ) : null}

            <button type="submit" className={s.gateBtn}>
              Abrir el expediente
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
