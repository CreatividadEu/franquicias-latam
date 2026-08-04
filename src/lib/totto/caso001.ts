/**
 * Caso 001 · Stoik Intel × Totto — única fuente de copy y cifras del microsite.
 *
 * Reglas de la casa (heredadas de Stoik OS) que este archivo hace cumplir:
 *   · cifra primero, sentence case, sin signos de exclamación, sin emojis;
 *   · ninguna cifra sin su camino a la evidencia — todo dato que sale en
 *     pantalla declara aquí el `slug` de la captura que lo respalda;
 *   · nada se inventa: cada valor viene del expediente ya verificado.
 *
 * Los componentes no redactan ni calculan: leen de aquí. `tests/caso001.test.ts`
 * verifica los invariantes (la suma de 214.025, el tono, la trazabilidad).
 */

// ── Evidencia ───────────────────────────────────────────────────────────────
// Las capturas viven en /public/totto/caso-001/<slug>.webp y se sirven
// congeladas: nunca se enlaza contenido vivo del infractor. Si un archivo aún
// no está montado, el marco lo declara como anexo pendiente en vez de fingirlo.

export const EVIDENCE_DIR = "/totto/caso-001";

export type EvidenceSlug =
  | "fb-post-modal-trio"
  | "corpus-grid"
  | "dropi-leydi-header"
  | "dropi-catalogo-stocks"
  | "wa-leidy-fabricante"
  | "incautacion-bodega"
  | "dropi-cristobal-perfil"
  | "dropi-cards-200"
  | "fb-jlshoes-contacto"
  | "fb-post-sonia";

export type EvidenceItem = {
  /** Nombre semántico del archivo, sin extensión. */
  slug: EvidenceSlug;
  /** Texto alternativo real: describe lo que se ve, no el rol narrativo. */
  alt: string;
  /** Pie de foto que aparece bajo el marco. */
  caption: string;
  /** De dónde salió la captura. Va en el sello del marco. */
  source: string;
};

export const EVIDENCE: Record<EvidenceSlug, EvidenceItem> = {
  "fb-post-modal-trio": {
    slug: "fb-post-modal-trio",
    alt: "Publicación de Facebook que ofrece un trío de morrales bajo el título TRIO TOTTO TIPO RÉPLICA por 55.000 pesos",
    caption: "El anuncio no esconde la palabra: la usa como argumento de venta.",
    source: "Facebook · grupo de venta · captura congelada",
  },
  "corpus-grid": {
    slug: "corpus-grid",
    alt: "Mosaico del corpus interno de falsificaciones etiquetadas a mano, morral por morral",
    caption:
      "El corpus etiquetado a mano. Miles de piezas que enseñaron al modelo qué es un Totto y qué no.",
    source: "Stoik Intel · corpus de entrenamiento",
  },
  "dropi-leydi-header": {
    slug: "dropi-leydi-header",
    alt: "Encabezado del perfil de proveedor de Leidy en Dropi con el conteo de órdenes, revendedores y tiempo de despacho",
    caption:
      "Una sola cuenta de la red, vista desde adentro: órdenes, revendedores y despacho.",
    source: "Dropi · perfil de proveedor · captura congelada",
  },
  "dropi-catalogo-stocks": {
    slug: "dropi-catalogo-stocks",
    alt: "Catálogo de Dropi mostrando el stock disponible por referencia de morral",
    caption: "El inventario declarado, referencia por referencia.",
    source: "Dropi · catálogo de proveedor · captura congelada",
  },
  "wa-leidy-fabricante": {
    slug: "wa-leidy-fabricante",
    alt: "Perfil de WhatsApp Business rotulado Fabricante de Bolsos con el número de celular 3223551657",
    caption:
      "El mismo teléfono del anuncio, de la cuenta de venta y del perfil que se rotula fabricante.",
    source: "WhatsApp Business · perfil público · captura congelada",
  },
  "incautacion-bodega": {
    slug: "incautacion-bodega",
    alt: "Mercancía falsificada incautada y apilada durante un operativo de la Policía Nacional",
    caption: "El final de la cadena, documentado: del inventario al despacho, y del despacho al acta.",
    source: "Policía Nacional · registro del operativo",
  },
  "dropi-cristobal-perfil": {
    slug: "dropi-cristobal-perfil",
    alt: "Perfil de proveedor de Cristóbal en Dropi con su bodega asociada",
    caption: "El segundo hermano, con su propia bodega y su propio catálogo.",
    source: "Dropi · perfil de proveedor · captura congelada",
  },
  "dropi-cards-200": {
    slug: "dropi-cards-200",
    alt: "Tarjetas de producto en Dropi mostrando la red de revendedores asociados a la cuenta",
    caption: "Cada tarjeta es un revendedor. La cuenta no vende: abastece.",
    source: "Dropi · listado de revendedores · captura congelada",
  },
  "fb-jlshoes-contacto": {
    slug: "fb-jlshoes-contacto",
    alt: "Ficha de contacto de la página de Facebook JL Shoes con sus datos de bodega",
    caption: "La bodega también tiene vitrina propia.",
    source: "Facebook · página de negocio · captura congelada",
  },
  "fb-post-sonia": {
    slug: "fb-post-sonia",
    alt: "Publicación de Facebook de una vendedora de la red ofreciendo morrales de la misma referencia",
    caption: "La misma foto de fábrica, otra vendedora. Así se multiplica la red.",
    source: "Facebook · grupo de venta · captura congelada",
  },
};

