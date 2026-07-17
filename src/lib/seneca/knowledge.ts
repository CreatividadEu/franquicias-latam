// Seneca Int. — base de conocimiento comercial de Bamicol.
// Bamicol: importador de electrodomésticos de alta gama en Colombia.
// Distribuidor exclusivo de Fhiaba, Bertazzoni, Franke y Teka; portafolio
// con Sub-Zero, Wolf y Cove. Atiende hogar (residencial) y HORECA.
// Los textos usan el token {client}, reemplazado por el motor.

import type { Buyer, Objection, Pain, ProductMatch, SegmentId } from './types';

export interface SegmentKnowledge {
  id: SegmentId;
  label: string;
  shortLabel: string;
  subVerticals: string[];
  ticketRange: string;
  baseScore: number;
  summary: string;
  painsLabel: string;
  buyersLabel: string;
  pains: Pain[];
  buyers: Buyer[];
  products: ProductMatch[];
  signals: string[];
  opener: string;
  discovery: string[];
  objections: Objection[];
  nextSteps: string[];
}

export const BRAND_PORTFOLIO = [
  { brand: 'Sub-Zero', focus: 'Refrigeración de lujo: columnas, cavas de vino, conservación de precisión' },
  { brand: 'Wolf', focus: 'Cocción profesional para el hogar: estufas, hornos, módulos' },
  { brand: 'Cove', focus: 'Lavado premium: lavavajillas de alto desempeño' },
  { brand: 'Fhiaba', focus: 'Refrigeración italiana premium, integrable a paneles (exclusivo Bamicol)' },
  { brand: 'Bertazzoni', focus: 'Cocción italiana de diseño, color y carácter (exclusivo Bamicol)' },
  { brand: 'Franke', focus: 'Fregaderos, griferías, campanas y sistemas foodservice/café (exclusivo Bamicol)' },
  { brand: 'Teka', focus: 'Línea built-in premium accesible, ideal para proyectos en volumen (exclusivo Bamicol)' },
] as const;

