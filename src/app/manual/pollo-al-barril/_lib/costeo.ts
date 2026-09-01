// ── Modelo de costeo — Pollo al Barril (Ambato, Ecuador) ────────────────────
// Dos orígenes conviven aquí y la UI los distingue: `real: true` son cifras
// leídas de la factura Skandinar S.A. 001-002-002099426 del 28/08/2026; el
// resto son estimados de mercado que el operador edita en pantalla.
// Los gramajes de cada plato son supuestos típicos de asadero: la ficha técnica
// real de cocina manda y se reemplazan aquí cuando exista.

export type Unidad = "und" | "kg" | "L" | "porc";

export type Pieza = {
  /** Nombre como se lee en la caja de piezas. */
  n: string;
  u: Unidad;
  /** Costo unitario neto por defecto, en USD. */
  c: number;
  /** true = sale de una factura; ausente = estimado editable. */
  real?: boolean;
  /** Grupo con el que se agrupa en la caja de piezas. */
  g: string;
};

export const PIEZAS = {
  pollo: { n: "Pollo entero al barril (2,49 kg)", u: "und", c: 7.24, real: true, g: "Proteína y base" },
  papa: { n: "Papa", u: "kg", c: 0.55, g: "Proteína y base" },
  aceite: { n: "Aceite vegetal (fritura absorbida)", u: "L", c: 1.93, real: true, g: "Proteína y base" },
  carne: { n: "Carne de res (por 100 g)", u: "und", c: 0.55, g: "Proteína y base" },
  carneb: { n: "Carne al barril (80 g)", u: "und", c: 0.45, g: "Proteína y base" },
  prot: { n: "Proteína papas especiales (porción prom.)", u: "porc", c: 0.5, g: "Proteína y base" },
  salchicha: { n: "Salchicha", u: "und", c: 0.18, g: "Proteína y base" },
  chorizo: { n: "Chorizo paisa", u: "und", c: 0.6, g: "Proteína y base" },
  tocino: { n: "Tocino (porción)", u: "porc", c: 0.35, g: "Proteína y base" },

  salsas: { n: "Salsas de la casa (porción)", u: "porc", c: 0.15, g: "Complementos" },
  ensalada: { n: "Ensalada fresca (porción)", u: "porc", c: 0.2, g: "Complementos" },
  consome: { n: "Consomé (porción)", u: "porc", c: 0.25, g: "Complementos" },
  arroz: { n: "Arroz (porción)", u: "porc", c: 0.15, g: "Complementos" },
  menestra: { n: "Menestra (porción)", u: "porc", c: 0.3, g: "Complementos" },
  boton: { n: "Botón parrillero", u: "und", c: 0.15, g: "Complementos" },
  cont: { n: "Contenedor para llevar", u: "und", c: 0.15, g: "Complementos" },

  pan: { n: "Pan de hamburguesa", u: "und", c: 0.2, g: "Hamburguesas" },
  queso: { n: "Queso cheddar (lámina)", u: "und", c: 0.15, g: "Hamburguesas" },
  veg: { n: "Lechuga y tomate (porción)", u: "porc", c: 0.12, g: "Hamburguesas" },
  pina: { n: "Piña a la plancha (porción)", u: "porc", c: 0.15, g: "Hamburguesas" },

  gas250: { n: "Gaseosa 250 ml", u: "und", c: 0.32, g: "Bebidas (reventa e insumos)" },
  gas300: { n: "Gaseosa 300 ml", u: "und", c: 0.38, g: "Bebidas (reventa e insumos)" },
  gas500: { n: "Gaseosa 500 ml", u: "und", c: 0.55, g: "Bebidas (reventa e insumos)" },
  gas135: { n: "Gaseosa 1,35 L", u: "und", c: 1.05, g: "Bebidas (reventa e insumos)" },
  fz300: { n: "Fuze Tea 300 ml", u: "und", c: 0.42, g: "Bebidas (reventa e insumos)" },
  fz550: { n: "Fuze Tea 550 ml", u: "und", c: 0.58, g: "Bebidas (reventa e insumos)" },
  fz1: { n: "Fuze Tea 1 L", u: "und", c: 0.85, g: "Bebidas (reventa e insumos)" },
  fz15: { n: "Fuze Tea 1,5 L", u: "und", c: 1.15, g: "Bebidas (reventa e insumos)" },
  agua: { n: "Agua", u: "und", c: 0.22, g: "Bebidas (reventa e insumos)" },
  gtg5: { n: "Güitig 500 ml", u: "und", c: 0.42, g: "Bebidas (reventa e insumos)" },
  gtg15: { n: "Güitig 1,5 L", u: "und", c: 0.8, g: "Bebidas (reventa e insumos)" },
  jam5: { n: "Agua de Jamaica 500 ml (insumos)", u: "und", c: 0.3, g: "Bebidas (reventa e insumos)" },
  jam1: { n: "Agua de Jamaica 1 L (insumos)", u: "und", c: 0.5, g: "Bebidas (reventa e insumos)" },
  li240: { n: "Limonada imperial 240 ml (insumos)", u: "und", c: 0.3, g: "Bebidas (reventa e insumos)" },
  li15: { n: "Limonada imperial 1,5 L (insumos)", u: "und", c: 0.75, g: "Bebidas (reventa e insumos)" },
  lvaso: { n: "Limonada vaso grande (insumos)", u: "und", c: 0.3, g: "Bebidas (reventa e insumos)" },
  lmedia: { n: "Limonada ½ jarra (insumos)", u: "und", c: 0.55, g: "Bebidas (reventa e insumos)" },
  ljarra: { n: "Limonada jarra (insumos)", u: "und", c: 0.9, g: "Bebidas (reventa e insumos)" },
} as const satisfies Record<string, Pieza>;