// ── Marca y metadatos ───────────────────────────────────────────────────────

export const BRAND = {
  wordmark: "STOIK INTEL",
  caseTag: "CASO 001",
  client: "TOTTO",
  confidential: "CONFIDENCIAL · NO CIRCULA",
  signature:
    "STOIK INTEL × SENEOR LAWYERS · CASO 001 · Confidencial · No circula",
} as const;

// ── Actos (para el flag fijo y la barra de progreso) ────────────────────────

export type ActId =
  | "hero"
  | "principio"
  | "cifra"
  | "acto-i"
  | "acto-ii"
  | "acto-iii"
  | "acto-iv"
  | "desenlace"
  | "epilogo"
  | "cierre";

export const ACT_FLAGS: Record<ActId, string> = {
  hero: "CASO 001",
  principio: "PRIMER PRINCIPIO",
  cifra: "LA CIFRA",
  "acto-i": "ACTO I · LA ESCALA",
  "acto-ii": "ACTO II · LA MÁQUINA",
  "acto-iii": "ACTO III · LA RED",
  "acto-iv": "ACTO IV · LA DOCTRINA",
  desenlace: "DESENLACE",
  epilogo: "EPÍLOGO",
  cierre: "CIERRE",
};

// ── 1 · Hero ────────────────────────────────────────────────────────────────

export const HERO = {
  eyebrow: "Stoik Intel × Totto · Caso 001",
  lines: [
    { text: "INTELIGENCIA", tone: "paper" },
    { text: "QUE TERMINA", tone: "red" },
    { text: "EN INCAUTACIÓN.", tone: "gold" },
  ] as const,
  sub: "Seis meses de rastreo. Un modelo entrenado en casa. Una cadena completa, del post de Facebook a la bodega.",
  scrollCue: "Desplace para abrir el expediente",
} as const;

// ── 2 · Primer principio ────────────────────────────────────────────────────

export const PRINCIPLE = {
  eyebrow: "Primer principio",
  thesis: [
    "Los lugares donde ocurre el comercio cambiaron.",
    "Con ellos cambió el campo de batalla de la propiedad intelectual.",
  ],
  body: "El enemigo es rápido, hábil, anónimo y sin fronteras; cambia de nombre en horas y se esconde a plena vista. Las marcas grandes tienen mil frentes y no pueden perseguir a cada uno. A través de tecnología propia y poderosa dimos un salto: soluciones asimétricas para un adversario asimétrico. Existimos para seguirle el paso.",
  traits: [
    { title: "Rápido", note: "Cambia de nombre en horas. El anuncio muere y renace el mismo día." },
    { title: "Anónimo", note: "Perfiles desechables, cuentas nuevas, ningún dato que resista una notificación." },
    { title: "Sin fronteras", note: "La bodega, la plataforma y el comprador rara vez comparten jurisdicción." },
    { title: "A plena vista", note: "No se esconde del buscador: se esconde del vocabulario que la marca vigila." },
  ],
} as const;

