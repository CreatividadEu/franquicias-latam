// Seneca Int. — Radar B2B (demo).
// Dataset estilo Google Places + señales sociales para prospección.
// DEMO: ratings, conteos y señales son ilustrativos; en producción este
// dataset se alimenta de Google Places API + escucha social en vivo.

import type { SegmentId } from './types';

export type SignalType = 'remodelacion' | 'apertura' | 'quejas' | 'proyecto' | 'expansion';

export interface RadarBusiness {
  name: string;
  segment: SegmentId;
  subVertical: string;
  city: string;
  rating: number;
  reviews: number;
  signal: string;
  signalType: SignalType;
  /** 0–100: temperatura de oportunidad para Bamicol */
  heat: number;
}

export const SIGNAL_LABELS: Record<SignalType, string> = {
  remodelacion: 'Remodelación',
  apertura: 'Apertura',
  quejas: 'Quejas de equipo',
  proyecto: 'Proyecto activo',
  expansion: 'Expansión',
};

export const RADAR_DATA: RadarBusiness[] = [
  // ── HORECA ──────────────────────────────────────────────────────────
  { name: 'Hoteles Estelar', segment: 'horeca', subVertical: 'Cadena hotelera', city: 'Bogotá', rating: 4.5, reviews: 8420, signal: 'Anunció plan de renovación de A&B en tres propiedades para 2026–2027.', signalType: 'remodelacion', heat: 93 },
  { name: 'GHL Hoteles', segment: 'horeca', subVertical: 'Operador hotelero', city: 'Bogotá', rating: 4.3, reviews: 6110, signal: 'Sumó dos banderas nuevas en Colombia: equipamiento de cocinas en definición.', signalType: 'expansion', heat: 88 },
  { name: 'Movich Hotels', segment: 'horeca', subVertical: 'Hoteles boutique', city: 'Medellín', rating: 4.6, reviews: 5230, signal: 'Reseñas recientes elogian el rooftop pero mencionan demoras del room service.', signalType: 'quejas', heat: 79 },
  { name: 'Hotel Dann Carlton', segment: 'horeca', subVertical: 'Hotelería premium', city: 'Medellín', rating: 4.5, reviews: 7040, signal: 'Publicó vacante de jefe de mantenimiento con énfasis en equipos de cocina.', signalType: 'quejas', heat: 76 },
  { name: 'Four Seasons Casa Medina', segment: 'horeca', subVertical: 'Hotelería de lujo', city: 'Bogotá', rating: 4.7, reviews: 3980, signal: 'Estándar global de lujo: ciclo de reposición de equipos de cocina permanente.', signalType: 'proyecto', heat: 84 },
  { name: 'Hilton Bogotá Corferias', segment: 'horeca', subVertical: 'Cadena internacional', city: 'Bogotá', rating: 4.6, reviews: 9120, signal: 'Alto volumen de banquetes y eventos: línea caliente bajo presión constante.', signalType: 'quejas', heat: 74 },
  { name: 'Sofitel Legend Santa Clara', segment: 'horeca', subVertical: 'Hotelería de lujo', city: 'Cartagena', rating: 4.7, reviews: 5610, signal: 'Gastronomía insignia francesa: renovación de cocina central en evaluación.', signalType: 'remodelacion', heat: 90 },
  { name: 'Hotel Charleston Santa Teresa', segment: 'horeca', subVertical: 'Hotel boutique de lujo', city: 'Cartagena', rating: 4.6, reviews: 4470, signal: 'Reseñas destacan la terraza; críticas puntuales a tiempos de cocina en temporada.', signalType: 'quejas', heat: 77 },
  { name: 'Grupo Takami', segment: 'horeca', subVertical: 'Grupo gastronómico', city: 'Bogotá', rating: 4.5, reviews: 21300, signal: 'Abre 3–5 formatos nuevos al año: cada apertura es una cocina completa.', signalType: 'apertura', heat: 96 },
  { name: 'Grupo Seratta', segment: 'horeca', subVertical: 'Gastronomía espectáculo', city: 'Bogotá', rating: 4.4, reviews: 15800, signal: 'Formato de alto ticket con cocina a la vista: el equipo es parte del show.', signalType: 'expansion', heat: 87 },
  { name: 'Crepes & Waffles', segment: 'horeca', subVertical: 'Cadena insignia', city: 'Bogotá', rating: 4.6, reviews: 48200, signal: 'Expansión regional continua: estandarización de cocinas por local.', signalType: 'expansion', heat: 85 },
  { name: 'Andrés Carne de Res', segment: 'horeca', subVertical: 'Restaurante insignia', city: 'Chía / Bogotá', rating: 4.6, reviews: 61500, signal: 'Volumen extremo en fines de semana: capacidad de línea caliente al límite.', signalType: 'quejas', heat: 82 },
  { name: 'WOK', segment: 'horeca', subVertical: 'Cadena de restaurantes', city: 'Bogotá', rating: 4.4, reviews: 19400, signal: 'Renovación de locales antiguos en curso según sus redes.', signalType: 'remodelacion', heat: 83 },
  { name: 'Harry Sasson', segment: 'horeca', subVertical: 'Alta cocina', city: 'Bogotá', rating: 4.6, reviews: 8930, signal: 'Cocina abierta emblemática: vitrina perfecta para marcas premium.', signalType: 'proyecto', heat: 78 },
  { name: 'Restaurantes Rausch', segment: 'horeca', subVertical: 'Grupo de alta cocina', city: 'Bogotá', rating: 4.5, reviews: 11200, signal: 'Nuevos formatos casual premium anunciados por los hermanos Rausch.', signalType: 'apertura', heat: 86 },
  { name: 'El Chato', segment: 'horeca', subVertical: 'Alta cocina (50 Best)', city: 'Bogotá', rating: 4.6, reviews: 3150, signal: 'Reconocimiento internacional creciente: inversión continua en cocina de precisión.', signalType: 'proyecto', heat: 80 },
  { name: 'Leo Cocina y Cava', segment: 'horeca', subVertical: 'Alta cocina (50 Best)', city: 'Bogotá', rating: 4.5, reviews: 2890, signal: 'Programa de cava y fermentos: frío de precisión como necesidad central.', signalType: 'proyecto', heat: 81 },
  { name: 'Carmen', segment: 'horeca', subVertical: 'Alta cocina', city: 'Medellín', rating: 4.6, reviews: 6740, signal: 'Grupo con locales en Medellín y Cartagena: crecimiento sostenido.', signalType: 'expansion', heat: 82 },
  { name: 'OCI.Mde', segment: 'horeca', subVertical: 'Restaurante de autor', city: 'Medellín', rating: 4.5, reviews: 4210, signal: 'Referente gastronómico de Provenza con proyectos nuevos en la ciudad.', signalType: 'apertura', heat: 79 },
  { name: 'Juan Valdez Café', segment: 'horeca', subVertical: 'Cadena de café', city: 'Bogotá', rating: 4.3, reviews: 52600, signal: 'Renovación de formato de tiendas insignia: equipos de café de grado comercial.', signalType: 'remodelacion', heat: 84 },
  { name: 'Pergamino Café', segment: 'horeca', subVertical: 'Café de especialidad', city: 'Medellín', rating: 4.7, reviews: 9860, signal: 'Expansión de tiendas de especialidad: barras nuevas por abrir.', signalType: 'expansion', heat: 78 },
  { name: 'Celele', segment: 'horeca', subVertical: 'Alta cocina caribeña', city: 'Cartagena', rating: 4.6, reviews: 3540, signal: 'Proyección internacional del Caribe gastronómico: cocina en crecimiento.', signalType: 'proyecto', heat: 77 },

  // ── Construcción ────────────────────────────────────────────────────
  { name: 'Amarilo', segment: 'construccion', subVertical: 'Constructora / promotora', city: 'Bogotá', rating: 4.2, reviews: 3320, signal: 'Múltiples proyectos premium en preventa: ventana de especificación abierta.', signalType: 'proyecto', heat: 94 },
  { name: 'Constructora Bolívar', segment: 'construccion', subVertical: 'Constructora / promotora', city: 'Bogotá', rating: 4.1, reviews: 4110, signal: 'Lanzamientos de gama alta en el norte de Bogotá con entrega 2027.', signalType: 'proyecto', heat: 89 },
  { name: 'Marval', segment: 'construccion', subVertical: 'Constructora nacional', city: 'Bucaramanga', rating: 4.2, reviews: 2870, signal: 'Portafolio activo en cinco ciudades: torres premium en curso.', signalType: 'proyecto', heat: 86 },
  { name: 'Prodesa', segment: 'construccion', subVertical: 'Promotora', city: 'Bogotá', rating: 4.0, reviews: 1980, signal: 'Nuevos proyectos residenciales anunciados en la sabana de Bogotá.', signalType: 'proyecto', heat: 80 },
  { name: 'Cusezar', segment: 'construccion', subVertical: 'Desarrollador premium', city: 'Bogotá', rating: 4.3, reviews: 1540, signal: 'Tradición en gama alta: proyecto insignia en preventa en el nororiente.', signalType: 'proyecto', heat: 91 },
  { name: 'Oikos Constructora', segment: 'construccion', subVertical: 'Grupo constructor', city: 'Bogotá', rating: 4.1, reviews: 1230, signal: 'Desarrollo de usos mixtos con componente residencial premium.', signalType: 'proyecto', heat: 79 },
  { name: 'Constructora Colpatria', segment: 'construccion', subVertical: 'Constructora / grupo', city: 'Bogotá', rating: 4.0, reviews: 2650, signal: 'Pipeline de vivienda en varias ciudades: paquetes de cocina por definir.', signalType: 'proyecto', heat: 82 },
  { name: 'Conaltura', segment: 'construccion', subVertical: 'Constructora', city: 'Medellín', rating: 4.2, reviews: 1760, signal: 'Proyectos en El Poblado y oriente antioqueño en preventa.', signalType: 'proyecto', heat: 85 },
  { name: 'Londoño Gómez', segment: 'construccion', subVertical: 'Promotora premium', city: 'Medellín', rating: 4.3, reviews: 1420, signal: 'Desarrollos de lujo en Medellín: cocinas como argumento de sala de ventas.', signalType: 'proyecto', heat: 90 },
  { name: 'Arquitectura y Concreto', segment: 'construccion', subVertical: 'Constructora', city: 'Medellín', rating: 4.2, reviews: 2210, signal: 'Obras premium residenciales y hoteleras en ejecución.', signalType: 'proyecto', heat: 84 },
  { name: 'Ospinas & Cía', segment: 'construccion', subVertical: 'Desarrollador urbano', city: 'Bogotá', rating: 4.1, reviews: 980, signal: 'Desarrollos de usos mixtos de alto perfil en Bogotá.', signalType: 'proyecto', heat: 81 },
  { name: 'Triada', segment: 'construccion', subVertical: 'Promotora premium', city: 'Bogotá', rating: 4.2, reviews: 760, signal: 'Proyectos boutique de gama alta en zonas prime de Bogotá.', signalType: 'proyecto', heat: 87 },

  // ── Arquitectura y diseño ───────────────────────────────────────────
  { name: 'El Equipo Mazzanti', segment: 'diseno', subVertical: 'Estudio de arquitectura', city: 'Bogotá', rating: 4.8, reviews: 320, signal: 'Proyectos residenciales y culturales de alto perfil: especificador influyente.', signalType: 'proyecto', heat: 75 },
  { name: 'Plan:B Arquitectos', segment: 'diseno', subVertical: 'Estudio de arquitectura', city: 'Medellín', rating: 4.7, reviews: 280, signal: 'Residencial premium en Antioquia: cocinas integradas a diseño de autor.', signalType: 'proyecto', heat: 76 },
  { name: 'AEI Arquitectura e Interiores', segment: 'diseno', subVertical: 'Interiorismo corporativo y residencial', city: 'Bogotá', rating: 4.6, reviews: 410, signal: 'Alto volumen de proyectos de interiorismo premium: canal de especificación.', signalType: 'expansion', heat: 82 },
  { name: 'Taller de Arquitectura de Bogotá', segment: 'diseno', subVertical: 'Estudio de arquitectura', city: 'Bogotá', rating: 4.7, reviews: 190, signal: 'Casas de lujo publicadas en prensa de diseño: marcas visibles en cada proyecto.', signalType: 'proyecto', heat: 78 },
  { name: 'Madeval Bogotá', segment: 'diseno', subVertical: 'Fabricante de cocinas a medida', city: 'Bogotá', rating: 4.5, reviews: 530, signal: 'Showroom de cocinas premium: necesita marcas de equipos para cerrar proyectos.', signalType: 'expansion', heat: 88 },
  { name: 'Estudio Vertical Interiorismo', segment: 'diseno', subVertical: 'Diseño interior residencial', city: 'Medellín', rating: 4.6, reviews: 240, signal: 'Remodelaciones de apartamentos de lujo en El Poblado en su portafolio reciente.', signalType: 'remodelacion', heat: 80 },
  { name: 'Taller Norte Cocinas', segment: 'diseno', subVertical: 'Fabricante de cocinas a medida', city: 'Bogotá', rating: 4.5, reviews: 350, signal: 'Crecimiento en cocinas integrales premium: busca aliados de equipamiento.', signalType: 'expansion', heat: 84 },
  { name: 'Atelier Caribe Interior', segment: 'diseno', subVertical: 'Interiorismo hotelero', city: 'Cartagena', rating: 4.6, reviews: 160, signal: 'Proyectos de hoteles boutique en el centro histórico: especificación HORECA.', signalType: 'proyecto', heat: 79 },

  // ── Retail ──────────────────────────────────────────────────────────
  { name: 'Falabella Colombia', segment: 'retail', subVertical: 'Retail departamental', city: 'Bogotá', rating: 4.2, reviews: 38400, signal: 'Renovación de pisos de hogar en tiendas insignia: espacio para corner premium.', signalType: 'remodelacion', heat: 72 },
  { name: 'Alkosto', segment: 'retail', subVertical: 'Retail de electrodomésticos', city: 'Bogotá', rating: 4.3, reviews: 51200, signal: 'Domina gama media: sin oferta premium — hueco de mercado evidente.', signalType: 'expansion', heat: 64 },
  { name: 'Home Sentry', segment: 'retail', subVertical: 'Retail de hogar', city: 'Bogotá', rating: 4.4, reviews: 12600, signal: 'Cliente de estratos altos: calce natural para marcas exclusivas Bamicol.', signalType: 'expansion', heat: 81 },
  { name: 'Homecenter', segment: 'retail', subVertical: 'Mejoramiento del hogar', city: 'Bogotá', rating: 4.3, reviews: 47800, signal: 'Tráfico masivo de remodeladores: canal para línea Teka de proyectos.', signalType: 'expansion', heat: 70 },
  { name: 'Almacenes Éxito', segment: 'retail', subVertical: 'Gran superficie', city: 'Medellín', rating: 4.2, reviews: 62300, signal: 'Formatos premium selectos (Éxito Wow) en renovación.', signalType: 'remodelacion', heat: 62 },
  { name: 'Almacenes Corona', segment: 'retail', subVertical: 'Retail de acabados', city: 'Bogotá', rating: 4.4, reviews: 9800, signal: 'Tráfico de remodelación de cocina y baño de estratos altos: aliado natural.', signalType: 'expansion', heat: 83 },
  { name: 'Muebles Jamar', segment: 'retail', subVertical: 'Retail de hogar', city: 'Barranquilla', rating: 4.3, reviews: 18700, signal: 'Líder del hogar en la costa: sin oferta premium de cocina en su mix.', signalType: 'expansion', heat: 68 },
  { name: 'Distrihogar Premium', segment: 'retail', subVertical: 'Distribuidor regional', city: 'Cali', rating: 4.4, reviews: 2100, signal: 'Distribuidor regional buscando diferenciarse de grandes superficies.', signalType: 'expansion', heat: 76 },

  // ── Corporativo ─────────────────────────────────────────────────────
  { name: 'Bancolombia', segment: 'corporativo', subVertical: 'Sede corporativa', city: 'Medellín', rating: 4.1, reviews: 8900, signal: 'Renovación de sedes y espacios de talento: áreas de café en modernización.', signalType: 'remodelacion', heat: 71 },
  { name: 'Grupo Argos', segment: 'corporativo', subVertical: 'Holding corporativo', city: 'Medellín', rating: 4.3, reviews: 1200, signal: 'Campus corporativo con hospitality interno de alto estándar.', signalType: 'proyecto', heat: 69 },
  { name: 'Grupo SURA', segment: 'corporativo', subVertical: 'Sede corporativa', city: 'Medellín', rating: 4.2, reviews: 1450, signal: 'Espacios de bienestar para empleados en agenda de talento.', signalType: 'remodelacion', heat: 67 },
  { name: 'Avianca', segment: 'corporativo', subVertical: 'Salas VIP / hospitality', city: 'Bogotá', rating: 4.0, reviews: 24600, signal: 'Salas VIP en renovación: hospitality de alto tráfico con café premium.', signalType: 'remodelacion', heat: 78 },
  { name: 'WeWork Colombia', segment: 'corporativo', subVertical: 'Coworking premium', city: 'Bogotá', rating: 4.4, reviews: 3800, signal: 'La estación de café es argumento comercial explícito de sus sedes.', signalType: 'expansion', heat: 74 },
  { name: 'Ecopetrol', segment: 'corporativo', subVertical: 'Sede corporativa', city: 'Bogotá', rating: 4.0, reviews: 2300, signal: 'Sedes de gran escala con casinos y áreas de empleados en actualización.', signalType: 'remodelacion', heat: 65 },
];