export type PiezaId = keyof typeof PIEZAS;

/** Costos vivos: id → costo unitario en USD. */
export type Costos = Record<PiezaId, number>;

export const costosPorDefecto = (): Costos =>
  Object.fromEntries(
    (Object.keys(PIEZAS) as PiezaId[]).map((k) => [k, PIEZAS[k].c]),
  ) as Costos;

/** Una línea de ficha técnica: pieza × cantidad. */
export type Linea = readonly [PiezaId, number];

export type Banda = readonly [number, number];

export type Categoria = {
  n: string;
  /** Banda objetivo de food cost, en %. */
  band: Banda;
  /** Color de la cabecera y del lomo de cada set. */
  color: string;
  /** Por qué esta categoría se juzga con esa banda y no con otra. */
  why: string;
};

export const CATEGORIAS = {
  pollos: {
    n: "Pollos al barril",
    band: [38, 52],
    color: "var(--red)",
    why: "El ancla: food cost alto a propósito. Este set no gana plata — trae a la gente que la deja en el resto del menú.",
  },
  combos: {
    n: "Combos",
    band: [36, 48],
    color: "var(--blue)",
    why: "El blend: piezas baratas (arroz, consomé, bebida) diluyen el food cost del pollo y suben el ticket.",
  },
  papas: {
    n: "Papas clásicas y especiales",
    band: [18, 30],
    color: "var(--yellow)",
    why: "El margen: aquí se gana lo que el pollo no deja. Papa barata + proteína medida = la mejor matemática del menú.",
  },
  burgers: {
    n: "Hamburguesas al barril",
    band: [26, 36],
    color: "var(--green)",
    why: "Segunda línea: mismo precio no significa mismo costo. Vigila los toppings caros (chorizo, tocino doble).",
  },
  extras: {
    n: "Extras y acompañamientos",
    band: [8, 40],
    color: "var(--blue)",
    why: "Multiplicadores de ticket: casi todo bajo 25% de food cost. Ofrécelos con cada pollo — es margen casi puro.",
  },
  bebidas: {
    n: "Bebidas",
    band: [25, 48],
    color: "var(--green)",
    why: "Reventa: el margen lo fija tu proveedor, no tu cocina. Las preparadas (limonadas, jamaica) rinden el doble que las embotelladas.",
  },
} as const satisfies Record<string, Categoria>;

export type CategoriaId = keyof typeof CATEGORIAS;

export type SetMenu = {
  cat: CategoriaId;
  n: string;
  /** Precio de venta al público, tal como está en la carta. */
  pvp: number;
  parts: readonly Linea[];
  /** Banda propia cuando el plato no se juzga con la de su categoría. */
  band?: Banda;
  note?: string;
};