// ── 3 · La gran cifra ───────────────────────────────────────────────────────

export const BIG_NUMBER = {
  eyebrow: "La cifra",
  value: 214_025,
  unit: "unidades falsificadas de Totto",
  qualifier: "Contadas, no estimadas.",
  note: "La cifra no sale de un muestreo ni de una proyección de mercado: sale de sumar el inventario declarado por cada cuenta de la red en su propia plataforma de abastecimiento.",
  breakdown: [
    { name: "Leidy", value: 137_861, evidence: "dropi-leydi-header" as EvidenceSlug },
    { name: "Cristóbal", value: 42_858, evidence: "dropi-cristobal-perfil" as EvidenceSlug },
    { name: "Carlos", value: 33_306, evidence: "dropi-catalogo-stocks" as EvidenceSlug },
  ],
  sumLabel: "Suma verificada",
} as const;

// ── 4 · Acto I · La escala ──────────────────────────────────────────────────

export const ACT_I = {
  flag: ACT_FLAGS["acto-i"],
  coverKicker: "Acto I",
  coverTitle: "No es un vendedor.",
  coverSub: "Es una cadena con tres eslabones, y el que se ve es el último.",
  chain: [
    { step: "01", title: "Manufactura", note: "Alguien produce la pieza y fotografía el lote." },
    { step: "02", title: "Bodegaje", note: "El inventario se concentra y se declara por referencia." },
    { step: "03", title: "Distribución", note: "Cientos de vendedores reparten la misma foto y el mismo stock." },
  ],
  alert:
    "El takedown apaga el anuncio. No toca la fábrica, la bodega ni la red.",
  hiding: {
    title: "Se esconden a plena vista",
    body: "No evaden el buscador: evaden el vocabulario. La marca vigila su nombre, y el infractor vende con todo lo que se le parece.",
    aliases: [
      { term: "morral tipo Totto", featured: false },
      { term: "estilo Totto", featured: false },
      { term: "T0tto", featured: false },
      { term: "TIPO RÉPLICA", featured: true },
    ],
    evidence: "fb-post-modal-trio" as EvidenceSlug,
    evidenceLead: "TRIO TOTTO TIPO RÉPLICA · $55.000",
  },
} as const;

// ── 5 · Acto II · La máquina (Stoik Intel — el MOAT) ────────────────────────

export const ACT_II = {
  flag: ACT_FLAGS["acto-ii"],
  coverKicker: "Acto II",
  coverTitle: "Entrenamos un modelo propio.",
  coverSub:
    "No compramos una herramienta de monitoreo: construimos Stoik Intel y la operamos siete meses sobre este caso. Esa es la ventaja que no se compra.",
  moatChips: ["Tecnología propia", "Siete meses en operación", "Corpus etiquetado en casa"],
} as const;

export type ConsoleStepId = "A" | "B" | "C" | "D";

export const CONSOLE = {
  eyebrow: "Stoik Intel · consola de operación",
  title: "La máquina, en vivo",
  liveLabel: "En vivo",
  hint: "Recorra los cuatro pasos con clic o con las flechas ← →.",
  autoplayLabel: "Auto",
  autoplayOnLabel: "Auto · activo",
  steps: [
    { id: "A" as ConsoleStepId, tab: "A · Barrido", title: "Barrido" },
    { id: "B" as ConsoleStepId, tab: "B · Reconocimiento", title: "Reconocimiento" },
    { id: "C" as ConsoleStepId, tab: "C · El grafo", title: "El grafo" },
    { id: "D" as ConsoleStepId, tab: "D · La capa profunda", title: "La capa profunda" },
  ],
} as const;