export const SEGMENTS: Record<SegmentId, SegmentKnowledge> = {
  horeca: {
    id: 'horeca',
    label: 'HORECA — Hoteles, restaurantes y cafés',
    shortLabel: 'HORECA',
    subVerticals: ['Hotel boutique / cadena', 'Grupo gastronómico', 'Café de especialidad', 'Catering y eventos', 'Club privado'],
    ticketRange: 'COP 120M – 900M por cocina o locación',
    baseScore: 82,
    summary:
      '{client} opera en hospitalidad, donde cada minuto de cocina detenida es servicio perdido y reputación en juego. Compra equipos como inversión de operación continua: fiabilidad, cadena de frío y respaldo técnico pesan más que el precio de lista. Bamicol entra como socio de operación, no como proveedor de catálogo.',
    painsLabel: 'Dolores de la operación',
    buyersLabel: 'Comité de compra',
    pains: [
      {
        title: 'Paradas de cocina en horas pico',
        detail: 'Una falla de equipo en servicio significa mesas sin atender, delivery cancelado y reseñas negativas la misma noche.',
        severity: 5,
        solution: 'Equipos de grado profesional (Wolf, Franke Foodservice) con postventa y repuestos gestionados localmente por Bamicol: menos fallas y recuperación en horas, no semanas.',
      },
      {
        title: 'Cadena de frío inconsistente y mermas',
        detail: 'Refrigeración imprecisa daña proteínas, lácteos y vinos costosos; la merma se come el margen del food cost.',
        severity: 5,
        solution: 'Refrigeración de precisión Sub-Zero y Fhiaba: control de temperatura y humedad por zona que protege el inventario más caro de la operación.',
      },
      {
        title: 'Costo energético creciente',
        detail: 'Equipos viejos o de gama media disparan la factura de energía en operaciones 16/7.',
        severity: 3,
        solution: 'Portafolio con eficiencia energética certificada; Bamicol modela el ahorro mensual vs. el parque actual como parte de la propuesta.',
      },
      {
        title: 'Capacidad insuficiente en picos de demanda',
        detail: 'La cocina actual no responde a temporada alta, eventos o crecimiento de delivery sin sacrificar tiempos ni calidad.',
        severity: 4,
        solution: 'Diseño de línea de cocción de alto rendimiento (Wolf, Franke) dimensionada con el chef para el menú y el volumen real.',
      },
      {
        title: 'Exigencias sanitarias y de certificación',
        detail: 'Inspecciones sanitarias y estándares de cadena exigen equipos certificados y trazabilidad de mantenimiento.',
        severity: 3,
        solution: 'Marcas con certificaciones internacionales y plan de mantenimiento documentado por Bamicol para auditorías.',
      },
    ],
    buyers: [
      {
        role: 'Propietario / Socio',
        title: 'Dueño o junta del grupo',
        power: 'decisor',
        cares: 'Retorno por asiento, imagen de marca, continuidad de la operación.',
        angle: 'ROI: menos mermas + menos paradas + energía = la inversión se paga sola. Casos de referencia en hospitalidad premium.',
      },
      {
        role: 'Chef ejecutivo',
        title: 'Líder de cocina',
        power: 'influenciador',
        cares: 'Rendimiento real del equipo, precisión, ergonomía de la línea.',
        angle: 'Demo técnica en showroom: que cocine sobre Wolf y compare. El chef convencido vende adentro mejor que cualquier propuesta.',
      },
      {
        role: 'Gerente de A&B / Compras',
        title: 'Alimentos y bebidas',
        power: 'bloqueador',
        cares: 'Presupuesto, comparativos, condiciones de pago y garantía.',
        angle: 'TCO a 5 años vs. precio de lista; financiación y garantía extendida. Convertir el comparativo en costo total, no precio unitario.',
      },
      {
        role: 'Jefe de mantenimiento',
        title: 'Ingeniería / mantenimiento',
        power: 'usuario',
        cares: 'Disponibilidad de repuestos, tiempos de respuesta técnica, capacitación.',
        angle: 'SLA de servicio Bamicol: técnicos certificados y stock local de repuestos. Es su seguro ante la gerencia.',
      },
    ],
    products: [
      { brand: 'Franke', line: 'Foodservice Systems y soluciones de café', why: 'Estándar global en cocinas profesionales y programas de café de cadena; exclusivo de Bamicol en Colombia.', tag: 'Núcleo de cocina' },
      { brand: 'Wolf', line: 'Cocción de alto rendimiento', why: 'Potencia y precisión de grado profesional para líneas calientes exigentes.', tag: 'Línea caliente' },
      { brand: 'Sub-Zero', line: 'Refrigeración y cavas de vino', why: 'Conservación de precisión para proteínas premium y programas de vino.', tag: 'Cadena de frío' },
      { brand: 'Fhiaba', line: 'Refrigeración profesional italiana', why: 'Frío de precisión con formato flexible para barras, pastelería y mise en place.', tag: 'Frío especializado' },
    ],
    signals: [
      'La gastronomía premium en Colombia crece sobre el turismo de alto gasto en Bogotá, Medellín y Cartagena.',
      'Los grupos gastronómicos renuevan cocinas al abrir formatos nuevos: la apertura es el momento de entrada.',
      'Reseñas que mencionen demoras o inconsistencia del menú suelen delatar cuellos de botella de equipo en {client}.',
    ],
    opener:
      'Hola, le escribo de Bamicol, importadores para Colombia de Franke, Wolf y Sub-Zero. Trabajamos con operaciones de hospitalidad como {client} para eliminar dos costos silenciosos: mermas por frío impreciso y paradas de cocina en servicio. ¿Le parece si coordinamos 20 minutos con su chef ejecutivo para revisar la línea actual? Sin compromiso: si no encontramos ahorro, se los decimos.',
    discovery: [
      '¿Cuántos servicios pierden al mes por fallas o mantenimiento de equipos?',
      '¿Cómo miden hoy la merma por refrigeración y cuánto representa del food cost?',
      '¿Qué planes de apertura o renovación tienen en los próximos 12 meses?',
      '¿Quién decide la inversión en cocina: propiedad, gerencia o el chef?',
      '¿Qué experiencia han tenido con el servicio técnico de sus marcas actuales?',
    ],
    objections: [
      {
        objection: '“Los equipos importados premium están fuera de nuestro presupuesto.”',
        response: 'Comparemos costo total a 5 años: energía, mermas, paradas y vida útil. El premium bien elegido suele ser el más barato por servicio prestado. Además estructuramos la compra por fases, empezando por el cuello de botella.',
      },
      {
        objection: '“Ya tenemos proveedor de equipos.”',
        response: 'Perfecto: no pedimos reemplazarlo, pedimos comparar. Una visita técnica gratuita a su cocina y un comparativo de línea crítica. Si su proveedor gana, ganan ustedes igual.',
      },
      {
        objection: '“Si se daña un equipo importado, el repuesto tarda meses.”',
        response: 'Ese es justamente nuestro diferencial: Bamicol mantiene inventario local de repuestos y técnicos certificados en Colombia. Firmamos SLA de respuesta por contrato.',
      },
    ],
    nextSteps: [
      'Agendar visita técnica a la cocina principal con el chef ejecutivo.',
      'Levantar parque actual de equipos y puntos de falla frecuentes.',
      'Presentar comparativo TCO 5 años + propuesta por fases.',
      'Invitar al comité a demo de cocción en showroom Bamicol.',
    ],
  },

  construccion: {
    id: 'construccion',
    label: 'Construcción — Proyectos inmobiliarios',
    shortLabel: 'Construcción',
    subVerticals: ['Constructora / promotora', 'Proyecto residencial premium', 'Torre de vivienda en preventa', 'Desarrollo de usos mixtos'],
    ticketRange: 'COP 400M – 3.000M por proyecto',
    baseScore: 86,
    summary:
      '{client} vende metros cuadrados en un mercado donde la cocina es el argumento de cierre de la sala de ventas. Un paquete de electrodomésticos con marca reconocida sube el valor percibido por m² y acelera la preventa. Bamicol entra como aliado de especificación: paquetes escalonados por torre, logística sincronizada con el cronograma de obra y postventa centralizada que protege la reputación del proyecto.',
    painsLabel: 'Dolores del proyecto',
    buyersLabel: 'Comité de compra',
    pains: [
      {
        title: 'Diferenciación en preventa',
        detail: 'Los proyectos compiten por el mismo comprador premium; el acabado de cocina define la percepción de lujo en la sala de ventas.',
        severity: 5,
        solution: 'Paquetes de marca (Bertazzoni, Teka, Sub-Zero en penthouses) que la sala de ventas puede nombrar y mostrar: la marca del electrodoméstico vende el apartamento.',
      },
      {
        title: 'Cronograma de entregas vs. importación',
        detail: 'Un lote de equipos retrasado detiene entregas de unidades y dispara penalidades con compradores.',
        severity: 5,
        solution: 'Logística de importación programada por hitos de obra: Bamicol confirma producción y tránsito por torre, con inventario de contingencia local.',
      },
      {
        title: 'Postventa de unidades entregadas',
        detail: 'Cada reclamo de propietario por un electrodoméstico vuelve como PQR contra la constructora durante años.',
        severity: 4,
        solution: 'Garantía y servicio directo Bamicol al propietario final: los reclamos salen del pasivo de la constructora.',
      },
      {
        title: 'Compatibilidad técnica en diseño',
        detail: 'Voltajes, gas, extracción y medidas definidas tarde generan reprocesos costosos en obra blanca.',
        severity: 4,
        solution: 'Acompañamiento de especificación desde planos: fichas técnicas, requerimientos eléctricos y de ventilación entregados al equipo de diseño.',
      },
      {
        title: 'Presupuesto por estrato de producto',
        detail: 'El mismo proyecto necesita cocinas competitivas en torre estándar y memorables en penthouse sin romper el presupuesto.',
        severity: 3,
        solution: 'Mix escalonado del portafolio: Teka en volumen, Bertazzoni como diferenciador visible, Sub-Zero/Wolf en unidades insignia.',
      },
    ],
    buyers: [
      {
        role: 'Gerente de proyecto',
        title: 'Dirección del proyecto',
        power: 'decisor',
        cares: 'Cronograma, presupuesto, cero sorpresas en entregas.',
        angle: 'Plan de suministro por hitos con fechas comprometidas y contingencia local. El electrodoméstico deja de ser un riesgo de ruta crítica.',
      },
      {
        role: 'Director de compras',
        title: 'Abastecimiento',
        power: 'bloqueador',
        cares: 'Precio por unidad, condiciones de pago, comparables.',
        angle: 'Negociar por paquete de proyecto, no por unidad: volumen + exclusividades de marca = precio que ningún retail iguala.',
      },
      {
        role: 'Arquitecto / especificador',
        title: 'Diseño del proyecto',
        power: 'influenciador',
        cares: 'Estética, integración a mobiliario, fichas técnicas a tiempo.',
        angle: 'Biblioteca de especificación Bamicol: medidas, paneles integrables Fhiaba, renders y muestras físicas para la sala de ventas.',
      },
      {
        role: 'Gerente comercial del proyecto',
        title: 'Sala de ventas',
        power: 'influenciador',
        cares: 'Argumentos de cierre, velocidad de preventa, valor por m².',
        angle: 'La marca del electrodoméstico como material de venta: apartamento modelo equipado + kit de marca para asesores.',
      },
    ],
    products: [
      { brand: 'Teka', line: 'Paquetes built-in para volumen', why: 'Marca europea reconocida con precio de proyecto: equipa torres completas sin sacrificar percepción premium.', tag: 'Volumen' },
      { brand: 'Bertazzoni', line: 'Cocción italiana de diseño', why: 'El diferenciador visible en la sala de ventas: diseño italiano con historia de marca que los asesores pueden contar.', tag: 'Diferenciador' },
      { brand: 'Franke', line: 'Fregaderos, griferías y campanas', why: 'Completa la especificación de cocina con una sola cadena de suministro y garantía.', tag: 'Especificación' },
      { brand: 'Sub-Zero + Wolf', line: 'Unidades insignia', why: 'Penthouse y apartamentos modelo: el estándar de lujo global que ancla el precio por m² de todo el proyecto.', tag: 'Insignia' },
    ],
    signals: [
      'La vivienda premium en Colombia sostiene demanda pese a los ciclos de tasa: el comprador de lujo es menos sensible al crédito.',
      'Las salas de ventas destacan cada vez más marcas de cocina y amenities como argumento de cierre.',
      'Si {client} tiene proyectos en preventa, la ventana de especificación de cocinas está abierta ahora: después de obra gris, cambiar es costoso.',
    ],
    opener:
      'Hola, le escribo de Bamicol, importadores exclusivos para Colombia de Teka, Bertazzoni y Franke, y representantes de Sub-Zero y Wolf. Ayudamos a proyectos como los de {client} a subir el valor percibido por m² con paquetes de cocina por torre —volumen, diferenciador e insignia— sincronizados con el cronograma de obra y con postventa directa al propietario. ¿Coordinamos una reunión de especificación con su equipo de diseño y compras?',
    discovery: [
      '¿Qué proyectos tienen en preventa o por iniciar obra blanca en los próximos 18 meses?',
      '¿Cómo definieron el paquete de cocina del último proyecto y qué reclamos de postventa dejó?',
      '¿La sala de ventas usa hoy la marca de electrodomésticos como argumento de cierre?',
      '¿Quién especifica: diseño interno, taller de arquitectura externo o el fabricante de cocinas?',
      '¿Qué margen de cronograma manejan entre pedido de importación y entrega de unidades?',
    ],
    objections: [
      {
        objection: '“Compramos por licitación al mejor precio unitario.”',
        response: 'Coticemos como paquete de proyecto con exclusividades incluidas: volumen + marcas que solo distribuye Bamicol. Y sumemos al comparativo lo que hoy pagan en PQR de postventa, que nuestro modelo elimina.',
      },
      {
        objection: '“Los importados nos han incumplido fechas de entrega.”',
        response: 'Por eso trabajamos con plan de suministro por hitos firmado: producción confirmada, tránsito monitoreado y stock de contingencia en Colombia. La fecha de entrega es cláusula, no promesa.',
      },
      {
        objection: '“El comprador colombiano no paga extra por marca de electrodoméstico.”',
        response: 'El comprador premium sí, y es su comprador. Hagamos la prueba en el apartamento modelo: equipémoslo y midamos el efecto en cierres del trimestre.',
      },
    ],
    nextSteps: [
      'Reunión de especificación con diseño y compras del proyecto activo.',
      'Propuesta de paquete por torre: volumen / diferenciador / insignia.',
      'Equipar apartamento modelo como piloto comercial.',
      'Definir plan de suministro por hitos y esquema de postventa directa.',
    ],
  },

  diseno: {
    id: 'diseno',
    label: 'Arquitectura y diseño interior',
    shortLabel: 'Diseño',
    subVerticals: ['Estudio de arquitectura', 'Diseño interior residencial', 'Fabricante de cocinas a medida', 'Interiorismo comercial'],
    ticketRange: 'COP 80M – 500M por proyecto',
    baseScore: 78,
    summary:
      '{client} vive de la confianza de clientes exigentes: cada proyecto es su portafolio. Especificar marcas globales con respaldo local le quita riesgo reputacional y le da material de diseño (medidas, paneles, acabados) para proyectar sin sorpresas. Para Bamicol, cada estudio como {client} es un canal multiplicador: un especificador convencido trae todos sus proyectos futuros.',
    painsLabel: 'Dolores del estudio',
    buyersLabel: 'Mapa de influencia',
    pains: [
      {
        title: 'Clientes que exigen marcas globales',
        detail: 'El cliente final llega con referentes internacionales y espera que el estudio los consiga con garantía local.',
        severity: 4,
        solution: 'Portafolio Sub-Zero, Wolf, Fhiaba y Bertazzoni disponible en Colombia vía Bamicol, con garantía y servicio locales que el estudio puede prometer sin riesgo.',
      },
      {
        title: 'Integración estética y dimensional',
        detail: 'Medidas americanas vs. europeas, paneles, tiros de extracción: los errores se descubren en obra, tarde y caro.',
        severity: 5,
        solution: 'Acompañamiento técnico de especificación: fichas, despieces y verificación de planos antes de fabricar mobiliario. Fhiaba y Teka integrables a panel.',
      },
      {
        title: 'Riesgo reputacional por postventa ajena',
        detail: 'Si el electrodoméstico falla, el cliente no llama a la marca: llama al estudio que lo recomendó.',
        severity: 4,
        solution: 'Postventa directa Bamicol al cliente final con SLA. El estudio recomienda y Bamicol responde.',
      },
      {
        title: 'Cronogramas rotos por importación',
        detail: 'Un equipo que llega tarde detiene la instalación de toda la cocina y la entrega del proyecto.',
        severity: 4,
        solution: 'Confirmación de inventario y tiempos reales antes de especificar; reservas de producto contra cronograma de obra.',
      },
      {
        title: 'Cerrar al cliente final sin experiencia de producto',
        detail: 'Vender una cocina de COP 300M sobre un PDF es difícil: el cliente necesita tocar el producto.',
        severity: 3,
        solution: 'Showroom Bamicol como extensión del estudio: visitas privadas para sus clientes, con el estudio como anfitrión.',
      },
    ],
    buyers: [
      {
        role: 'Socio director',
        title: 'Dirección del estudio',
        power: 'decisor',
        cares: 'Reputación, relación de largo plazo, condiciones para especificadores.',
        angle: 'Programa de especificadores: atención prioritaria, condiciones preferentes y postventa que protege el nombre del estudio.',
      },
      {
        role: 'Diseñador de proyecto',
        title: 'Líder del proyecto activo',
        power: 'influenciador',
        cares: 'Fichas técnicas confiables, muestras, respuesta rápida.',
        angle: 'Biblioteca técnica completa y un asesor Bamicol asignado que responde en horas, no días.',
      },
      {
        role: 'Cliente final del estudio',
        title: 'Propietario del proyecto',
        power: 'decisor',
        cares: 'Estatus, diseño, garantía real en Colombia.',
        angle: 'Experiencia de showroom curada junto al estudio: el cliente decide frente al producto, no frente al catálogo.',
      },
      {
        role: 'Fabricante de mobiliario',
        title: 'Taller / carpintería',
        power: 'bloqueador',
        cares: 'Medidas exactas, tiempos de llegada del equipo, holguras.',
        angle: 'Despieces y plantillas de instalación entregados antes de fabricar: cero reprocesos en obra.',
      },
    ],
    products: [
      { brand: 'Sub-Zero + Wolf + Cove', line: 'Cocina signature completa', why: 'El trío de lujo americano para proyectos insignia: refrigeración, cocción y lavado con un solo estándar.', tag: 'Proyecto insignia' },
      { brand: 'Fhiaba', line: 'Refrigeración integrable', why: 'Frío italiano de precisión que desaparece tras paneles: el favorito del diseño minimalista.', tag: 'Integración total' },
      { brand: 'Bertazzoni', line: 'Cocción de color y carácter', why: 'Para proyectos donde la cocina es protagonista: diseño italiano con paleta de color.', tag: 'Declaración de diseño' },
      { brand: 'Franke', line: 'Fregaderos y griferías de diseño', why: 'Cierra la especificación con acabados coherentes y una sola garantía.', tag: 'Acabados' },
    ],
    signals: [
      'El diseño interior premium en Colombia se concentra en pocos estudios con alta recurrencia: canal pequeño, valor de vida altísimo.',
      'Los estudios publican sus proyectos en redes: las cocinas especificadas son visibles y auditables.',
      'Si {client} publica proyectos residenciales de alto nivel, ya está especificando marcas de este segmento — la pregunta es con qué respaldo.',
    ],
    opener:
      'Hola, le escribo de Bamicol, representantes en Colombia de Sub-Zero, Wolf, Fhiaba y Bertazzoni. Vimos el trabajo de {client} y queremos proponerles nuestro programa de especificadores: biblioteca técnica completa, asesor asignado, showroom disponible para sus clientes y postventa directa que protege el nombre del estudio. ¿Les invitamos un café en el showroom para conocerlo?',
    discovery: [
      '¿Qué marcas de electrodomésticos están especificando hoy y a través de quién?',
      '¿Han tenido problemas de medidas, tiempos o postventa con equipos importados?',
      '¿Cómo presentan hoy la cocina al cliente final: catálogo, render, showroom de terceros?',
      '¿Cuántos proyectos residenciales premium manejan al año?',
      '¿Qué necesitarían de un aliado técnico para especificar con tranquilidad?',
    ],
    objections: [
      {
        objection: '“Ya compramos directo afuera / el cliente importa por su cuenta.”',
        response: 'Importar directo ahorra en factura y cuesta en garantía: sin respaldo local, cada falla es un vuelo técnico o un equipo huérfano. Con Bamicol el precio es competitivo y la garantía es local y transferible al cliente.',
      },
      {
        objection: '“Preferimos no casarnos con un solo distribuidor.”',
        response: 'No pedimos exclusividad: pedimos ser su opción para las marcas que solo nosotros representamos en Colombia. En Fhiaba, Bertazzoni, Franke y Teka, no hay otra puerta con garantía oficial.',
      },
      {
        objection: '“Nuestros tiempos de proyecto no aguantan importaciones.”',
        response: 'Por eso confirmamos inventario local o fecha real de tránsito antes de que especifiquen, y reservamos producto contra su cronograma. Nunca especifican a ciegas.',
      },
    ],
    nextSteps: [
      'Visita del estudio al showroom Bamicol (agenda privada).',
      'Entregar biblioteca técnica y asignar asesor de especificación.',
      'Revisar en conjunto un proyecto activo como piloto.',
      'Formalizar condiciones del programa de especificadores.',
    ],
  },

  retail: {
    id: 'retail',
    label: 'Retail y distribución especializada',
    shortLabel: 'Retail',
    subVerticals: ['Tienda de cocinas y acabados', 'Retail de electrodomésticos', 'Distribuidor regional', 'Showroom multimarca'],
    ticketRange: 'COP 200M – 1.500M por sell-in de temporada',
    baseScore: 74,
    summary:
      '{client} compite en un retail donde la gama masiva deja margen mínimo y diferenciación nula. Un corner premium con marcas exclusivas cambia la economía de la tienda: tickets 10× y un motivo para que el cliente de alto poder entre. Bamicol ofrece marcas que nadie más puede vender en Colombia, con capacitación y material de exhibición incluidos.',
    painsLabel: 'Dolores del negocio',
    buyersLabel: 'Comité de compra',
    pains: [
      {
        title: 'Margen presionado por la gama masiva',
        detail: 'Las líneas de volumen se venden por precio contra grandes superficies: margen de un dígito y clientes sin lealtad.',
        severity: 5,
        solution: 'Mix premium con exclusividades Bamicol: márgenes superiores protegidos porque nadie más en el territorio vende esas marcas.',
      },
      {
        title: 'Sin diferenciación frente a grandes superficies',
        detail: 'El mismo portafolio que todos, decidido por precio: la tienda no tiene motivo de visita propio.',
        severity: 4,
        solution: 'Corner de marcas exclusivas (Fhiaba, Bertazzoni) como ancla de tráfico calificado y de identidad de tienda.',
      },
      {
        title: 'Inventario de alto valor inmovilizado',
        detail: 'Capital atado en unidades costosas de baja rotación asusta al comprador.',
        severity: 4,
        solution: 'Modelo de exhibición + venta sobre pedido con entrega Bamicol: se exhibe la experiencia, no se inmoviliza el inventario.',
      },
      {
        title: 'Fuerza de ventas sin formación técnica premium',
        detail: 'Vender un Sub-Zero requiere otra conversación: sin formación, el asesor baja al cliente a la gama media.',
        severity: 3,
        solution: 'Programa de certificación de asesores Bamicol: producto, discurso de valor y comisiones del segmento premium.',
      },
      {
        title: 'Postventa que quema la reputación',
        detail: 'Un reclamo mal atendido de un cliente premium destruye años de reputación local.',
        severity: 3,
        solution: 'Servicio técnico oficial Bamicol detrás de cada venta: el retail vende, la marca responde.',
      },
    ],
    buyers: [
      {
        role: 'Dueño / Gerente general',
        title: 'Dirección del negocio',
        power: 'decisor',
        cares: 'Margen total, rotación, riesgo de inventario.',
        angle: 'P&L del corner premium: margen por m² de exhibición vs. gama masiva. Modelo sobre pedido = riesgo de inventario cercano a cero.',
      },
      {
        role: 'Jefe de compras',
        title: 'Abastecimiento',
        power: 'bloqueador',
        cares: 'Condiciones comerciales, devoluciones, protección de precio.',
        angle: 'Exclusividad territorial + protección de margen por contrato: no compite contra el mismo producto en otra vitrina.',
      },
      {
        role: 'Jefe de piso / ventas',
        title: 'Operación comercial',
        power: 'usuario',
        cares: 'Argumentos de venta, comisiones, soporte en el cierre.',
        angle: 'Certificación + acompañamiento de un especialista Bamicol en los primeros cierres premium.',
      },
      {
        role: 'Marketing',
        title: 'Mercadeo y experiencia',
        power: 'influenciador',
        cares: 'Tráfico calificado, eventos, material de marca.',
        angle: 'Kit de lanzamiento del corner: evento con chef, material de las marcas y pauta cooperada.',
      },
    ],
    products: [
      { brand: 'Teka', line: 'Built-in premium de rotación', why: 'El punto de entrada premium con volumen real: rota y financia la vitrina.', tag: 'Rotación' },
      { brand: 'Bertazzoni', line: 'Cocción de diseño italiano', why: 'Producto vitrina que detiene al cliente: color y diseño que ninguna gama masiva ofrece.', tag: 'Vitrina' },
      { brand: 'Fhiaba', line: 'Refrigeración exclusiva', why: 'Solo disponible vía Bamicol: exclusividad real para el territorio del distribuidor.', tag: 'Exclusividad' },
      { brand: 'Franke', line: 'Fregaderos y griferías', why: 'Ticket complementario de alto margen en cada venta de cocina.', tag: 'Complemento' },
    ],
    signals: [
      'El segmento de electrodomésticos de lujo crece en Colombia por encima de la gama media.',
      'El comprador premium investiga marcas online y busca dónde verlas en persona: la vitrina física es el cierre.',
      'Si {client} tiene tráfico de remodeladores y constructores pequeños, el corner premium captura un ticket que hoy se va a Miami.',
    ],
    opener:
      'Hola, le escribo de Bamicol, importadores exclusivos para Colombia de Fhiaba, Bertazzoni, Franke y Teka. Estamos seleccionando pocos aliados de retail por territorio para nuestro corner premium: marcas que nadie más puede vender, modelo de exhibición sin inventario inmovilizado y certificación de su equipo. ¿Le interesa revisar el P&L del formato para su tienda?',
    discovery: [
      '¿Qué margen promedio deja hoy su categoría de electrodomésticos?',
      '¿Qué porcentaje de sus clientes pregunta por marcas premium que no manejan?',
      '¿Cuántos m² podrían destinar a un corner de experiencia?',
      '¿Cómo manejan hoy la postventa de líneas importadas?',
      '¿Qué territorio cubren y qué exclusividad necesitarían para invertir en el formato?',
    ],
    objections: [
      {
        objection: '“El producto premium no rota en mi zona.”',
        response: 'No necesita rotar como la gama media: un cierre premium al mes puede dejar el margen de veinte unidades masivas. Y el modelo sobre pedido elimina el costo de inventario mientras se prueba la demanda.',
      },
      {
        objection: '“No tengo capital para ese inventario.”',
        response: 'El formato es exhibición + venta sobre pedido: usted invierte en la experiencia de vitrina, Bamicol pone la logística de entrega. El capital inmovilizado es una fracción del sell-in tradicional.',
      },
      {
        objection: '“Mi equipo no sabe vender ese segmento.”',
        response: 'La certificación está incluida y acompañamos los primeros cierres con un especialista nuestro en su piso. El conocimiento queda instalado en su equipo.',
      },
    ],
    nextSteps: [
      'Presentar P&L del corner premium para su formato y territorio.',
      'Definir mix inicial de exhibición y condiciones de exclusividad.',
      'Certificar al equipo de ventas (programa Bamicol).',
      'Lanzamiento del corner con evento para clientes premium de la zona.',
    ],
  },

  corporativo: {
    id: 'corporativo',
    label: 'Corporativo — Oficinas y hospitality de empresa',
    shortLabel: 'Corporativo',
    subVerticals: ['Sede corporativa', 'Coworking premium', 'Sala VIP / hospitality', 'Family office'],
    ticketRange: 'COP 40M – 300M por sede',
    baseScore: 68,
    summary:
      '{client} invierte en espacios de trabajo y atención donde el café, la cocina de empleados y las salas de clientes comunican cultura y estatus. Los equipos de estas áreas fallan seguido porque se compran como electrodomésticos de hogar para uso intensivo. Bamicol resuelve con líneas de grado comercial (Franke Coffee, Teka) y mantenimiento multi-sede.',
    painsLabel: 'Dolores de la operación',
    buyersLabel: 'Comité de compra',
    pains: [
      {
        title: 'Equipos de hogar en uso comercial',
        detail: 'Cafeteras y hornos domésticos instalados en oficinas de cientos de personas fallan en meses.',
        severity: 4,
        solution: 'Sistemas de café profesional Franke y líneas de grado comercial dimensionadas para el tráfico real de la sede.',
      },
      {
        title: 'Experiencia de cliente en salas y hospitality',
        detail: 'La sala de juntas y el área VIP son la primera impresión de la empresa; un café mediocre la contradice.',
        severity: 3,
        solution: 'Estaciones de café y cavas de vino premium (Franke, Sub-Zero Wine) que elevan la experiencia de visita.',
      },
      {
        title: 'Mantenimiento disperso multi-sede',
        detail: 'Cada sede resuelve por su cuenta con proveedores distintos: costos opacos y calidad dispareja.',
        severity: 4,
        solution: 'Contrato único de mantenimiento Bamicol para todas las sedes, con SLA y reporte centralizado.',
      },
      {
        title: 'Bienestar y retención de talento',
        detail: 'Las áreas de comida y café son parte de la propuesta de valor al empleado en oficinas que compiten por talento.',
        severity: 2,
        solution: 'Kitchenettes Teka + estaciones de café de especialidad como amenity de bajo costo por empleado y alto impacto percibido.',
      },
    ],
    buyers: [
      {
        role: 'Gerente administrativo / Facilities',
        title: 'Administración de sedes',
        power: 'decisor',
        cares: 'Fiabilidad, mantenimiento, presupuesto anual.',
        angle: 'Costo total por sede con mantenimiento incluido: una factura, un SLA, cero apagones de café.',
      },
      {
        role: 'Compras',
        title: 'Abastecimiento corporativo',
        power: 'bloqueador',
        cares: 'Proceso, comparables, contrato marco.',
        angle: 'Contrato marco multi-sede con precios escalonados: estandariza y ahorra vs. compras dispersas.',
      },
      {
        role: 'Gerencia general / Talento humano',
        title: 'Dirección',
        power: 'influenciador',
        cares: 'Cultura, experiencia de empleado, imagen ante clientes.',
        angle: 'El área de café como símbolo visible de la cultura: caso antes/después con métricas de uso.',
      },
      {
        role: 'Recepción / hospitality interno',
        title: 'Atención a visitantes',
        power: 'usuario',
        cares: 'Facilidad de uso, velocidad, presentación.',
        angle: 'Equipos autoservicio profesionales: experiencia consistente sin depender de una persona dedicada.',
      },
    ],
    products: [
      { brand: 'Franke', line: 'Coffee Systems profesionales', why: 'Café de especialidad autoservicio con capacidad comercial real: el estándar en oficinas premium.', tag: 'Café' },
      { brand: 'Teka', line: 'Kitchenettes y áreas de empleados', why: 'Equipamiento built-in durable y uniforme para todas las sedes.', tag: 'Kitchenettes' },
      { brand: 'Sub-Zero', line: 'Cavas y refrigeración de hospitality', why: 'Salas VIP y atención a clientes de alto nivel: vinos y servicio impecables.', tag: 'Hospitality' },
    ],
    signals: [
      'El regreso a oficinas premium compite por talento con amenities: café y cocina encabezan la lista.',
      'Los coworkings de gama alta usan la estación de café como argumento comercial explícito.',
      'Si {client} está renovando o abriendo sedes, el equipamiento se decide con facilities antes de la mudanza.',
    ],
    opener:
      'Hola, le escribo de Bamicol, representantes en Colombia de Franke Coffee Systems y Teka. Equipamos áreas de café y cocinas de empleados para empresas como {client} con equipos de grado comercial y un solo contrato de mantenimiento multi-sede. ¿Le interesa una demo de café en su oficina para el equipo de facilities?',
    discovery: [
      '¿Cuántas sedes y cuántas personas por sede tienen hoy?',
      '¿Qué equipos de café y cocina usan y cada cuánto fallan?',
      '¿Quién administra el mantenimiento de estas áreas?',
      '¿Tienen renovaciones o aperturas de oficina planeadas?',
      '¿Qué papel juegan estas áreas en su propuesta al empleado y al cliente visitante?',
    ],
    objections: [
      {
        objection: '“Eso lo compra cada sede con caja menor.”',
        response: 'Exactamente ese es el costo oculto: compras dispersas de equipos domésticos que fallan y se reemplazan cada año. Un contrato marco cuesta menos que la suma de esas cajas menores y se nota en la experiencia.',
      },
      {
        objection: '“Tenemos máquinas en comodato con el proveedor de café.”',
        response: 'El comodato ata el equipo al insumo y suele limitar la calidad. Comparemos costo por taza real y calidad en ciego: si su comodato gana, se quedan como están.',
      },
    ],
    nextSteps: [
      'Demo de café Franke en la sede principal.',
      'Levantamiento de sedes y parque actual de equipos.',
      'Propuesta de contrato marco con mantenimiento incluido.',
      'Piloto en una sede y medición de uso y satisfacción.',
    ],
  },

  b2c: {
    id: 'b2c',
    label: 'Persona — Hogar de alto valor',
    shortLabel: 'Persona B2C',
    subVerticals: ['Remodelación de cocina', 'Casa o apartamento nuevo', 'Segunda vivienda / campo', 'Coleccionista de vinos / anfitrión'],
    ticketRange: 'COP 60M – 400M+ por cocina',
    baseScore: 76,
    summary:
      '{client} es un comprador de hogar de alto valor: no compra electrodomésticos, compra la cocina donde va a recibir a su gente y el estatus de las marcas que la firman. Sus decisiones giran alrededor de un proyecto (remodelación o vivienda nueva), de su arquitecto de confianza y del miedo real a comprar lujo importado sin respaldo local. Bamicol gana con curaduría, experiencia de showroom y garantía en Colombia.',
    painsLabel: 'Dolores y motivaciones',
    buyersLabel: 'Decisores del hogar',
    pains: [
      {
        title: 'Miedo al lujo sin respaldo local',
        detail: 'Comprar una marca importada de decenas de millones y quedarse sin técnico ni repuestos en Colombia es su peor escenario.',
        severity: 5,
        solution: 'Garantía oficial, técnicos certificados y repuestos locales Bamicol: el lujo con la tranquilidad de un respaldo en el país.',
      },
      {
        title: 'Proyecto descoordinado',
        detail: 'Arquitecto, fabricante de cocina, eléctrico y gas: cada uno culpa al otro cuando algo no encaja con el equipo.',
        severity: 4,
        solution: 'Acompañamiento técnico Bamicol al equipo del proyecto: medidas, instalación y puesta en marcha coordinadas con una sola cara responsable.',
      },
      {
        title: 'Fechas de obra vs. tiempos de importación',
        detail: 'La cocina no se puede entregar sin los equipos; una importación tardía retrasa la mudanza.',
        severity: 4,
        solution: 'Confirmación de inventario o fecha real de llegada antes de comprar, y reserva de producto contra la fecha de obra.',
      },
      {
        title: 'Sobreoferta confusa',
        detail: 'Decenas de marcas y especificaciones técnicas: decidir sin curaduría agota y paraliza.',
        severity: 3,
        solution: 'Curaduría experta por estilo de vida: cocinero serio, anfitrión, coleccionista de vino. Tres propuestas claras en vez de cien referencias.',
      },
      {
        title: 'La cocina como centro social',
        detail: 'Quiere una cocina para mostrar y compartir: el desempeño importa, pero la escena importa igual.',
        severity: 3,
        solution: 'Diseño de paquete signature (Sub-Zero + Wolf, o Bertazzoni en color) que convierte la cocina en la protagonista de la casa.',
      },
    ],
    buyers: [
      {
        role: 'Propietario(a)',
        title: 'Decisor económico',
        power: 'decisor',
        cares: 'Estatus, respaldo, que el proyecto salga perfecto.',
        angle: 'Experiencia privada de showroom: cocinar sobre el producto, probar el vino a la temperatura exacta. El lujo se decide en persona.',
      },
      {
        role: 'Pareja / familia',
        title: 'Co-decisor del hogar',
        power: 'decisor',
        cares: 'Uso diario, estética, que la casa funcione para la familia.',
        angle: 'Demostrar la vida diaria: silencio del lavavajillas Cove, orden del frío Sub-Zero, hornos que la familia realmente usa.',
      },
      {
        role: 'Arquitecto / diseñador de confianza',
        title: 'Influenciador clave',
        power: 'influenciador',
        cares: 'Integración al diseño, fichas técnicas, quedar bien con su cliente.',
        angle: 'Tratarlo como aliado: biblioteca técnica, atención prioritaria y comisión de especificación. Su recomendación cierra la venta.',
      },
      {
        role: 'Maestro de obra / instalador',
        title: 'Ejecutor técnico',
        power: 'bloqueador',
        cares: 'Instalación sin sorpresas: voltajes, gas, medidas.',
        angle: 'Instalación certificada por Bamicol incluida: el instalador deja de ser un riesgo y se vuelve un aliado.',
      },
    ],
    products: [
      { brand: 'Sub-Zero + Wolf + Cove', line: 'Cocina signature completa', why: 'El estándar de lujo global: refrigeración, cocción y lavado como un solo sistema, con estética unificada.', tag: 'Signature' },
      { brand: 'Bertazzoni', line: 'Cocción italiana en color', why: 'Para el hogar que quiere carácter: una estufa italiana en color como pieza central de la cocina.', tag: 'Carácter' },
      { brand: 'Sub-Zero Wine', line: 'Cavas de conservación', why: 'Para el anfitrión y coleccionista: conservación de vino de precisión en casa.', tag: 'Vino' },
      { brand: 'Fhiaba', line: 'Refrigeración integrable', why: 'Cocinas minimalistas donde el equipo desaparece tras los paneles del mobiliario.', tag: 'Minimalista' },
    ],
    signals: [
      'El comprador de lujo colombiano compara en Miami; la garantía local es el argumento que la compra internacional no puede igualar.',
      'Las decisiones se activan por proyecto: remodelación, vivienda nueva o segunda casa. Fuera de proyecto, se cultiva la relación.',
      'El arquitecto o diseñador de cabecera es la vía de entrada más corta hacia {client}.',
    ],
    opener:
      'Hola {client}, un gusto saludarle. Soy asesor de Bamicol, representantes en Colombia de Sub-Zero, Wolf y Bertazzoni. Sabemos que un proyecto de cocina de este nivel se decide viendo y probando el producto: quisiera invitarle a una visita privada a nuestro showroom —con su arquitecto o diseñador si lo prefiere— para mostrarle lo que estas marcas hacen distinto y cómo respaldamos la garantía aquí en Colombia. ¿Qué día le quedaría bien?',
    discovery: [
      '¿Su proyecto es remodelación, vivienda nueva o segunda casa? ¿Para cuándo esperan tenerla lista?',
      '¿Quién los acompaña en el diseño: arquitecto, diseñador, fabricante de cocina?',
      '¿Cómo usan la cocina: cocinan a diario, reciben invitados, coleccionan vino?',
      '¿Qué marcas han visto o les han recomendado hasta ahora?',
      '¿Qué experiencia han tenido con garantías de equipos importados?',
    ],
    objections: [
      {
        objection: '“En Miami lo consigo más barato.”',
        response: 'A veces la factura sí; el costo total casi nunca: flete, nacionalización, instalación por su cuenta y una garantía que no aplica en Colombia. Con Bamicol el precio es competitivo puesto en su cocina, instalado y con garantía oficial local. Hagamos la comparación completa con números.',
      },
      {
        objection: '“Es demasiada inversión para una cocina.”',
        response: 'Es la inversión en el espacio donde más va a vivir y recibir. Y estos equipos duran décadas: el costo por año es menor que renovar gama media dos o tres veces. Además podemos escalonar: empezar por las piezas protagonistas.',
      },
      {
        objection: '“Mi diseñador ya tiene sus marcas.”',
        response: 'Perfecto: trabajemos con su diseñador. Lo invitamos juntos al showroom; si las marcas que representa resuelven mejor su proyecto, adelante. En Sub-Zero, Wolf, Fhiaba y Bertazzoni, en todo caso, el respaldo oficial en Colombia somos nosotros.',
      },
    ],
    nextSteps: [
      'Agendar experiencia privada en showroom (con su arquitecto/diseñador).',
      'Levantar el proyecto: planos, fechas de obra, estilo de vida.',
      'Presentar 2–3 paquetes curados con presupuesto y tiempos reales.',
      'Reservar producto contra fecha de obra y coordinar instalación certificada.',
    ],
  },
};