export const SETS: readonly SetMenu[] = [
  { cat: "pollos", n: "1 Pollo entero al barril", pvp: 16.49, parts: [["pollo", 1], ["papa", 0.4], ["aceite", 0.04], ["ensalada", 1], ["salsas", 2]] },
  { cat: "pollos", n: "½ Pollo al barril", pvp: 9.49, parts: [["pollo", 0.5], ["papa", 0.25], ["aceite", 0.025], ["ensalada", 1], ["salsas", 1]] },
  { cat: "pollos", n: "¼ Pollo al barril", pvp: 4.99, parts: [["pollo", 0.25], ["papa", 0.15], ["aceite", 0.015], ["ensalada", 0.5], ["salsas", 1]] },
  { cat: "pollos", n: "⅛ Pollo al barril", pvp: 3.25, parts: [["pollo", 0.125], ["papa", 0.12], ["aceite", 0.012], ["ensalada", 0.5], ["salsas", 1]] },
  {
    cat: "pollos",
    n: "Pollo solo al barril",
    pvp: 13.99,
    parts: [["pollo", 1]],
    note: "52% de food cost y está bien: es el cartel. Fíjate que el entero con acompañamientos cobra $2,50 más por ~$0,80 de costo extra — vende siempre el completo.",
  },

  { cat: "combos", n: "Combo barrilito 1", pvp: 3.99, parts: [["pollo", 0.125], ["papa", 0.12], ["aceite", 0.012], ["ensalada", 0.5], ["gas250", 1], ["consome", 1]] },
  { cat: "combos", n: "Combo barrilito 2", pvp: 5.99, parts: [["pollo", 0.25], ["papa", 0.15], ["aceite", 0.015], ["ensalada", 0.5], ["gas250", 1], ["consome", 1]] },
  { cat: "combos", n: "Combo familiar barril 1", pvp: 19.99, parts: [["pollo", 1], ["papa", 0.4], ["aceite", 0.04], ["ensalada", 1], ["salsas", 2], ["gas135", 1], ["arroz", 1], ["consome", 2]] },
  {
    cat: "combos",
    n: "Combo familiar barril 2",
    pvp: 22.99,
    parts: [["pollo", 1], ["papa", 0.7], ["aceite", 0.07], ["ensalada", 1], ["salsas", 2], ["gas135", 1], ["arroz", 1], ["consome", 4]],
    note: "Los $3 extra sobre el familiar 1 cuestan ~$0,72 en piezas (papas y 2 consomés más). Empuja siempre al 2.",
  },
  { cat: "combos", n: "Combo familiar jumbo", pvp: 31.99, parts: [["pollo", 1.5], ["papa", 0.8], ["aceite", 0.08], ["ensalada", 1.5], ["salsas", 3], ["gas135", 1], ["arroz", 1], ["consome", 4]] },

  { cat: "papas", n: "Salchipapa", pvp: 2.0, parts: [["papa", 0.15], ["aceite", 0.015], ["salchicha", 1], ["salsas", 0.5]] },
  { cat: "papas", n: "Salchipapa doble", pvp: 2.49, parts: [["papa", 0.18], ["aceite", 0.018], ["salchicha", 2], ["salsas", 0.5]] },
  { cat: "papas", n: "Chori papa", pvp: 2.99, parts: [["papa", 0.15], ["aceite", 0.015], ["chorizo", 1], ["salsas", 0.5]] },
  { cat: "papas", n: "Papi carne", pvp: 2.99, parts: [["papa", 0.15], ["aceite", 0.015], ["carne", 0.8], ["salsas", 0.5]] },
  { cat: "papas", n: "Papas especiales sencilla (1 carne)", pvp: 3.99, parts: [["papa", 0.2], ["aceite", 0.02], ["prot", 1], ["salsas", 1]] },
  { cat: "papas", n: "Papas especiales doble (2 carnes)", pvp: 5.99, parts: [["papa", 0.2], ["aceite", 0.02], ["prot", 2], ["salsas", 1]] },
  { cat: "papas", n: "Papas especiales triple (3 carnes)", pvp: 6.99, parts: [["papa", 0.2], ["aceite", 0.02], ["prot", 3], ["salsas", 1]] },
  { cat: "papas", n: "Papas con chilli", pvp: 3.99, parts: [["papa", 0.18], ["aceite", 0.018], ["carne", 0.8], ["queso", 2], ["salsas", 1]] },
  { cat: "papas", n: "Papi carne al barril", pvp: 3.49, parts: [["papa", 0.18], ["aceite", 0.018], ["carneb", 1], ["boton", 1], ["queso", 1], ["salsas", 1]] },

  { cat: "burgers", n: "Clásica (sin papas)", pvp: 2.99, parts: [["pan", 1], ["carne", 1], ["veg", 1], ["salsas", 0.7]] },
  { cat: "burgers", n: "Americana", pvp: 4.99, parts: [["pan", 1], ["carne", 1], ["queso", 1], ["veg", 1], ["salsas", 0.7], ["papa", 0.12], ["aceite", 0.012]] },
  { cat: "burgers", n: "Tocino", pvp: 4.99, parts: [["pan", 1], ["carne", 1], ["queso", 1], ["tocino", 1], ["veg", 1], ["salsas", 0.7], ["papa", 0.12], ["aceite", 0.012]] },
  { cat: "burgers", n: "Piña", pvp: 4.99, parts: [["pan", 1], ["carne", 1], ["queso", 1], ["pina", 1], ["veg", 1], ["salsas", 0.7], ["papa", 0.12], ["aceite", 0.012]] },
  {
    cat: "burgers",
    n: "Paisa",
    pvp: 4.99,
    parts: [["pan", 1], ["carne", 1], ["queso", 1], ["chorizo", 1], ["veg", 1], ["salsas", 0.7], ["papa", 0.12], ["aceite", 0.012]],
    note: "Mismo precio que la Americana con ~$0,60 más de costo: el chorizo se come el margen. Súbela de precio o renegocia la pieza.",
  },
  {
    cat: "burgers",
    n: "Premium",
    pvp: 6.99,
    parts: [["pan", 1], ["carne", 2], ["queso", 2], ["tocino", 2], ["veg", 1], ["salsas", 0.7], ["papa", 0.12], ["aceite", 0.012]],
    note: "«Pierde» en porcentaje y gana en plata: es el mayor margen en dólares de toda la línea burger.",
  },

  { cat: "extras", n: "Extra: chorizo paisa", pvp: 1.5, parts: [["chorizo", 1]] },
  { cat: "extras", n: "Extra: salchicha", pvp: 1.0, parts: [["salchicha", 1]] },
  { cat: "extras", n: "Extra: tocino", pvp: 1.0, parts: [["tocino", 1]] },
  { cat: "extras", n: "Extra: queso cheddar", pvp: 1.0, parts: [["queso", 1]] },
  { cat: "extras", n: "Extra: carne de hamburguesa al barril", pvp: 2.25, parts: [["carne", 1]] },
  { cat: "extras", n: "Acompañamiento: arroz", pvp: 1.5, parts: [["arroz", 1]] },
  { cat: "extras", n: "Acompañamiento: papas", pvp: 2.0, parts: [["papa", 0.25], ["aceite", 0.025]] },
  { cat: "extras", n: "Acompañamiento: consomé", pvp: 1.25, parts: [["consome", 1]] },
  { cat: "extras", n: "Acompañamiento: menestra", pvp: 2.0, parts: [["menestra", 1]] },
  { cat: "extras", n: "Acompañamiento: ensalada", pvp: 1.99, parts: [["ensalada", 1]] },
  {
    cat: "extras",
    n: "Acompañamiento: presa sola",
    pvp: 2.25,
    parts: [["pollo", 0.125]],
    band: [38, 52],
    note: "Es ⅛ de pollo: se mide con la banda del ancla (38–52%), no con la de acompañamientos.",
  },

  { cat: "bebidas", n: "Gaseosa 250 ml", pvp: 0.75, parts: [["gas250", 1]] },
  { cat: "bebidas", n: "Gaseosa 300 ml", pvp: 0.99, parts: [["gas300", 1]] },
  { cat: "bebidas", n: "Gaseosa 500 ml", pvp: 1.25, parts: [["gas500", 1]] },
  { cat: "bebidas", n: "Gaseosa 1,35 L", pvp: 2.25, parts: [["gas135", 1]] },
  { cat: "bebidas", n: "Fuze Tea 300 ml", pvp: 0.75, parts: [["fz300", 1]] },
  { cat: "bebidas", n: "Fuze Tea 550 ml", pvp: 1.0, parts: [["fz550", 1]] },
  { cat: "bebidas", n: "Fuze Tea 1 L", pvp: 1.5, parts: [["fz1", 1]] },
  { cat: "bebidas", n: "Fuze Tea 1,5 L", pvp: 2.25, parts: [["fz15", 1]] },
  { cat: "bebidas", n: "Agua", pvp: 0.99, parts: [["agua", 1]] },
  { cat: "bebidas", n: "Güitig 500 ml", pvp: 1.0, parts: [["gtg5", 1]] },
  { cat: "bebidas", n: "Güitig 1,5 L", pvp: 1.75, parts: [["gtg15", 1]] },
  { cat: "bebidas", n: "Agua de Jamaica 500 ml", pvp: 1.5, parts: [["jam5", 1]] },
  { cat: "bebidas", n: "Agua de Jamaica 1 L", pvp: 2.5, parts: [["jam1", 1]] },
  { cat: "bebidas", n: "Limonada imperial 240 ml", pvp: 1.25, parts: [["li240", 1]] },
  { cat: "bebidas", n: "Limonada imperial 1,5 L", pvp: 2.5, parts: [["li15", 1]] },
  { cat: "bebidas", n: "Limonada vaso grande", pvp: 1.5, parts: [["lvaso", 1]] },
  { cat: "bebidas", n: "Limonada ½ jarra", pvp: 2.25, parts: [["lmedia", 1]] },
  { cat: "bebidas", n: "Limonada jarra", pvp: 3.5, parts: [["ljarra", 1]] },
];

