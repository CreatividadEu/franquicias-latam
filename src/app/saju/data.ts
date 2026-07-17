/**
 * SAJÚ landing — content source of truth.
 * Copy & numbers verified against scripts/update-saju-landing.ts. No invented stats.
 */

export const SAJU = {
  slug: "saju",
  estYear: "2017",

  hero: {
    eyebrow: "El mono es el original · est. 2017",
    // The struck phrase is the bucket-list item being crossed off.
    headlineBefore: "Tacha ",
    headlineStrike: "abrir Sajú en tu país",
    headlineAfter: " con Nosotros.",
    subhead:
      "La marca de gafas de Colombia que se está convirtiendo en la número 1 de LATAM. Abrimos Franquicia Master para los principales mercados de la región.",
    primaryCta: "Aplica a la franquicia",
    secondaryCta: "Ver la oportunidad",
    cobrand: "Una oportunidad de franquicia presentada por Franquicias LATAM",
  },

  ideal: {
    eyebrow: "La filosofía",
    title: "Vivamos la vida tachando sueños de la lista de pendientes.",
    body: "Sajú arrancó hace más de 8 años como un chiste universitario: cuelga-gafas vendidos en una caja de zapatos. Hoy somos la marca de eyewear más relevante de Colombia. Esa es la vida que se vive tachando — y la lista apenas empieza.",
    checklist: [
      { label: "Caja de zapatos vendiendo cuelga-gafas", done: true },
      { label: "Ferias, tiendas multimarca, experimentos", done: true },
      { label: "Tienda propia y modelo de franquicia", done: true },
      { label: "16 tiendas entre Colombia, Costa Rica y Venezuela", done: true },
      { label: "Franquicias Master en los principales países de LATAM", done: false },
      { label: "100 tiendas · marca No.1 de gafas de LATAM", done: false },
    ],
  },

  track: {
    eyebrow: "Track record",
    title: "Una marca que ya demostró que sabe tachar.",
    timeline: [
      { year: "2017", text: "Nace Sajú en Colombia. Cuelga-gafas en una caja de zapatos." },
      { year: "2020", text: "Forbes nos elige entre las 25 empresas más resilientes durante la pandemia." },
      { year: "2023", text: "1er lugar en el programa de PYMEs de FedEx, entre +2.200 empresas." },
      { year: "2026", text: "16 tiendas operando · Franquicia Master abierta para LATAM." },
    ],
    awards: [
      { kicker: "Forbes", text: "25 empresas más resilientes durante la pandemia" },
      { kicker: "FedEx", text: "1er lugar entre +2.200 PYMEs" },
    ],
    collabs: [
      "James Rodríguez",
      "Simón Vargas",
      "Marcela García",
      "Camila Cisneros",
      "Adidas",
      "MINI",
      "Cerveza Corona",
    ],
    reel: {
      label: "Sajú en acción",
      permalink: "https://www.instagram.com/reel/DZLnJ-ftJek/",
    },
  },

  product: {
    eyebrow: "Producto & experiencia",
    title: "Orgullosamente tropical, seriamente óptico.",
    lines: [
      { name: "Plástico Reciclado", note: "Garantía 705 días" },
      { name: "Bio Acetato", note: "Garantía 365 días" },
      { name: "Aluminio Reciclado", note: "Línea premium" },
      { name: "Línea Deportiva", note: "Diseño propio · próximamente" },
    ],
    experience: {
      title: "Sajú Experience",
      body: "Personalización pre-fabricada que se ensambla en el back end: 4 marcos × 8 colores de patas × 8 colores de marco × 8 colores de lente.",
    },
    lensesBar: {
      title: "Lenses Bar",
      body: "Lentes formulados en 20 minutos, que resuelven el 80% del Pareto de clientes ópticos de visión sencilla.",
    },
    stats: [
      { value: "~$110", label: "Ticket promedio (4× desde el inicio)" },
      { value: "20 min", label: "Lentes formulados en el Lenses Bar" },
      { value: "80%", label: "del Pareto de clientes ópticos de visión sencilla en el Lenses Bar" },
      { value: "2.048", label: "Combinaciones en Sajú Experience" },
    ],
  },

  opportunity: {
    eyebrow: "La oportunidad LATAM",
    title: "El plan: ser la marca No.1 de gafas de LATAM.",
    goal: "100 tiendas en 10 años",
    markets: [
      { rank: "01", name: "República Dominicana" },
      { rank: "02", name: "Perú" },
      { rank: "03", name: "Ecuador" },
      { rank: "04", name: "Panamá" },
      { rank: "05", name: "Chile" },
    ],
    stats: [
      { value: "16", label: "tiendas operando hoy" },
      { value: "3", label: "países: Colombia, Costa Rica, Venezuela" },
    ],
  },

  models: {
    eyebrow: "Modelos de tienda",
    title: "Tres formatos. Una sola obsesión por el detalle.",
    cards: [
      {
        name: "Experience Store",
        tag: "Flagship",
        range: "$100K – $150K",
        size: "50 – 70 m²",
        featured: true,
        breakdown: [
          ["Obra civil", "$50K – $60K"],
          ["Equipos ópticos", "$35K"],
          ["Sajú Experience", "$15K"],
          ["Lenses Bar", "$40K"],
        ],
      },
      {
        name: "Tienda en Centro Comercial",
        tag: "Mall",
        range: "$85K – $100K",
        size: "30 – 50 m²",
        featured: false,
        breakdown: [
          ["Obra civil", "$50K – $60K"],
          ["Equipos ópticos", "$35K – $40K"],
        ],
      },
      {
        name: "Isla / Corner",
        tag: "Entrada",
        range: "$35K – $50K",
        size: "15 – 40 m²",
        featured: false,
        breakdown: [["Obra civil", "$35K – $50K"]],
      },
    ],
    disclaimer: "Montos en USD. CAPEX referencial — el desglose final depende del mercado y la ubicación.",
  },

  deal: {
    eyebrow: "El deal",
    title: "Franquicia Master.",
    rows: [
      {
        k: "Fee de entrada",
        v: "Desde $100.000 USD",
        note: "Por territorio estándar, sin límite de tiendas.",
      },
      {
        k: "Royalties",
        v: "7%",
        note: "Sobre las ventas del territorio.",
      },
      {
        k: "Fondo de publicidad",
        v: "3%",
        note: "Branding global y redes desde la matriz; marketing local en conjunto con tu equipo.",
      },
      {
        k: "Exclusividad",
        v: "100% de canales",
        note: "Retail físico, e-commerce, B2B, corporativos y alianzas en todo el territorio.",
      },
    ],
    profile: {
      title: "¿A quién buscamos?",
      body: "Empresarios con track record construyendo negocios, capital para invertir y red local relevante — alguien que conoce los eventos, influenciadores y marcas en tendencia de su mercado.",
      proof: "Nuestros masters actuales son exactamente ese perfil: en Costa Rica, un emprendedor gastronómico con más de 10 sucursales de su propia marca; en Venezuela, un grupo restaurantero con varias marcas líderes en su mercado.",
    },
  },

  podcast: {
    eyebrow: "Táchalo · El podcast",
    titleBefore: "Historias de gente que vive ",
    titleStrike: "tachando",
    titleAfter: ".",
    body: "Táchalo es el podcast de Sajú: conversaciones con fundadores, deportistas y creadores que se atrevieron a tachar sueños de su lista de pendientes. La misma filosofía de la marca, en voz alta.",
    youtubeChannel: "https://www.youtube.com/@tachalo?sub_confirmation=1",
    youtubeCta: "Suscríbete en YouTube",
    episodes: [
      {
        id: "woDl3TVRkjY",
        kicker: "Táchalo Podcast",
        title: "Lo mejor que he hecho en mi vida es reproducirme",
      },
      {
        id: "MKMWJVVWFME",
        kicker: "Episodio 16",
        title: "Egan Bernal — Ganar el Tour de Francia y el Giro de Italia",
      },
      {
        id: "euuL1r59B0c",
        kicker: "Episodio 13",
        title: "Isabella Espinosa (BAOBAB) — Vender bikinis en todos los continentes",
      },
      {
        id: "VLiMgEOa-CA",
        kicker: "Episodio 40",
        title: "David Molina — Meditar en silencio durante 10 días seguidos",
      },
    ],
    spotify: {
      title: "Escúchalo en Spotify.",
      body: "Todos los episodios, también en audio. Síguelo para no perderte ninguna historia.",
      showUrl: "https://open.spotify.com/show/6ouh4evTFLJ494S9Xs6WhT",
      embedUrl: "https://open.spotify.com/embed/show/6ouh4evTFLJ494S9Xs6WhT?utm_source=generator&theme=0",
      cta: "Seguir en Spotify",
    },
  },

  faqs: [
    {
      q: "¿En qué países están abriendo Franquicia Master?",
      a: "Priorizamos países hispanohablantes de LATAM. Los primeros mercados objetivo son República Dominicana, Perú, Ecuador, Panamá y Chile. También estamos abiertos a explorar El Salvador y Argentina. Estados Unidos y México son casos especiales y no son foco en esta primera ola.",
    },
    {
      q: "¿Cuál es la inversión total para abrir una franquicia SAJÚ?",
      a: "Depende del formato. Experience Store: $100K–$150K USD (50–70 m²). Tienda en Centro Comercial: $85K–$100K USD (30–50 m²). Isla / Corner: $35K–$50K USD (15–40 m²). A esto se suma el fee de entrada de la Franquicia Master, que arranca en $100.000 USD para territorios estándar.",
    },
    {
      q: "¿Cuáles son los royalties y el fee del fondo de publicidad?",
      a: "Royalties: 7% sobre las ventas del territorio. Fondo de publicidad: 3%. Las condiciones detalladas se revisan directamente con cada candidato durante el proceso.",
    },
    {
      q: "¿Cuántas tiendas debo abrir como Franquicia Master?",
      a: "Inicialmente trabajamos con un objetivo de 5 tiendas para el territorio, pero no es un techo. A más tiendas, mejor para todos: hay mark-up en el producto y royalties sobre ventas, así que el upside está alineado entre la marca y el franquiciado.",
    },
    {
      q: "¿Qué incluye la Franquicia Master?",
      a: "Exclusividad sobre todos los canales de la marca en el territorio: retail físico, ventas online, B2B, corporativos para marcas y alianzas. Trabajamos el marketing local en conjunto con tu equipo, manteniendo el branding global y las redes sociales desde la matriz en Colombia.",
    },
    {
      q: "¿Qué perfil de franquiciado buscan?",
      a: "Empresarios o emprendedores con experiencia construyendo negocios, capital para inversión y red local relevante. Idealmente alguien que entienda muy bien su mercado local — eventos, influenciadores, lugares y marcas en tendencia. Nuestros masters actuales son perfiles de este tipo: un emprendedor gastronómico con más de 10 sucursales en Costa Rica y un grupo restaurantero con marcas líderes en Venezuela.",
    },
    {
      q: "¿Cuál es el ticket promedio y la propuesta de producto?",
      a: "Ticket promedio actual: ~$110 USD. Tres líneas de gafas: Plástico Reciclado, Bio Acetato y Aluminio Reciclado, con una línea deportiva en lanzamiento. Sumamos el Lenses Bar, que entrega lentes formulados en 20 minutos al 80% del Pareto de clientes ópticos de visión sencilla. El Sajú Experience permite personalizar gafas combinando 4 marcos, 8 colores de patas, 8 colores de marco y 8 colores de lente.",
    },
    {
      q: "¿Qué tipo de ubicaciones funcionan mejor: calle o centro comercial?",
      a: "Ambas funcionan. En Colombia operamos tiendas a pie de calle y en centros comerciales con buenos resultados en ambos formatos. La estrategia puntual depende del mercado: el franquiciado local define la mezcla óptima junto con el equipo SAJÚ.",
    },
    {
      q: "¿Qué credenciales respaldan la marca?",
      a: "Forbes nos seleccionó como una de las 25 empresas más resilientes durante la pandemia. Ganamos el primer lugar en el programa de PYMEs de FedEx entre más de 2.200 empresas. Hemos colaborado con James Rodríguez, Simón Vargas, Marcela García y Camila Cisneros, y con marcas líderes como Adidas, MINI y Cerveza Corona.",
    },
  ],

  countries: [
    "República Dominicana",
    "Perú",
    "Ecuador",
    "Panamá",
    "Chile",
    "El Salvador",
    "Argentina",
    "Colombia",
    "Costa Rica",
    "México",
    "Estados Unidos",
    "Otro",
  ],

  investmentRanges: ["$35K – $50K", "$50K – $100K", "$100K – $150K", "$150K+"],

  referralOptions: [
    "Instagram (@saju)",
    "TikTok",
    "Búsqueda en Google",
    "Franquicias LATAM",
    "Un conocido / referido",
    "Prensa / medios",
    "Otro",
  ],

  social: {
    instagram: "https://instagram.com/saju",
    youtube: "https://youtube.com/@tachalo",
    spotify: "https://open.spotify.com/show/6ouh4evTFLJ494S9Xs6WhT",
    tiktok: "https://tiktok.com/@losdesaju",
  },
} as const;

export type SajuContent = typeof SAJU;
