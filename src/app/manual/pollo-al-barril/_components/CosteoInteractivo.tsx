"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIAS,
  PIEZAS,
  PROMOS,
  SETS,
  colorSemaforo,
  costOf,
  costosPorDefecto,
  money,
  netPVP,
  pct,
  qtyTxt,
  semaforo,
  type CategoriaId,
  type Costos,
  type PiezaId,
} from "../_lib/costeo";

const IDS = Object.keys(PIEZAS) as PiezaId[];

// Los costos viven en la cuenta, no en el navegador: el operador entra desde
// donde sea y encuentra lo último que guardó. El navegador queda de respaldo
// para no perder nada si la red falla a mitad de una edición.
const STORAGE_KEY = "barril:costeo:v1";

const ESPERA_GUARDADO_MS = 900;

type Guardado = { costos: Partial<Record<PiezaId, number>>; conIVA?: boolean };

export type EstadoInicial = {
  costos: Record<string, number>;
  conIVA: boolean;
  actualizado: string;
} | null;

type Estado = "guardado" | "guardando" | "local" | "sesion";

/** Dinero con dos decimales, salvo que el operador haya escrito más. */
const fmt = (n: number) => ((String(n).split(".")[1]?.length ?? 0) > 2 ? String(n) : n.toFixed(2));

const textoDe = (costos: Costos) =>
  Object.fromEntries(IDS.map((k) => [k, fmt(costos[k])])) as Record<PiezaId, string>;

const textoPorDefecto = () => textoDe(costosPorDefecto());

/** Lee lo guardado quedándose solo con piezas y montos que hoy siguen siendo
 *  válidos: un localStorage manipulado o de otra versión no debe tumbar la página. */
function filtrarCostos(crudos: Record<string, unknown> | undefined) {
  const costos: Partial<Record<PiezaId, number>> = {};
  for (const id of IDS) {
    const n = crudos?.[id];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) costos[id] = n;
  }
  return costos;
}

function leerGuardado(): Guardado | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const datos = JSON.parse(raw) as { costos?: Record<string, unknown>; conIVA?: unknown };
    return { costos: filtrarCostos(datos?.costos), conIVA: datos?.conIVA === true };
  } catch {
    return null;
  }
}

/** ¿Hay algo escrito aquí que no sean los valores de fábrica? */
const hayCambios = (costos: Partial<Record<PiezaId, number>>) => {
  const base = costosPorDefecto();
  return IDS.some((id) => costos[id] !== undefined && costos[id] !== base[id]);
};

/** Grupos de la caja de piezas, en el orden en que están declarados. */
const GRUPOS = IDS.reduce<{ g: string; ids: PiezaId[] }[]>((acc, id) => {
  const g = PIEZAS[id].g;
  const ultimo = acc[acc.length - 1];
  if (ultimo && ultimo.g === g) ultimo.ids.push(id);
  else acc.push({ g, ids: [id] });
  return acc;
}, []);