export const STEP_A = {
  title: "Barremos donde ocurre el comercio",
  body: "El barrido no busca la palabra Totto: busca el patrón de una falsificación en venta. Cada listado entra con un score de triage y solo pasa el que supera el umbral.",
  command: "hunt --brand Totto --market CO",
  bootLines: [
    "stoik-intel v3 · sesión TOTTO-CO · operador autenticado",
    "cargando vocabulario de alias (312 términos) ......... ok",
    "cargando corpus visual etiquetado ................... ok",
  ],
  scanLines: [
    "scan facebook-marketplace ........................... 26 listados",
    "scan grupos vigilados ............................... 73 grupos",
  ],
  listings: [
    { title: "TRIO TOTTO TIPO RÉPLICA · $55.000", score: 90, signal: "réplica" },
    { title: "morral totto aaa · disponible ya", score: 90, signal: "aaa" },
    { title: "bolso totto 1.1 · calidad original", score: 50, signal: "1.1" },
    { title: "morral tipo totto unisex", score: 50, signal: "tipo totto" },
  ],
  tailLines: [
    "triage aplicado · umbral >= 50 ...................... 26 en cola",
    "elevando a reconocimiento visual ................... listo",
  ],
  kpis: [
    { value: "73", label: "grupos vigilados" },
    { value: "26", label: "listados sospechosos" },
    { value: "8", label: "marketplaces" },
    { value: "≥50", label: "umbral de triage" },
  ],
  scoringTitle: "Cómo se arma el score",
  scoring: [
    { rule: "Precio bajo la mediana de la referencia", points: "+40" },
    { rule: "Vocabulario de falsificación en el título", points: "+30" },
    { rule: "Cuenta creada hace poco", points: "+10" },
    { rule: "Reputación baja o sin historial", points: "+10" },
    { rule: "Marca escrita como alias", points: "+10" },
  ],
  scoringNote:
    "El score es explicable por diseño: cada punto se puede defender frente a un juez.",
} as const;

export const STEP_B = {
  title: "Reconocemos el producto, no la palabra",
  body: "Cambiar el título es gratis. Cambiar la pieza no lo es. El modelo lee la silueta, el herraje, la costura y la tipografía del logo, así que el listado se delata aunque nunca escriba la marca.",
  features: [
    { name: "Silueta", note: "Proporción del cuerpo, corte del bolsillo, caída de las correas." },
    { name: "Herraje", note: "Cremalleras, hebillas y remaches: el detalle que la copia abarata." },
    { name: "Costura", note: "Paso, refuerzo y remate en los puntos de carga." },
    { name: "Tipografía", note: "El logo copiado nunca cierra igual las curvas." },
  ],
  evidence: "corpus-grid" as EvidenceSlug,
  stack: ["voyage-multimodal-3", "pgvector · HNSW cosine", "1.024 dimensiones"],
  multiplierTitle: "El multiplicador",
  multiplier:
    "La red comparte fotos: la misma imagen de fábrica se reusa en decenas de vitrinas. Una sola foto entra a búsqueda inversa y devuelve, de un golpe, a todos los que la están revendiendo.",
  multiplierEvidence: "fb-post-sonia" as EvidenceSlug,
} as const;

export const STEP_C = {
  title: "Tres cuentas, una sola mano",
  body: "El grafo no cree en los nombres: cree en las coincidencias. Cuando las mismas fotos, la misma redacción, los mismos teléfonos y las mismas bodegas aparecen en cuentas distintas, la red colapsa en una sola entidad.",
  signals: [
    "Fotos reutilizadas entre cuentas",
    "Misma redacción en los anuncios",
    "Teléfonos repetidos",
    "Mismas bodegas de despacho",
  ],
  resolution: "Resolución de entidad",
  people: [
    { id: "leidy", label: "Leidy", warehouse: "Distribuciones Leydi" },
    { id: "cristobal", label: "Cristóbal", warehouse: "JL Shoes" },
    { id: "carlos", label: "Carlos", warehouse: "Distribuidora Alison" },
  ],
  core: { label: "FAMILIA PABÓN", value: "214.025 u" },
  caption:
    "Seis nodos, una sola arista útil: la que los une. El caso deja de ser 26 anuncios y pasa a ser una organización.",
} as const;