// ── Clasificación ─────────────────────────────────────────────────────

export const SEGMENT_KEYWORDS: Record<Exclude<SegmentId, 'b2c'>, string[]> = {
  horeca: [
    'hotel', 'hoteles', 'hostal', 'resort', 'restaurante', 'restaurant', 'cocina',
    'gastro', 'gastronom', 'café', 'cafe', 'cafeter', 'bistro', 'grill', 'parrilla',
    'catering', 'banquete', 'club', 'bar ', 'rooftop', 'panader', 'pasteler',
    'reposter', 'pizzer', 'sushi', 'chef', 'food', 'burger', 'brunch', 'cocteler',
  ],
  construccion: [
    'constructora', 'construcción', 'construccion', 'inmobiliaria', 'promotora',
    'urbanizadora', 'edificio', 'torre', 'proyecto', 'vivienda', 'desarrollo',
    'ingenier', 'obras', 'edificacion', 'edificación', 'living', 'residencial',
  ],
  diseno: [
    'arquitect', 'diseño', 'diseno', 'interior', 'interioris', 'estudio', 'studio',
    'taller', 'cocinas integrales', 'mobiliario', 'carpinter', 'decorac', 'design',
  ],
  retail: [
    'tienda', 'almacén', 'almacen', 'almacenes', 'retail', 'distribuidor',
    'distribuciones', 'comercializadora', 'importadora', 'homecenter', 'ferreter',
    'acabados', 'depósito', 'deposito', 'electrodoméstic', 'electrodomestic',
  ],
  corporativo: [
    'grupo', 'corporac', 'holding', 'oficina', 'coworking', 'banco', 'financiera',
    'seguros', 'consultor', 'firma', 'aerolínea', 'aerolinea', 'universidad',
    'clínica', 'clinica', 'laboratorio', 'tecnolog', 'inversiones',
  ],
};