export default function CosteoInteractivo({
  slug,
  usuario,
  inicial,
}: {
  slug: string;
  usuario: string;
  inicial: EstadoInicial;
}) {
  // Lo guardado llega ya resuelto desde el servidor, así que la primera pintura
  // muestra los costos del cliente — no hay parpadeo de valores por defecto.
  const base = useMemo(() => {
    const costos = { ...costosPorDefecto(), ...filtrarCostos(inicial?.costos) };
    return { costos, conIVA: inicial?.conIVA === true };
  }, [inicial]);

  // Dos estados en paralelo: lo que el operador tiene escrito en cada campo y
  // el último costo válido. Así, borrar el campo para reescribirlo no manda
  // todos los sets a cero mientras se teclea.
  const [texto, setTexto] = useState<Record<PiezaId, string>>(() => textoDe(base.costos));
  const [costos, setCostos] = useState<Costos>(base.costos);
  const [conIVA, setConIVA] = useState(base.conIVA);
  const [estado, setEstado] = useState<Estado>("guardado");
  // Solo se guarda lo que el operador tocó: abrir el manual no debe escribir
  // en la cuenta ni mover la fecha de "última edición".
  const [sucio, setSucio] = useState(false);
  // Hasta terminar de arrancar no se guarda nada: si no, el primer render
  // dispararía un guardado que no corresponde a ninguna edición.
  const [listo, setListo] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Rescate de la versión anterior del manual, que guardaba solo en este
    // navegador: si el servidor aún no tiene nada y aquí quedaron costos
    // editados, se adoptan y en el primer guardado suben a la cuenta.
    if (!inicial) {
      const local = leerGuardado();
      if (local && hayCambios(local.costos)) {
        const rescatados = { ...costosPorDefecto(), ...local.costos };
        setCostos(rescatados);
        setTexto(textoDe(rescatados));
        setConIVA(local.conIVA === true);
        setSucio(true);
        setEstado("guardando");
      }
    }
    setListo(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [inicial]);

  // Guardado con espera: se manda al servidor cuando el operador deja de
  // teclear, no en cada tecla. El navegador se escribe siempre y al instante,
  // para que un fallo de red no se lleve la edición por delante.
  useEffect(() => {
    if (!listo || !sucio) return;

    const carga = { costos, conIVA };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carga));
    } catch {}

    const cancelar = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/manual/${slug}/estado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carga),
          signal: cancelar.signal,
        });
        if (res.status === 401) setEstado("sesion");
        else setEstado(res.ok ? "guardado" : "local");
      } catch {
        if (!cancelar.signal.aborted) setEstado("local");
      }
    }, ESPERA_GUARDADO_MS);

    return () => {
      clearTimeout(t);
      cancelar.abort();
    };
  }, [costos, conIVA, listo, sucio, slug]);

  async function salir() {
    try {
      await fetch(`/api/manual/${slug}/auth`, { method: "DELETE" });
    } catch {}
    window.location.reload();
  }

  /** Toda edición del operador pasa por aquí: marca que hay algo que guardar. */
  const marcarEditado = () => {
    setSucio(true);
    setEstado("guardando");
  };

  const editar = (id: PiezaId, valor: string) => {
    setTexto((t) => ({ ...t, [id]: valor }));
    const n = Number.parseFloat(valor);
    if (Number.isFinite(n) && n >= 0) {
      setCostos((c) => ({ ...c, [id]: n }));
      marcarEditado();
    }
  };

  const cambiarIVA = (valor: boolean) => {
    setConIVA(valor);
    marcarEditado();
  };

  const restaurar = () => {
    setTexto(textoPorDefecto());
    setCostos(costosPorDefecto());
    setConIVA(false);
    marcarEditado();
  };

  const categorias = useMemo(
    () =>
      (Object.keys(CATEGORIAS) as CategoriaId[]).map((cid) => {
        const cat = CATEGORIAS[cid];
        const items = SETS.filter((s) => s.cat === cid).map((s) => {
          const costo = costOf(s.parts, costos);
          const neto = netPVP(s.pvp, conIVA);
          const fc = (costo / neto) * 100;
          const banda = s.band ?? cat.band;
          return { set: s, costo, fc, margen: neto - costo, estado: semaforo(fc, banda) };
        });
        const promedio = items.reduce((t, i) => t + i.fc, 0) / items.length;
        return { cid, cat, items, promedio };
      }),
    [costos, conIVA],
  );

  const AVISO: Record<Estado, string> = {
    guardado: "GUARDADO EN TU CUENTA",
    guardando: "GUARDANDO…",
    local: "SIN CONEXIÓN — GUARDADO EN ESTE NAVEGADOR",
    sesion: "TU SESIÓN VENCIÓ — VUELVE A ENTRAR",
  };

  return (
    <>
      <div className="sesion">
        <span className="quien">Sesión de {usuario}</span>
        <span className={`estado-guardado ${estado === "guardado" || estado === "guardando" ? "" : "error"}`}>
          {AVISO[estado]}
        </span>
        <button type="button" className="salir" onClick={salir}>
          Salir
        </button>
      </div>

      <section id="piezas">
        <h2>La caja de piezas</h2>
        <p className="lede">
          Costos unitarios de todos los insumos. Edita cualquiera y los {SETS.length} sets se
          recalculan al instante. Los gramajes por plato son supuestos típicos de asadero:
          reemplázalos con tu ficha real.
        </p>

        <div className="legend">
          <span className="pill real">FACTURA — dato real</span>
          <span className="pill est">ESTIMADO — ajústalo</span>
          <button type="button" className="reset" onClick={restaurar}>
            Restaurar valores
          </button>
        </div>

        {GRUPOS.map(({ g, ids }) => (
          <div className="pgrupo" key={g}>
            <h3>{g}</h3>
            <div className="pgrid">
              {ids.map((id) => {
                const pieza = PIEZAS[id];
                const real = "real" in pieza && pieza.real;
                return (
                  <div className="pieza" key={id}>
                    <div className="pn">
                      <label htmlFor={`pieza-${id}`}>{pieza.n}</label>
                    </div>
                    <div className="pr">
                      <input
                        id={`pieza-${id}`}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={texto[id]}
                        onChange={(e) => editar(id, e.target.value)}
                      />
                      <span className="u">${"/"}{pieza.u}</span>
                      <span className={`tag ${real ? "real" : "est"}`}>
                        {real ? "FACTURA" : "ESTIMADO"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section id="sets">
        <h2>Los sets: el menú costeado</h2>
        <p className="lede">
          Toca cualquier set para ver sus piezas, como la lista de partes de cada paso. El semáforo
          compara contra la banda objetivo de su categoría.
        </p>

        <div className="ivarow">
          <label className="switch">
            <input
              type="checkbox"
              checked={conIVA}
              onChange={(e) => cambiarIVA(e.target.checked)}
            />
            Facturo con IVA 15% → costear sobre PVP ÷ 1,15
          </label>
        </div>

        {categorias.map(({ cid, cat, items, promedio }) => (
          <div className="cat" key={cid}>
            <div className="cathead" style={{ background: cat.color }}>
              <h3>{cat.n}</h3>
              <span className="avg">
                banda {cat.band[0]}–{cat.band[1]}% — promedio {pct(promedio)}
              </span>
              <span className="why">{cat.why}</span>
            </div>

            {items.map(({ set, costo, fc, margen, estado }) => (
              <details
                className="set"
                key={set.n}
                style={{ ["--catc" as string]: cat.color }}
              >
                <summary>
                  <span className="sname">{set.n}</span>
                  <span className="spvp">PVP {money(set.pvp)}</span>
                  <span className="scost">costo {money(costo)}</span>
                  <span className="smarg">margen {money(margen)}</span>
                  <span className={`chip ${estado}`}>{pct(fc)}</span>
                  <span className="bar">
                    <i
                      style={{
                        width: `${Math.min(fc, 100)}%`,
                        background: colorSemaforo(estado),
                      }}
                    />
                  </span>
                </summary>
                <div className="parts">
                  <table>
                    <tbody>
                      {set.parts.map(([id, q]) => (
                        <tr key={id}>
                          <td>
                            <span className="qty">{qtyTxt(q, PIEZAS[id].u)}</span>
                          </td>
                          <td>{PIEZAS[id].n}</td>
                          <td className="num">{money(costos[id] * q)}</td>
                        </tr>
                      ))}
                      <tr className="tot">
                        <td />
                        <td>Costo del set</td>
                        <td className="num">{money(costo)}</td>
                      </tr>
                    </tbody>
                  </table>
                  {set.note ? <div className="setnote">{set.note}</div> : null}
                </div>
              </details>
            ))}
          </div>
        ))}
      </section>

      <section id="promos">
        <h2>Promos: el precio del regalo</h2>
        <p className="lede">
          Una promo se costea al costo de lo que regalas, contra el ticket que exige — nunca al
          precio de carta del regalo.
        </p>

        {PROMOS.map((promo) => {
          if (promo.tipo === "set") {
            const costo = costOf(promo.parts, costos);
            const neto = netPVP(promo.pvp, conIVA);
            return (
              <div className="brick promo" key={promo.n}>
                <h4>{promo.n}</h4>
                <div className="nums">
                  <span>costo {money(costo)}</span>
                  <span>food cost {pct((costo / neto) * 100)}</span>
                  <span>margen {money(neto - costo)}</span>
                </div>
                <p>{promo.copy}</p>
              </div>
            );
          }

          const regalo = costOf(promo.regalo, costos);
          let efectivo = "costo por grupo, no por plato";
          if (promo.ticket) {
            const [min, max] = promo.ticket;
            const alto = (regalo / min) * 100;
            const bajo = (regalo / max) * 100;
            efectivo =
              min === max
                ? `descuento efectivo ${pct(alto)}`
                : `descuento efectivo ${pct(bajo)}–${pct(alto)}`;
          }

          return (
            <div className="brick promo" key={promo.n}>
              <h4>{promo.n}</h4>
              <div className="nums">
                <span>regalo {money(regalo)}</span>
                <span>condición: {promo.cond}</span>
                <span>{efectivo}</span>
              </div>
              <p>{promo.copy}</p>
            </div>
          );
        })}
      </section>
    </>
  );
}