export const STEP_D = {
  title: "La capa profunda",
  body: "La plataforma de abastecimiento expone, para cada referencia, la variación de bodega que la despacha. Ahí no hay narrativa: hay una ciudad y un nombre de bodega.",
  quote: "No lo dedujimos. Lo leímos de la fuente.",
  code: `{
  "warehouse_product_variation": {
    "id": 1688326,
    "stock": 189,
    "warehouse_id": 14338,
    "city": "CUCUTA",
    "name": "DISTRIBUIDORA ALISON"
  }
}`,
  /** Líneas resaltadas del bloque, 0-indexadas: city y name. */
  highlightLines: [5, 6],
  kpis: [
    { value: "244", label: "unidades trazadas a la bodega" },
    { value: "CÚCUTA", label: "ciudad de despacho" },
  ],
  cta: "Ver qué había detrás de esa cuenta",
  ctaTarget: "#dropi",
} as const;

export const FUNNEL = {
  eyebrow: "El embudo de costo",
  title: "Cada capa solo ve lo que pasó el filtro anterior",
  body: "Un barrido sin guardarraíles se vuelve impagable en una semana. El embudo existe para que la capa cara toque el menor número posible de listados.",
  stages: [
    { name: "Heurísticas", cost: "Gratis", note: "Precio, vocabulario, edad de la cuenta." },
    { name: "Embeddings", cost: "Tope 1.000/día", note: "Similitud visual contra el corpus." },
    { name: "VLM Batch", cost: "Tope 300/día", note: "Lectura fina de la pieza, por lotes." },
    { name: "Revisión humana", cost: "Analista", note: "Confirma antes de que algo se vuelva prueba." },
    { name: "Captura de evidencia", cost: "PNG + HTML + SHA-256", note: "Congelada, sellada y trazable." },
  ],
  moat:
    "Ese es el MOAT: no es el barrido, es operarlo siete meses con guardarraíles de gasto y un corpus propio que mejora en cada caso.",
} as const;

// ── 6 · Acto III · La red ───────────────────────────────────────────────────

export const ACT_III = {
  flag: ACT_FLAGS["acto-iii"],
  coverKicker: "Acto III",
  coverTitle: "Tres hermanos, una red.",
  coverSub:
    "Cada uno con su cuenta, su bodega y su catálogo. Un solo inventario cuando se suman.",
  familyTag: "Familia Pabón",
  siblings: [
    {
      id: "leidy",
      name: "Leidy",
      units: 137_861,
      warehouse: "Distribuciones Leydi",
      phone: "322 355 1657",
      phoneNote: "El mismo número del anuncio y del perfil de fabricante.",
      evidence: "dropi-leydi-header" as EvidenceSlug,
    },
    {
      id: "cristobal",
      name: "Cristóbal",
      units: 42_858,
      warehouse: "JL Shoes",
      phone: null,
      phoneNote: "Teléfono en el expediente, vinculado por coincidencia con la red.",
      evidence: "dropi-cristobal-perfil" as EvidenceSlug,
    },
    {
      id: "carlos",
      name: "Carlos",
      units: 33_306,
      warehouse: "Distribuidora Alison",
      phone: null,
      phoneNote: "Bodega leída directamente de la capa profunda, en Cúcuta.",
      evidence: "dropi-catalogo-stocks" as EvidenceSlug,
    },
  ],
  sumLine: "137.861 + 42.858 + 33.306 = 214.025 unidades",
} as const;