export const BUSINESS_MARKERS = [
  's.a.s', 'sas', 's.a', 'ltda', 'sa ', 'inc', 'llc', 'group', 'grupo', 'cía', 'cia', '&',
];

export const COMMON_FIRST_NAMES = [
  'juan', 'josé', 'jose', 'carlos', 'andrés', 'andres', 'luis', 'jorge', 'diego',
  'daniel', 'david', 'santiago', 'felipe', 'camilo', 'sebastián', 'sebastian',
  'ricardo', 'fernando', 'alejandro', 'mauricio', 'javier', 'oscar', 'óscar',
  'maría', 'maria', 'ana', 'laura', 'camila', 'valentina', 'daniela', 'carolina',
  'paula', 'natalia', 'juliana', 'catalina', 'isabella', 'gabriela', 'sofía',
  'sofia', 'diana', 'claudia', 'patricia', 'martha', 'sandra', 'adriana',
];

export const CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira',
];

export interface KnownAccount {
  segment: SegmentId;
  subVertical: string;
  note: string;
}

// Cuentas colombianas reconocibles para clasificación instantánea en demos.
export const KNOWN_ACCOUNTS: Record<string, KnownAccount> = {
  'estelar': { segment: 'horeca', subVertical: 'Cadena hotelera', note: 'Cadena hotelera colombiana con presencia nacional: decisiones de equipamiento por proyecto de renovación y apertura.' },
  'ghl': { segment: 'horeca', subVertical: 'Cadena hotelera', note: 'Operador hotelero multimarca en LatAm: compras centralizadas con estándares por bandera.' },
  'movich': { segment: 'horeca', subVertical: 'Hoteles boutique', note: 'Hoteles boutique de gama alta: la experiencia gastronómica es parte central de la propuesta.' },
  'dann carlton': { segment: 'horeca', subVertical: 'Hotelería premium', note: 'Hotelería premium con A&B propio: cocinas de banquetes y restaurantes internos.' },
  'four seasons': { segment: 'horeca', subVertical: 'Hotelería de lujo', note: 'Estándar global de lujo: especificaciones internacionales y cero tolerancia a fallas de servicio.' },
  'hilton': { segment: 'horeca', subVertical: 'Cadena internacional', note: 'Cadena internacional: decisiones locales de equipamiento dentro de estándares de marca.' },
  'marriott': { segment: 'horeca', subVertical: 'Cadena internacional', note: 'Cadena internacional con múltiples banderas en Colombia.' },
  'sofitel': { segment: 'horeca', subVertical: 'Hotelería de lujo', note: 'Lujo con ADN gastronómico francés: la cocina es identidad de marca.' },
  'takami': { segment: 'horeca', subVertical: 'Grupo gastronómico', note: 'Grupo gastronómico líder (múltiples marcas de restaurantes): abre formatos constantemente — cada apertura es una cocina nueva.' },
  'seratta': { segment: 'horeca', subVertical: 'Grupo gastronómico', note: 'Gastronomía espectáculo de alto ticket: equipamiento premium visible como parte del show.' },
  'crepes': { segment: 'horeca', subVertical: 'Cadena de restaurantes', note: 'Cadena gastronómica insignia de Colombia: escala grande, estandarización de cocinas y expansión continua.' },
  'andrés carne': { segment: 'horeca', subVertical: 'Restaurante insignia', note: 'Operación gastronómica de altísimo volumen y eventos: capacidad y continuidad son críticas.' },
  'wok': { segment: 'horeca', subVertical: 'Cadena de restaurantes', note: 'Cadena consolidada con cocina de precisión asiática: renovación de líneas por local.' },
  'harry sasson': { segment: 'horeca', subVertical: 'Alta cocina', note: 'Referente de alta cocina: cocina abierta donde el equipo es parte de la experiencia.' },
  'rausch': { segment: 'horeca', subVertical: 'Grupo de alta cocina', note: 'Grupo de los hermanos Rausch: alta cocina y formatos casual premium.' },
  'juan valdez': { segment: 'horeca', subVertical: 'Cadena de café', note: 'Cadena de café con cientos de tiendas: equipos de café de grado comercial en escala.' },
  'amarilo': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Una de las constructoras residenciales más grandes de Colombia: múltiples proyectos en preventa simultáneos.' },
  'constructora bolívar': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Constructora de gran escala con segmentos desde VIS hasta premium: oportunidad en sus líneas altas.' },
  'bolívar': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Constructora de gran escala: oportunidad en sus proyectos de gama alta.' },
  'marval': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Constructora nacional con proyectos premium en ciudades principales.' },
  'prodesa': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Promotora con portafolio residencial amplio.' },
  'cusezar': { segment: 'construccion', subVertical: 'Constructora premium', note: 'Desarrollador con tradición en proyectos residenciales de gama alta en Bogotá.' },
  'oikos': { segment: 'construccion', subVertical: 'Constructora / promotora', note: 'Grupo constructor con proyectos residenciales y comerciales.' },
  'colpatria': { segment: 'construccion', subVertical: 'Constructora / grupo', note: 'Grupo con brazo constructor de gran escala.' },
  'falabella': { segment: 'retail', subVertical: 'Retail departamental', note: 'Retail departamental con categoría de hogar: potencial corner premium o venta por proyecto.' },
  'alkosto': { segment: 'retail', subVertical: 'Retail de electrodomésticos', note: 'Gigante del retail de electro: gama masiva — la conversación premium es de nicho o marketplace.' },
  'home sentry': { segment: 'retail', subVertical: 'Retail de hogar', note: 'Retail especializado en hogar: cliente de estratos altos, buen calce para corner premium.' },
  'homecenter': { segment: 'retail', subVertical: 'Retail de construcción y hogar', note: 'Retail de mejoramiento del hogar: canal de remodeladores y maestros de obra.' },
  'éxito': { segment: 'retail', subVertical: 'Retail de gran superficie', note: 'La mayor cadena de retail del país: conversación premium viable solo en formatos selectos.' },
  'corona': { segment: 'retail', subVertical: 'Retail de acabados', note: 'Almacenes de acabados de cocina y baño: tráfico natural de remodelación de estratos altos.' },
};
