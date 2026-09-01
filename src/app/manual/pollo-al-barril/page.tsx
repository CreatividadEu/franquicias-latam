import type { Metadata, Viewport } from "next";
import CosteoInteractivo from "./_components/CosteoInteractivo";
import { PIEZAS, PROMOS, REGLAS, SETS } from "./_lib/costeo";

export const metadata: Metadata = {
  title: "Manual de Costeo — Pollo al Barril | Franquicias LATAM",
  description:
    "Manual de costeo del menú de Pollo al Barril (Ambato, Ecuador): costo unitario por insumo, food cost de cada plato y el precio real de cada promo. Documento de trabajo del cliente.",
  // Lleva la factura de compra y el costeo completo del menú: se comparte por
  // enlace, no se indexa.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#D01012",
  colorScheme: "light",
};

const CAPITULOS = [
  ["#metodo", "1. El método"],
  ["#piezas", "2. Caja de piezas"],
  ["#sets", "3. Los sets"],
  ["#promos", "4. Promos"],
  ["#reglas", "5. Reglas de oro"],
] as const;

// Los seis pasos son una secuencia real: cada uno necesita el anterior
// resuelto, y por eso van numerados.
const PASOS = [
  {
    t: "Abre la caja: junta las facturas",
    p: (
      <>
        El costo vive en la factura, no en la memoria. La tuya dice pollo a $3,26/kg de lista, pero
        con descuento pagaste $2,90/kg. Costear a precio de lista infla tu costo 11%. Y en la misma
        factura el descuento fue 9,79% en una línea y 13,84% en otra: el costo real se negocia.
      </>
    ),
    callout: "Regla: siempre costo neto (con descuento, sin IVA recuperable).",
  },
  {
    t: "Clasifica las piezas: costo unitario",
    p: (
      <>
        Convierte cada compra a la unidad en que la usas: $/kg, $/unidad, $/litro. De tu factura:
        $723,83 netos ÷ 100 pollos = <strong>$7,24 por pollo de 2,49 kg</strong>; aceite a $1,93/L.
        Si algún día vendes por peso cocido, suma la merma: el pollo pierde 25–30% en el barril.
      </>
    ),
    callout: "$577,02 + $235,96 − $89,15 de descuento = $723,83 → $7,24/pollo",
  },
  {
    t: "Escribe el instructivo: la ficha técnica",
    p: (
      <>
        Cada plato con gramajes fijos, por escrito, pegados en cocina. Sin ficha no hay costeo: hay
        adivinanza. Y sin estándar no hay segundo local — la ficha es el plano que hace replicable
        el negocio.
      </>
    ),
  },
  {
    t: "Arma el set: costo del plato",
    p: (
      <>
        Piezas × cantidad = costo del plato. Solo entra lo que se come, más el empaque cuando lo
        regalas. Gas, arriendo y sueldos van al estado de resultados, nunca a la ficha: mezclar los
        dos mundos rompe el termómetro.
      </>
    ),
  },
  {
    t: "Compara con la caja: food cost %",
    p: (
      <>
        Food cost = costo del plato ÷ precio de venta. Si facturas con IVA, primero divide el precio
        entre 1,15: ese 15% nunca fue tuyo. Y no comas porcentajes — mira también los dólares de
        margen que deja cada set.
      </>
    ),
    callout: "FC% = costo ÷ PVP (neto de IVA si facturas)",
  },
  {
    t: "Arma la vitrina: ingeniería de menú",
    p: (
      <>
        No todos los sets ganan igual, y está bien. El pollo ancla el tráfico con food cost cerca
        del 50%; papas, arroz, consomé y bebidas arman el margen. El precio no sale de costo +
        margen fijo: sale del rol que juega cada plato en la vitrina.
      </>
    ),
  },
];

export default function ManualPolloAlBarrilPage() {
  const piezas = Object.keys(PIEZAS).length;

  return (
    <>
      <header className="cover">
        <div className="studs" />
        <div className="wrap">
          <span className="kicker">Set 2026 — Ambato, Ecuador</span>
          <h1>
            MANUAL DE COSTEO
            <br />
            <span>POLLO AL BARRIL</span>
          </h1>
          <p className="sub">
            Cada plato es un set. Cada ingrediente, una pieza. Costear es armar el set, pieza por
            pieza, y compararlo con el precio de la caja.
          </p>
          <div className="badges">
            <span className="badge">{piezas} PIEZAS</span>
            <span className="badge">{SETS.length} SETS</span>
            <span className="badge">{PROMOS.length} PROMOS</span>
            <span className="badge">DIFICULTAD ★★☆</span>
            <span className="badge">EDAD 8+</span>
          </div>
        </div>
      </header>

      <nav className="chapters" aria-label="Capítulos">
        <div className="wrap">
          {CAPITULOS.map(([href, label]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="wrap">
        <section id="metodo">
          <h2>El método en 6 pasos</h2>
          <p className="lede">
            Como todo buen manual: primero las instrucciones, después las piezas, y al final armas
            todos los sets. Los números azules salen de tu factura real de Skandinar (28/08/2026);
            los amarillos son estimados que editas abajo.
          </p>

          {PASOS.map((paso, i) => (
            <div className="brick step" key={paso.t}>
              <div className="stepnum" aria-hidden="true">
                {i + 1}
              </div>
              <div>
                <h3>{paso.t}</h3>
                <p>{paso.p}</p>
                {paso.callout ? <span className="callout">{paso.callout}</span> : null}
              </div>
            </div>
          ))}
        </section>

        <CosteoInteractivo />

        <section id="reglas">
          <h2>Reglas de oro</h2>
          <p className="lede">El porqué detrás de cada número de este manual.</p>
          {REGLAS.map((regla) => (
            <div className="brick regla" style={{ borderLeftColor: regla.color }} key={regla.t}>
              <h4>{regla.t}</h4>
              <p>{regla.b}</p>
            </div>
          ))}
        </section>
      </main>

      <footer>
        <div className="wrap">
          Fuentes: menú Pollo al Barril (Ambato) y factura Skandinar S.A. Nro. 001-002-002099426 del
          28/08/2026 (100 pollos, 249,38 kg, $723,83 netos; aceite 20 L, $38,64 neto). Todo lo demás
          son estimados de mercado editables. Los gramajes son supuestos: la ficha técnica real de
          cocina manda.
        </div>
      </footer>
    </>
  );
}