export const DROPI = {
  eyebrow: "El reveal",
  title: "Una sola cuenta de la red. Cientos de revendedores detrás.",
  body: "El anuncio de Facebook era la punta. Debajo había una cuenta de abastecimiento operando como mayorista: órdenes despachadas, revendedores activos y un tiempo de despacho de operación formal.",
  evidence: "dropi-leydi-header" as EvidenceSlug,
  kpis: [
    { value: 39_495, suffix: "", label: "órdenes despachadas" },
    { value: 208, suffix: "", label: "revendedores" },
    { value: 7, suffix: " h", label: "tiempo de despacho" },
  ],
  since: { value: "ene 2024", label: "activa desde" },
  footnote:
    "Se conserva la cifra visible en la captura embebida (39.495 órdenes). Una captura anterior del expediente registraba 38.760: prevalece siempre el número de la evidencia que acompaña al dato.",
  resellersEvidence: "dropi-cards-200" as EvidenceSlug,
} as const;

export const STOCKS = {
  title: "Los stocks, a la vista",
  body: "El inventario no había que estimarlo: la propia plataforma lo publica por referencia, para que el revendedor sepa cuánto puede vender.",
  evidence: "dropi-catalogo-stocks" as EvidenceSlug,
  values: [28_362, 21_616, 1_010, 869, 854, 831],
  valuesLabel: "unidades por referencia",
  priceFrom: { value: "$37.000", label: "precio proveedor" },
  priceTo: { value: "$80.000", label: "precio al cliente" },
  priceNote: "El margen es el combustible de la red: por eso hay 208 revendedores y no tres.",
} as const;

export const ENTRY_POINT = {
  title: "El punto de entrada — un post",
  body: "Todo el expediente arranca en una publicación pública y en un número de celular que el propio infractor repite en cada frente.",
  evidence: "wa-leidy-fabricante" as EvidenceSlug,
  badge: "Fabricante de Bolsos · Cel 3223551657",
  note: "El mismo teléfono aparece en el anuncio, en la cuenta de venta y en el perfil que se rotula fabricante. Tres frentes, una sola persona.",
  secondEvidence: "fb-jlshoes-contacto" as EvidenceSlug,
} as const;

export const SEIZURE = {
  title: "Del inventario al despacho",
  body: "La cadena que empezó en un post termina en mercancía apilada y contada. Eso es lo que convierte una investigación digital en un hecho físico documentado.",
  evidence: "incautacion-bodega" as EvidenceSlug,
} as const;

// ── 7 · Acto IV · La doctrina ───────────────────────────────────────────────

export const ACT_IV = {
  flag: ACT_FLAGS["acto-iv"],
  coverKicker: "Acto IV",
  coverTitle: "Llegamos a la fuente. Antes de que sepan que existimos.",
  coverSub: "El takedown es lo último, no lo primero.",
  body: "Bajar el anuncio avisa. Avisar mueve el inventario. Por eso el orden importa: primero se arma el expediente completo, y el ruido se hace al final, cuando ya no sirve de alerta.",
  chainOfCustody: {
    title: "Recaudo probatorio",
    note: "La evidencia nace con forma de allanamiento.",
    items: [
      { name: "Timestamp", note: "Momento exacto de captura, sellado en el registro." },
      { name: "Hash de integridad", note: "SHA-256 por pieza: si cambia un pixel, cambia el hash." },
      { name: "Trazabilidad", note: "Del pantallazo al HTML de origen, sin saltos en la cadena." },
    ],
  },
  operation: {
    title: "El operativo",
    note: "Seis pasos. El primero ya está hecho.",
    steps: [
      { n: "01", name: "Inteligencia digital", status: "COMPLETADA" as const },
      { n: "02", name: "Verificación en campo", status: null },
      { n: "03", name: "Radicación ante Fiscalía", status: null },
      { n: "04", name: "Coordinación con Policía Judicial", status: null },
      { n: "05", name: "Allanamiento e incautación", status: null },
      { n: "06", name: "Acción contra la plataforma", status: null },
    ],
    roles: [
      { actor: "Stoik Intel", duties: "Evidencia · expediente · acompañamiento" },
      { actor: "Totto", duties: "Querella · titularidad · decisión" },
      { actor: "Autoridad", duties: "Ejecución" },
    ],
  },
  window: {
    title: "La ventana se cierra",
    lines: ["El inventario rota.", "Las bodegas se mueven.", "Los perfiles se borran."],
    alert: "Sin fecha de radicación no hay operativo.",
  },
} as const;