/** Promo que es un plato en sí: se costea como cualquier set. */
export type PromoSet = {
  tipo: "set";
  n: string;
  pvp: number;
  parts: readonly Linea[];
  copy: string;
};

/** Promo de regalo: se costea al costo del regalo contra el ticket que exige. */
export type PromoRegalo = {
  tipo: "regalo";
  n: string;
  regalo: readonly Linea[];
  /** Rango de ticket que dispara la promo; null = no se mide por plato. */
  ticket: Banda | null;
  cond: string;
  copy: string;
};

export type Promo = PromoSet | PromoRegalo;

export const PROMOS: readonly Promo[] = [
  {
    tipo: "set",
    n: "Todos los días: 2 pollos solos por $25,99",
    pvp: 25.99,
    parts: [["pollo", 2]],
    copy: "Food cost ~56%: es compra de tráfico, no de margen. Funciona solo si cada venta arrastra bebidas y acompañamientos — mídela por el ticket completo, no por el plato.",
  },
  {
    tipo: "regalo",
    n: "Lunes calientito — consomé gratis",
    regalo: [["consome", 1]],
    ticket: [9.49, 16.49],
    cond: "por compra de pollo entero o ½",
    copy: "La promo perfecta: el regalo nace del mismo pollo (menudencias y caldo), cuesta centavos y el cliente lo percibe como $1,25 de carta.",
  },
  {
    tipo: "regalo",
    n: "Martes refrescante — bebida gratis",
    regalo: [["gas135", 1]],
    ticket: [9.49, 16.49],
    cond: "por compra de pollo entero o ½",
    copy: "Asumiendo botella de 1,35 L. Si el ticket es ½ pollo, entrega personal: mismo efecto, un tercio del costo.",
  },
  {
    tipo: "regalo",
    n: "Miércoles papero — papas cocinadas gratis",
    regalo: [["papa", 0.3]],
    ticket: [9.49, 16.49],
    cond: "por compra de pollo entero o ½",
    copy: "La promo más barata del menú: papa cocinada no lleva aceite ni fritura. Bien elegida.",
  },
  {
    tipo: "regalo",
    n: "Jueves burger day — bebida gratis",
    regalo: [["gas250", 1]],
    ticket: [4.99, 4.99],
    cond: "en hamburguesas americanas",
    copy: "La Americana (food cost ~24%) aguanta el regalo sin despeinarse. La condición sobre UNA burger específica protege el resto de la línea.",
  },
  {
    tipo: "regalo",
    n: "Viernes entre amigos — bebida gratis",
    regalo: [["gas135", 1]],
    ticket: [7.98, 7.98],
    cond: "por compra de 2 papas con queso cheddar",
    copy: "El descuento efectivo más alto de la semana. Costéala como combo (piezas totales ÷ ticket) o baja el regalo a bebida personal.",
  },
  {
    tipo: "regalo",
    n: "Cumpleañeros — salchipapa gratis",
    regalo: [["papa", 0.15], ["aceite", 0.015], ["salchicha", 1], ["salsas", 0.5]],
    ticket: null,
    cond: "grupo de amigos + cédula",
    copy: "Menos de $0,40 por traer una mesa entera: es marketing pagado en papas, no una promo de comida. La mejor adquisición de clientes del manual.",
  },
];