// ── 8 · Desenlace ───────────────────────────────────────────────────────────

export const DECISIONS = {
  flag: ACT_FLAGS.desenlace,
  eyebrow: "Desenlace",
  title: "Dos decisiones. Tuyas.",
  sub: "Todo lo demás ya está hecho o ya está asignado.",
  items: [
    {
      n: "01",
      title: "Autorización para radicar ante Fiscalía",
      note: "Habilita presentar el expediente y fijar fecha. Sin ella, el caso se queda en carpeta.",
    },
    {
      n: "02",
      title: "Firma de querella como titular de la marca",
      note: "Solo el titular puede activarla. Es la llave que convierte la evidencia en acción penal.",
    },
  ],
  oneLiner: "Totto no autoriza un allanamiento — estrena una doctrina.",
} as const;

// ── 9 · Epílogo · El programa ───────────────────────────────────────────────

export const PROGRAM = {
  flag: ACT_FLAGS.epilogo,
  eyebrow: "Epílogo · el programa",
  title: "Caso 001 es la prueba. El programa es la escala.",
  body: "Un caso demuestra que la máquina funciona. El programa la pone a correr sobre toda la marca, todo el año, en todos los frentes donde hoy se vende.",
  phases: [
    {
      n: "Fase 1",
      name: "Diagnóstico",
      note: "Barrido continuo, corpus de la marca y tablero de infracción viva.",
      price: "US$10.000/mes",
      priceNote: "Mínimo 6 meses · informe mensual · revisión semestral",
    },
    {
      n: "Fase 2",
      name: "Enforcement digital",
      note: "Takedowns coordinados y presión sostenida sobre las plataformas.",
      price: "$12.000.000",
      priceNote: "Enforcement directo",
    },
    {
      n: "Fase 3",
      name: "Trazabilidad profunda",
      note: "Capa profunda, resolución de entidad y mapa de bodegas.",
      price: null,
      priceNote: null,
    },
    {
      n: "Fase 4",
      name: "Acción legal y fronteriza",
      note: "Querella, allanamiento y control en aduana.",
      price: "Por caso",
      priceNote: "Honorarios por jurisdicción",
    },
  ],
  iacc: {
    badge: "IACC 2026 · Orlando, Florida",
    title: "El caso viaja como caso de estudio",
    body: "Caso 001 se presenta ante la International AntiCounterfeiting Coalition en Orlando, Florida, en abril de 2026. La membresía abre acceso directo a las grandes plataformas de e-commerce por la vía de las alianzas de la IACC.",
    advantages: ["Tecnología propia", "Conocimiento probado", "Acceso sin precedentes"],
  },
} as const;

// ── 10 · Cierre ─────────────────────────────────────────────────────────────

export const CLOSING = {
  flag: ACT_FLAGS.cierre,
  quote:
    "Evidencia digital nacida en formato de allanamiento — en manos del apoderado de la marca. Esa combinación no la tiene nadie más.",
  signature: BRAND.signature,
} as const;

// ── Utilidades de formato ───────────────────────────────────────────────────

/** Miles con punto, como se escribe en Colombia. */
export function formatCo(value: number): string {
  return new Intl.NumberFormat("es-CO").format(Math.round(value));
}

/** Suma de la descomposición. Debe cuadrar con `BIG_NUMBER.value`. */
export function breakdownTotal(): number {
  return BIG_NUMBER.breakdown.reduce((acc, part) => acc + part.value, 0);
}

/** Ruta pública de una captura congelada. */
export function evidenceSrc(slug: EvidenceSlug): string {
  return `${EVIDENCE_DIR}/${slug}.webp`;
}