export type Regla = { color: string; t: string; b: string };

export const REGLAS: readonly Regla[] = [
  {
    color: "var(--red)",
    t: "El pollo es el cartel, no el negocio",
    b: "El pollo solo ronda 52% de food cost y está bien: un asadero no gana en el pollo — gana en lo que el pollo arrastra. Por eso el ancla se costea con banda propia (38–52%) y no se juzga con la vara de las papas.",
  },
  {
    color: "var(--yellow)",
    t: "Los acompañamientos son el negocio",
    b: "Arroz ~10%, ensalada ~10%, salchipapa ~18%. Pasar del pollo solo al entero con acompañamientos cobra $2,50 más por ~$0,80 de costo: cada «¿le agrego arroz y consomé?» es margen casi puro.",
  },
  {
    color: "var(--blue)",
    t: "El consomé nace casi gratis",
    b: "Sale del mismo pollo que ya compraste. Por eso regalarlo el lunes cuesta ~$0,25 y se percibe como $1,25: la mejor promo es la que se fabrica con subproductos.",
  },
  {
    color: "var(--green)",
    t: "Papa cocinada > papa frita en promos",
    b: "Sin aceite ni fritura, el miércoles papero regala ~$0,17. Cuando diseñes una promo, elige la versión de la pieza que menos piezas consume.",
  },
  {
    color: "var(--red)",
    t: "Una promo se costea al costo del regalo",
    b: "Contra el ticket que exige, nunca al precio de carta. Los 2 pollos a $25,99 son compra de tráfico (56% FC): se miden por lo que arrastran, no por lo que dejan solos.",
  },
  {
    color: "var(--yellow)",
    t: "Mismo precio no significa mismo costo",
    b: "La Paisa (~36%) se come el margen de la Americana (~24%) al mismo precio de $4,99. O sube la Paisa, o renegocia el chorizo, o acepta el subsidio a sabiendas — pero decídelo con el número enfrente.",
  },
  {
    color: "var(--blue)",
    t: "No comes porcentajes, comes dólares",
    b: "La Premium «pierde» en % (~37%) y deja el mayor margen en plata de la línea (~$4,38). El porcentaje ordena la lista; los dólares pagan el arriendo. Mira los dos siempre.",
  },
  {
    color: "var(--green)",
    t: "El costo es una foto, no un cuadro",
    b: "En tu propia factura el descuento varió de 9,79% a 13,84% el mismo día. Recostea con cada compra: una pieza que sube 10% sin recosteo es margen que se evapora en silencio.",
  },
  {
    color: "var(--red)",
    t: "El IVA nunca fue tuyo",
    b: "Si facturas con IVA 15%, tu food cost real se calcula sobre PVP ÷ 1,15 — activa el interruptor arriba y mira cómo cambia la película. Costear sobre precio con IVA es mentirse 15%.",
  },
  {
    color: "var(--yellow)",
    t: "Empaque cobrado = empaque neutro",
    b: "El contenedor a $0,25 cubre su costo (~$0,15). Cóbralo siempre y mantenlo fuera del food cost: es logística, no receta.",
  },
];

// ── Cálculo y formato ───────────────────────────────────────────────────────

export const money = (x: number) => "$" + x.toFixed(2).replace(".", ",");

export const pct = (x: number) => x.toFixed(1).replace(".", ",") + "%";

/** Cantidad de una línea, escrita en la unidad en que se compra la pieza. */
export const qtyTxt = (q: number, u: Unidad) => {
  if (u === "kg") return q >= 1 ? q.toFixed(2).replace(".", ",") + " kg" : Math.round(q * 1000) + " g";
  if (u === "L") return q >= 1 ? q.toFixed(2).replace(".", ",") + " L" : Math.round(q * 1000) + " ml";
  return "× " + (q % 1 === 0 ? String(q) : q.toFixed(q < 1 ? 2 : 1).replace(".", ","));
};

export const costOf = (parts: readonly Linea[], costos: Costos) =>
  parts.reduce((t, [k, q]) => t + costos[k] * q, 0);

/** PVP neto: el 15% de IVA nunca fue del negocio, así que sale del divisor. */
export const netPVP = (pvp: number, conIVA: boolean) => (conIVA ? pvp / 1.15 : pvp);

export type Semaforo = "ok" | "mid" | "hot";

/** Verde dentro de banda, ámbar hasta 6 puntos por encima, rojo más allá. */
export const semaforo = (fc: number, band: Banda): Semaforo =>
  fc <= band[1] ? "ok" : fc <= band[1] + 6 ? "mid" : "hot";

export const colorSemaforo = (s: Semaforo) =>
  s === "ok" ? "var(--green)" : s === "mid" ? "var(--amber)" : "var(--red)";
