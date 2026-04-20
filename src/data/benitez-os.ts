export type BenitezRole =
  | "Mesero"
  | "Anfitrión"
  | "Cocina"
  | "Cajero"
  | "Líder de punto";

export type BenitezTargetRole = BenitezRole | "Todos";

export type CandidateStage =
  | "new"
  | "shortlisted"
  | "interview"
  | "trial"
  | "hired";

export type RiskLevel = "low" | "medium" | "high";

export interface BenitezLocation {
  id: string;
  name: string;
  city: string;
  zone: string;
  manager: string;
  teamSize: number;
  monthlySales: number;
  averageTicket: number;
  satisfaction: number;
  serviceMinutes: number;
  prepMinutes: number;
  upsellRate: number;
  celebrationRate: number;
  celebrationsExecuted: number;
  complaints: number;
  trainingCompliance: number;
  openVacancies: number;
  globalScore: number;
  riskLevel: RiskLevel;
  weeklySales: number[];
  alerts: string[];
  aiActions: string[];
  focusModules: string[];
  narrative: string;
}

export interface BenitezOpenRole {
  id: string;
  locationId: string;
  role: BenitezRole;
  count: number;
  urgency: "Alta" | "Media";
  note: string;
}

export interface BenitezCandidate {
  id: string;
  name: string;
  stage: CandidateStage;
  role: BenitezRole;
  city: string;
  availability: string;
  experience: string;
  cultureScore: number;
  serviceScore: number;
  overallScore: number;
  strengths: string[];
  aiSummary: string;
  interviewQuestions: string[];
  recommendation: string;
  riskNote: string;
}

export interface BenitezModule {
  id: string;
  title: string;
  category: "Cultura" | "Servicio" | "Ventas" | "Operación";
  description: string;
  duration: string;
  targetRoles: BenitezTargetRole[];
  impact: string;
}

export interface BenitezCollaborator {
  id: string;
  name: string;
  role: BenitezRole;
  locationId: string;
  progress: number;
  performanceScore: number;
  streakDays: number;
  completedModuleIds: string[];
  pendingModuleIds: string[];
  recommendedModuleId: string;
  status: "Al día" | "En foco" | "Rezagado";
}

export interface BenitezInsightItem {
  title: string;
  detail: string;
  impact?: string;
}

const BENITEZ_WEEKS = [
  "Sem 12",
  "Sem 13",
  "Sem 14",
  "Sem 15",
  "Sem 16",
  "Sem 17",
] as const;

export const benitezLocations: BenitezLocation[] = [
  {
    id: "zona-g",
    name: "Bogotá · Zona G",
    city: "Bogotá",
    zone: "Zona G",
    manager: "Natalia Pardo",
    teamSize: 31,
    monthlySales: 548_000_000,
    averageTicket: 78_500,
    satisfaction: 93,
    serviceMinutes: 12.4,
    prepMinutes: 10.8,
    upsellRate: 21,
    celebrationRate: 96,
    celebrationsExecuted: 184,
    complaints: 9,
    trainingCompliance: 95,
    openVacancies: 1,
    globalScore: 92,
    riskLevel: "low",
    weeklySales: [116_000_000, 121_000_000, 128_000_000, 131_000_000, 126_000_000, 134_000_000],
    alerts: [
      "Rotación de anfitriones sube a 11% y recomienda activar reserva de candidatos para fines de semana.",
      "Viernes 8pm opera al 94% de capacidad; conviene abrir una estación extra de apoyo para celebraciones.",
    ],
    aiActions: [
      "Replicar protocolo de upsell de postres y coctelería en dos puntos de Bogotá con brecha de ticket.",
      "Usar a Natalia Pardo como mentora de celebración para líderes en Pereira y Barranquilla.",
    ],
    focusModules: ["Venta sugerida y ticket promedio", "Protocolo de celebración"],
    narrative:
      "Punto referente de la cadena. Sostiene ticket alto gracias a una coreografía de celebración consistente y liderazgo visible en salón.",
  },
  {
    id: "parque-93",
    name: "Bogotá · Parque 93",
    city: "Bogotá",
    zone: "Parque 93",
    manager: "Juan Camilo Ruiz",
    teamSize: 29,
    monthlySales: 522_000_000,
    averageTicket: 76_100,
    satisfaction: 91,
    serviceMinutes: 13.1,
    prepMinutes: 11.3,
    upsellRate: 20,
    celebrationRate: 92,
    celebrationsExecuted: 168,
    complaints: 12,
    trainingCompliance: 88,
    openVacancies: 2,
    globalScore: 89,
    riskLevel: "medium",
    weeklySales: [110_000_000, 114_000_000, 118_000_000, 121_000_000, 119_000_000, 124_000_000],
    alerts: [
      "La espera en host desk aumenta 1.8 minutos en horarios corporativos.",
      "Quedan 2 vacantes de mesero premium sin cerrar; se afecta la asignación de mesas en terrazas.",
    ],
    aiActions: [
      "Mover a candidatos con score de servicio >88 a entrevista final para cubrir tardes de jueves y viernes.",
      "Refrescar entrenamiento de host en manejo de lista de espera y promesa de tiempo.",
    ],
    focusModules: ["Hospitalidad y experiencia", "Manejo de tiempos pico"],
    narrative:
      "Opera muy fuerte en almuerzos ejecutivos y cenas corporativas; necesita blindar el frente de recepción para no erosionar experiencia.",
  },
  {
    id: "usaquen",
    name: "Bogotá · Usaquén",
    city: "Bogotá",
    zone: "Usaquén",
    manager: "Laura Beltrán",
    teamSize: 27,
    monthlySales: 486_000_000,
    averageTicket: 74_200,
    satisfaction: 88,
    serviceMinutes: 14.2,
    prepMinutes: 11.8,
    upsellRate: 19,
    celebrationRate: 89,
    celebrationsExecuted: 151,
    complaints: 14,
    trainingCompliance: 84,
    openVacancies: 2,
    globalScore: 85,
    riskLevel: "medium",
    weeklySales: [104_000_000, 108_000_000, 111_000_000, 115_000_000, 109_000_000, 116_000_000],
    alerts: [
      "La recomendación de bebidas cae 3 puntos vs. cadena en turnos familiares del domingo.",
      "Se observa dispersión entre líderes de turno en el protocolo de resolución de quejas.",
    ],
    aiActions: [
      "Forzar microcápsula de manejo de quejas a todo líder nuevo antes del siguiente fin de semana.",
      "Activar shadowing de upsell con Zona G para el equipo de cajas.",
    ],
    focusModules: ["Manejo de quejas", "Venta sugerida y ticket promedio"],
    narrative:
      "Tiene buen flujo familiar y turismo local. El próximo salto está en estandarizar liderazgo y elevar venta sugerida en domingo.",
  },
  {
    id: "poblado",
    name: "Medellín · El Poblado",
    city: "Medellín",
    zone: "El Poblado",
    manager: "Daniela Restrepo",
    teamSize: 30,
    monthlySales: 534_000_000,
    averageTicket: 77_200,
    satisfaction: 92,
    serviceMinutes: 12.8,
    prepMinutes: 10.6,
    upsellRate: 22,
    celebrationRate: 95,
    celebrationsExecuted: 176,
    complaints: 8,
    trainingCompliance: 91,
    openVacancies: 1,
    globalScore: 90,
    riskLevel: "low",
    weeklySales: [113_000_000, 117_000_000, 121_000_000, 126_000_000, 124_000_000, 129_000_000],
    alerts: [
      "La cocina está respondiendo bien, pero sábado noche muestra presión en expeditor.",
      "Solo 1 vacante abierta de cocina, ideal para cerrar antes del pico de mayo.",
    ],
    aiActions: [
      "Usar este punto como benchmark de coordinación cocina-salón para la academia operativa.",
      "Mantener rutinas de pre-briefing de celebración para no perder consistencia en alta ocupación.",
    ],
    focusModules: ["Coordinación de cocina en hora pico", "Protocolo de celebración"],
    narrative:
      "Sede ancla en Medellín. Combina ejecución sólida en cocina con una celebración muy homogénea entre turnos.",
  },
  {
    id: "laureles",
    name: "Medellín · Laureles",
    city: "Medellín",
    zone: "Laureles",
    manager: "Sebastián Jaramillo",
    teamSize: 24,
    monthlySales: 441_000_000,
    averageTicket: 69_800,
    satisfaction: 86,
    serviceMinutes: 14.8,
    prepMinutes: 12.5,
    upsellRate: 17,
    celebrationRate: 84,
    celebrationsExecuted: 132,
    complaints: 18,
    trainingCompliance: 79,
    openVacancies: 3,
    globalScore: 81,
    riskLevel: "medium",
    weeklySales: [91_000_000, 94_000_000, 98_000_000, 101_000_000, 97_000_000, 103_000_000],
    alerts: [
      "El tiempo de preparación supera el benchmark de la cadena en 1.7 minutos.",
      "Baja consistencia en canto de cumpleaños en segundo turno y fines de semana.",
    ],
    aiActions: [
      "Priorizar contratación de cocina y reentrenar al líder de turno en coordinación de picos.",
      "Desplegar cápsula express de celebración con evaluación en piso por 10 días.",
    ],
    focusModules: ["Manejo de tiempos pico", "Protocolo de celebración"],
    narrative:
      "Tiene demanda saludable, pero el ritmo operativo no siempre acompaña. La oportunidad está en cocina y disciplina de experiencia.",
  },
  {
    id: "granada",
    name: "Cali · Granada",
    city: "Cali",
    zone: "Granada",
    manager: "Paula Castaño",
    teamSize: 26,
    monthlySales: 458_000_000,
    averageTicket: 71_200,
    satisfaction: 87,
    serviceMinutes: 14.5,
    prepMinutes: 12.0,
    upsellRate: 18,
    celebrationRate: 87,
    celebrationsExecuted: 140,
    complaints: 16,
    trainingCompliance: 82,
    openVacancies: 2,
    globalScore: 83,
    riskLevel: "medium",
    weeklySales: [95_000_000, 98_000_000, 101_000_000, 105_000_000, 102_000_000, 108_000_000],
    alerts: [
      "Los turnos de almuerzo pierden oportunidad de upsell en bebidas y entradas compartidas.",
      "Solo 64% del equipo completó la cápsula de manejo de quejas en la última ola.",
    ],
    aiActions: [
      "Reforzar venta sugerida con role-play de combos premium para meseros y cajeros.",
      "Subir la tasa de finalización de cápsulas con recordatorios automáticos y seguimiento por líder.",
    ],
    focusModules: ["Venta sugerida y ticket promedio", "Manejo de quejas"],
    narrative:
      "Gran capacidad comercial. Si se corrige consistencia formativa y venta sugerida, puede entrar al top 3 de la cadena.",
  },
  {
    id: "buenavista",
    name: "Barranquilla · Buenavista",
    city: "Barranquilla",
    zone: "Buenavista",
    manager: "María José Villar",
    teamSize: 23,
    monthlySales: 429_000_000,
    averageTicket: 68_400,
    satisfaction: 85,
    serviceMinutes: 15.9,
    prepMinutes: 12.9,
    upsellRate: 16,
    celebrationRate: 82,
    celebrationsExecuted: 149,
    complaints: 20,
    trainingCompliance: 74,
    openVacancies: 3,
    globalScore: 78,
    riskLevel: "high",
    weeklySales: [88_000_000, 91_000_000, 95_000_000, 98_000_000, 94_000_000, 99_000_000],
    alerts: [
      "Tiempo de atención sube 2.3 minutos por encima del promedio de cadena en noches familiares.",
      "Protocolo de celebración inconsistente y 3 quejas recientes por baja energía en la experiencia.",
    ],
    aiActions: [
      "Desplegar intervención de 14 días: staffing rápido, coaching de salón y checklist operativo por turno.",
      "Asignar shadow manager desde El Poblado para reordenar briefing y secuencia de servicio.",
    ],
    focusModules: ["Hospitalidad y experiencia", "Protocolo de celebración"],
    narrative:
      "Necesita intervención táctica. Tiene tracción comercial, pero la ejecución hoy pone en riesgo percepción de marca y ticket promedio.",
  },
  {
    id: "canaveral",
    name: "Bucaramanga · Cañaveral",
    city: "Bucaramanga",
    zone: "Cañaveral",
    manager: "Andrés Serrano",
    teamSize: 22,
    monthlySales: 398_000_000,
    averageTicket: 66_100,
    satisfaction: 84,
    serviceMinutes: 15.1,
    prepMinutes: 12.2,
    upsellRate: 17,
    celebrationRate: 85,
    celebrationsExecuted: 127,
    complaints: 17,
    trainingCompliance: 76,
    openVacancies: 1,
    globalScore: 79,
    riskLevel: "medium",
    weeklySales: [82_000_000, 85_000_000, 88_000_000, 91_000_000, 90_000_000, 94_000_000],
    alerts: [
      "Punto estable pero con dispersión en script de bienvenida y tiempos de entrega en caja.",
      "Líder nuevo aún no cierra el 100% de onboarding operacional.",
    ],
    aiActions: [
      "Completar onboarding del líder y auditar secuencia de caja durante 5 días.",
      "Conectar desempeño del punto con cápsulas adaptativas de bienvenida y upsell.",
    ],
    focusModules: ["Caja sin fricción y cierres limpios", "Hospitalidad y experiencia"],
    narrative:
      "No está en crisis, pero aún no se consolida. Un pequeño ajuste en liderazgo y caja debería estabilizar el score.",
  },
  {
    id: "bocagrande",
    name: "Cartagena · Bocagrande",
    city: "Cartagena",
    zone: "Bocagrande",
    manager: "Camilo Ospina",
    teamSize: 28,
    monthlySales: 476_000_000,
    averageTicket: 73_500,
    satisfaction: 89,
    serviceMinutes: 13.9,
    prepMinutes: 11.4,
    upsellRate: 19,
    celebrationRate: 91,
    celebrationsExecuted: 166,
    complaints: 13,
    trainingCompliance: 86,
    openVacancies: 2,
    globalScore: 87,
    riskLevel: "medium",
    weeklySales: [101_000_000, 104_000_000, 109_000_000, 112_000_000, 110_000_000, 116_000_000],
    alerts: [
      "El flujo turístico demanda reforzar inglés funcional para anfitriones y caja.",
      "La venta sugerida de bebidas premium puede capturar mejor ticket en noches de alta ocupación.",
    ],
    aiActions: [
      "Incluir una cápsula flash de servicio a turismo y recomendaciones bilingües.",
      "Ajustar incentivos de upsell por turno para bebidas y shareables.",
    ],
    focusModules: ["Venta sugerida y ticket promedio", "Hospitalidad y experiencia"],
    narrative:
      "Muy buen potencial comercial. El punto puede crecer sin fricción si adapta mejor discurso y sugerencia a turismo.",
  },
  {
    id: "circunvalar",
    name: "Pereira · Circunvalar",
    city: "Pereira",
    zone: "Circunvalar",
    manager: "Valentina Gómez",
    teamSize: 21,
    monthlySales: 382_000_000,
    averageTicket: 64_200,
    satisfaction: 81,
    serviceMinutes: 16.5,
    prepMinutes: 13.2,
    upsellRate: 15,
    celebrationRate: 78,
    celebrationsExecuted: 118,
    complaints: 23,
    trainingCompliance: 68,
    openVacancies: 4,
    globalScore: 73,
    riskLevel: "high",
    weeklySales: [79_000_000, 81_000_000, 84_000_000, 87_000_000, 85_000_000, 90_000_000],
    alerts: [
      "Ticket promedio cae 6.4% vs. hace 4 semanas por menor venta sugerida y tiempos de espera altos.",
      "El punto tiene la tasa más baja de cumplimiento formativo y 4 vacantes críticas abiertas.",
    ],
    aiActions: [
      "Intervención integral: contratar 2 meseros y 1 líder, subir academia adaptativa y corregir picos de cocina.",
      "Monitorear cada turno con checklist de celebración y coaching de upsell al cierre.",
    ],
    focusModules: ["Venta sugerida y ticket promedio", "Manejo de tiempos pico", "Protocolo de celebración"],
    narrative:
      "Es el punto que más necesita acompañamiento. La combinación de vacantes, bajo cumplimiento formativo y experiencia irregular ya golpea el ingreso.",
  },
];

export const benitezOpenRoles: BenitezOpenRole[] = [
  {
    id: "open-1",
    locationId: "zona-g",
    role: "Líder de punto",
    count: 1,
    urgency: "Media",
    note: "Backup para segundo turno de fin de semana y expansión de eventos privados.",
  },
  {
    id: "open-2",
    locationId: "parque-93",
    role: "Mesero",
    count: 1,
    urgency: "Alta",
    note: "Falta cubrir terraza premium jueves y viernes.",
  },
  {
    id: "open-3",
    locationId: "parque-93",
    role: "Anfitrión",
    count: 1,
    urgency: "Media",
    note: "Reforzar picos de lista de espera en almuerzo corporativo.",
  },
  {
    id: "open-4",
    locationId: "usaquen",
    role: "Cajero",
    count: 1,
    urgency: "Media",
    note: "Reduce tiempos en domingos familiares y cierres nocturnos.",
  },
  {
    id: "open-5",
    locationId: "usaquen",
    role: "Líder de punto",
    count: 1,
    urgency: "Alta",
    note: "Se necesita consistencia operativa entre turnos.",
  },
  {
    id: "open-6",
    locationId: "poblado",
    role: "Cocina",
    count: 1,
    urgency: "Media",
    note: "Relevo anticipado para pico de temporada y eventos corporativos.",
  },
  {
    id: "open-7",
    locationId: "laureles",
    role: "Cocina",
    count: 2,
    urgency: "Alta",
    note: "Es la brecha más sensible para mejorar tiempos de preparación.",
  },
  {
    id: "open-8",
    locationId: "laureles",
    role: "Mesero",
    count: 1,
    urgency: "Media",
    note: "Necesario para sostener energía de experiencia en segundo turno.",
  },
  {
    id: "open-9",
    locationId: "granada",
    role: "Mesero",
    count: 1,
    urgency: "Alta",
    note: "Vacante clave para almuerzos de alto tráfico.",
  },
  {
    id: "open-10",
    locationId: "granada",
    role: "Anfitrión",
    count: 1,
    urgency: "Media",
    note: "Debe reforzar acogida y primer contacto.",
  },
  {
    id: "open-11",
    locationId: "buenavista",
    role: "Cocina",
    count: 1,
    urgency: "Alta",
    note: "Impacta directamente tiempos de servicio y consistencia en picos.",
  },
  {
    id: "open-12",
    locationId: "buenavista",
    role: "Anfitrión",
    count: 1,
    urgency: "Alta",
    note: "La experiencia de llegada hoy es inconsistente.",
  },
  {
    id: "open-13",
    locationId: "buenavista",
    role: "Cajero",
    count: 1,
    urgency: "Media",
    note: "Reduce congestión al cierre y mejora percepción de agilidad.",
  },
  {
    id: "open-14",
    locationId: "canaveral",
    role: "Líder de punto",
    count: 1,
    urgency: "Media",
    note: "Soporte al líder actual para consolidar el punto.",
  },
  {
    id: "open-15",
    locationId: "bocagrande",
    role: "Mesero",
    count: 1,
    urgency: "Media",
    note: "Atiende mejor picos de turismo nocturno.",
  },
  {
    id: "open-16",
    locationId: "bocagrande",
    role: "Cocina",
    count: 1,
    urgency: "Media",
    note: "Reduce cuellos de botella en alta ocupación.",
  },
  {
    id: "open-17",
    locationId: "circunvalar",
    role: "Mesero",
    count: 2,
    urgency: "Alta",
    note: "Crítico para mejorar experiencia y captura de ticket.",
  },
  {
    id: "open-18",
    locationId: "circunvalar",
    role: "Líder de punto",
    count: 1,
    urgency: "Alta",
    note: "Se necesita reordenar la operación del turno noche.",
  },
  {
    id: "open-19",
    locationId: "circunvalar",
    role: "Cocina",
    count: 1,
    urgency: "Media",
    note: "Apoyo para corregir los tiempos de preparación más altos de la red.",
  },
];

export const candidateStageOrder: CandidateStage[] = [
  "new",
  "shortlisted",
  "interview",
  "trial",
  "hired",
];

export const candidateStageLabels: Record<CandidateStage, string> = {
  new: "Nuevos",
  shortlisted: "Preseleccionados",
  interview: "Entrevista",
  trial: "Prueba",
  hired: "Contratados",
};

export const benitezCandidates: BenitezCandidate[] = [
  {
    id: "cand-1",
    name: "Laura Sánchez",
    stage: "shortlisted",
    role: "Mesero",
    city: "Bogotá",
    availability: "Inmediata",
    experience: "4 años en casual dining y experiencia en servicio de celebración.",
    cultureScore: 91,
    serviceScore: 94,
    overallScore: 92,
    strengths: ["Energía de piso", "Venta sugerida", "Resolución amable"],
    aiSummary:
      "Perfil muy alineado a una marca experiencial. Tiene lenguaje de servicio cálido y buen timing para aumentar ticket sin sentirse invasiva.",
    interviewQuestions: [
      "Cuéntame cómo subes el ticket promedio sin romper la experiencia.",
      "¿Qué haces cuando una mesa llega a celebrar pero cocina está retrasada?",
      "Describe una situación en la que lograste recuperar a un cliente molesto.",
    ],
    recommendation: "Acelerar a entrevista final para Bogotá; encaja especialmente bien con Parque 93.",
    riskNote: "Riesgo bajo. Validar estabilidad de horarios nocturnos.",
  },
  {
    id: "cand-2",
    name: "Kevin Lozano",
    stage: "new",
    role: "Cocina",
    city: "Pereira",
    availability: "15 días",
    experience: "3 años en línea caliente y montaje para alto volumen.",
    cultureScore: 79,
    serviceScore: 68,
    overallScore: 76,
    strengths: ["Ritmo", "Orden de estación", "Aprendizaje rápido"],
    aiSummary:
      "Buen perfil operativo para corregir velocidad de salida. Todavía no muestra exposición fuerte a servicio, pero puede integrarse bien en puntos con liderazgo cercano.",
    interviewQuestions: [
      "¿Cómo priorizas comandas en hora pico sin sacrificar calidad?",
      "¿Qué indicadores revisas para saber si tu estación está bajo control?",
      "¿Cómo reaccionas cuando salón pide acelerar un pedido especial?",
    ],
    recommendation: "Mover a preselección para Pereira y Laureles si supera validación técnica.",
    riskNote: "Riesgo medio. Confirmar permanencia mínima y disciplina de mise en place.",
  },
  {
    id: "cand-3",
    name: "Natalia Orozco",
    stage: "interview",
    role: "Anfitrión",
    city: "Medellín",
    availability: "Inmediata",
    experience: "2 años en host desk premium y eventos corporativos.",
    cultureScore: 90,
    serviceScore: 88,
    overallScore: 89,
    strengths: ["Primera impresión", "Gestión de espera", "Presencia"],
    aiSummary:
      "Puede elevar mucho la sensación de llegada. Tiene tono natural, orden y buen criterio para manejar mesas con expectativa alta.",
    interviewQuestions: [
      "¿Cómo comunicas una espera larga sin deteriorar la percepción del cliente?",
      "¿Cómo priorizas entre reserva, walk-in y celebración sorpresa?",
      "¿Qué haces para que el primer minuto se sienta especial?",
    ],
    recommendation: "Mantener en entrevista para Buenavista o Parque 93; alta afinidad con operación experiencial.",
    riskNote: "Riesgo bajo. Verificar tolerancia a alta presión en fines de semana.",
  },
  {
    id: "cand-4",
    name: "Julián Meneses",
    stage: "trial",
    role: "Líder de punto",
    city: "Pereira",
    availability: "Inmediata",
    experience: "6 años liderando restaurantes casuales con foco en piso y productividad.",
    cultureScore: 86,
    serviceScore: 81,
    overallScore: 85,
    strengths: ["Liderazgo en turno", "Orden operacional", "Feedback en piso"],
    aiSummary:
      "Perfil fuerte para puntos que necesitan disciplina rápida. No es el más cálido del pipeline, pero sí el que mejor puede estabilizar una sede crítica.",
    interviewQuestions: [
      "¿Cuál es tu rutina de apertura para anticipar fallas del turno?",
      "¿Cómo corriges un equipo sin bajar energía ni servicio?",
      "¿Qué harías en tus primeros 10 días en un punto con score bajo?",
    ],
    recommendation: "Mantener prueba en Circunvalar. Es el mejor candidato para reordenar operación.",
    riskNote: "Riesgo medio. Validar adaptación a una cultura más experiencial y festiva.",
  },
  {
    id: "cand-5",
    name: "Mariana Durán",
    stage: "shortlisted",
    role: "Cajero",
    city: "Bucaramanga",
    availability: "Inmediata",
    experience: "5 años en caja, cierre y atención rápida en retail food.",
    cultureScore: 84,
    serviceScore: 80,
    overallScore: 83,
    strengths: ["Cierres limpios", "Rapidez", "Empatía"],
    aiSummary:
      "Muy ordenada y consistente. Puede reducir fricción de caja desde el día uno y absorber entrenamiento de upsell con rapidez.",
    interviewQuestions: [
      "¿Cómo mantienes velocidad sin que el cliente sienta prisa?",
      "¿Qué haces cuando hay error en cuenta y la fila sigue creciendo?",
      "¿Cómo sugieres un extra en una interacción muy corta?",
    ],
    recommendation: "Pasar a entrevista final para Cañaveral o Usaquén.",
    riskNote: "Riesgo bajo. Solo confirmar flexibilidad de turnos rotativos.",
  },
  {
    id: "cand-6",
    name: "Santiago Pineda",
    stage: "new",
    role: "Mesero",
    city: "Cali",
    availability: "7 días",
    experience: "2 años en gastrobar con alto flujo nocturno.",
    cultureScore: 82,
    serviceScore: 85,
    overallScore: 84,
    strengths: ["Buen ritmo", "Manejo de objeciones", "Energía"],
    aiSummary:
      "Tiene perfil comercial y tolera picos de presión. Requiere pulir protocolo de hospitalidad para alinearlo a una marca más estructurada.",
    interviewQuestions: [
      "¿Cómo decides qué sugerir según el tipo de mesa?",
      "¿Qué haces cuando cocina se retrasa y la mesa ya está sensible?",
      "¿Qué significa para ti servicio memorable?",
    ],
    recommendation: "Avanzar a preselección para Granada.",
    riskNote: "Riesgo medio. Revisar estabilidad en trabajos anteriores.",
  },
  {
    id: "cand-7",
    name: "Paola Hernández",
    stage: "hired",
    role: "Mesero",
    city: "Cartagena",
    availability: "Contratada",
    experience: "4 años en servicio turístico y manejo de clientes internacionales.",
    cultureScore: 90,
    serviceScore: 89,
    overallScore: 90,
    strengths: ["Servicio bilingüe", "Venta premium", "Manejo de objeciones"],
    aiSummary:
      "Contratación de alto valor para Bocagrande. Ya muestra potencial para elevar ticket y mejorar experiencia con turismo.",
    interviewQuestions: [
      "¿Cómo adaptarías la sugerencia de venta a turismo extranjero?",
      "¿Qué detalles observas para anticipar una celebración?",
      "¿Cómo recuperas un pedido tardío sin perder calidez?",
    ],
    recommendation: "Onboarding acelerado con módulos de cultura y celebración en primera semana.",
    riskNote: "Riesgo bajo. Monitorear curva de adaptación al sistema interno.",
  },
  {
    id: "cand-8",
    name: "Felipe Rincón",
    stage: "interview",
    role: "Cocina",
    city: "Medellín",
    availability: "Inmediata",
    experience: "5 años en producción, parrilla y despacho coordinado.",
    cultureScore: 77,
    serviceScore: 65,
    overallScore: 75,
    strengths: ["Técnica", "Velocidad", "Disciplina"],
    aiSummary:
      "Resuelve el componente técnico, pero necesita liderazgo que le conecte el impacto de cocina con experiencia de cliente.",
    interviewQuestions: [
      "¿Cómo reduces reprocesos en un turno muy cargado?",
      "¿Qué haces cuando el salón te pide priorizar fuera del orden normal?",
      "¿Cómo entrenas a alguien más lento que tú?",
    ],
    recommendation: "Mantener en entrevista para Laureles. Solo avanzar con líder fuerte de acompañamiento.",
    riskNote: "Riesgo medio-alto. Validar actitud frente a feedback.",
  },
  {
    id: "cand-9",
    name: "Valentina Muñoz",
    stage: "trial",
    role: "Anfitrión",
    city: "Barranquilla",
    availability: "Inmediata",
    experience: "3 años en host y activaciones de marca.",
    cultureScore: 92,
    serviceScore: 86,
    overallScore: 89,
    strengths: ["Actitud", "Cercanía", "Organización"],
    aiSummary:
      "Puede ayudar a subir muy rápido la energía del punto. Buen perfil para recuperar experiencia y protocolo de bienvenida.",
    interviewQuestions: [
      "¿Cómo mantienes energía alta durante todo el turno?",
      "¿Qué haces cuando una mesa llega a celebrar sin reserva?",
      "¿Cómo organizas lista de espera y prioridad?",
    ],
    recommendation: "Cerrar prueba esta semana para Buenavista.",
    riskNote: "Riesgo bajo. Revisar nivel de detalle administrativo.",
  },
  {
    id: "cand-10",
    name: "Cristian Osorio",
    stage: "shortlisted",
    role: "Líder de punto",
    city: "Bogotá",
    availability: "30 días",
    experience: "7 años gestionando operaciones multi-turno en casual dining.",
    cultureScore: 88,
    serviceScore: 82,
    overallScore: 86,
    strengths: ["Coaching", "KPIs", "Disciplina operativa"],
    aiSummary:
      "Buen equilibrio entre gestión y ejecución. Puede profesionalizar una sede sin enfriarla demasiado si se acompaña bien en cultura.",
    interviewQuestions: [
      "¿Cómo conviertes un dashboard en acciones concretas de turno?",
      "¿Qué hábitos diarios sostienen una cultura de servicio?",
      "¿Cómo reaccionas cuando ticket y satisfacción caen al mismo tiempo?",
    ],
    recommendation: "Reservar para back-up de Bogotá o plan de expansión de líderes.",
    riskNote: "Riesgo medio. La disponibilidad es más lenta que el resto del pipeline.",
  },
  {
    id: "cand-11",
    name: "Angie Ramírez",
    stage: "new",
    role: "Mesero",
    city: "Pereira",
    availability: "Inmediata",
    experience: "1.5 años en restaurantes familiares y eventos.",
    cultureScore: 83,
    serviceScore: 79,
    overallScore: 81,
    strengths: ["Cercanía", "Rapidez", "Actitud"],
    aiSummary:
      "Perfil desarrollable. Le falta sofisticación comercial, pero aporta calidez y disposición para aprender.",
    interviewQuestions: [
      "¿Cómo te preparas antes de arrancar turno?",
      "¿Qué haces para que una mesa se sienta cuidada?",
      "Cuéntame una vez que corregiste un error frente al cliente.",
    ],
    recommendation: "Subir a preselección para Circunvalar como contratación de volumen.",
    riskNote: "Riesgo medio. Requiere ruta de onboarding muy guiada.",
  },
  {
    id: "cand-12",
    name: "Ricardo Cifuentes",
    stage: "hired",
    role: "Cocina",
    city: "Medellín",
    availability: "Contratado",
    experience: "4 años coordinando línea fría y caliente.",
    cultureScore: 80,
    serviceScore: 70,
    overallScore: 78,
    strengths: ["Orden", "Velocidad", "Limpieza"],
    aiSummary:
      "Contratación táctica para El Poblado. No viene con mentalidad de experiencia, pero tiene bases firmes para adoptar estándares rápido.",
    interviewQuestions: [
      "¿Cómo mantienes estándar con volumen alto?",
      "¿Qué controlas antes de arrancar hora pico?",
      "¿Cómo apoyas a un compañero rezagado sin descuidar tu estación?",
    ],
    recommendation: "Completar onboarding con énfasis en conexión cocina-experiencia.",
    riskNote: "Riesgo bajo. Seguir adopción de rituales de apertura.",
  },
  {
    id: "cand-13",
    name: "Marcela Torres",
    stage: "interview",
    role: "Cajero",
    city: "Bogotá",
    availability: "Inmediata",
    experience: "3 años en food hall y marcas premium.",
    cultureScore: 87,
    serviceScore: 84,
    overallScore: 86,
    strengths: ["Agilidad", "Exactitud", "Empatía comercial"],
    aiSummary:
      "Muy buena opción para cerrar brechas de caja sin convertir la interacción en algo transaccional. Aporta orden y presencia.",
    interviewQuestions: [
      "¿Cómo manejas una fila larga sin perder precisión?",
      "¿Qué haces para sugerir un extra con naturalidad?",
      "¿Cómo explicas una corrección de cuenta con calma?",
    ],
    recommendation: "Entrevista final para Usaquén.",
    riskNote: "Riesgo bajo. Confirmar manejo de cierres con sistema POS.",
  },
  {
    id: "cand-14",
    name: "Daniel Rojas",
    stage: "shortlisted",
    role: "Cocina",
    city: "Barranquilla",
    availability: "10 días",
    experience: "6 años en producción, mise en place y coordinación de comandas.",
    cultureScore: 74,
    serviceScore: 63,
    overallScore: 73,
    strengths: ["Capacidad técnica", "Resistencia", "Velocidad"],
    aiSummary:
      "Puede ser útil para apagar incendios de operación, pero no es naturalmente colaborativo. Si entra, debe hacerlo con seguimiento cercano.",
    interviewQuestions: [
      "¿Cómo respondes cuando el salón te pide acelerar una mesa importante?",
      "¿Cómo mantienes limpieza en medio del caos?",
      "¿Qué haces cuando otro cocinero no está dando el nivel?",
    ],
    recommendation: "Solo avanzar si el fit cultural mejora en entrevista estructurada.",
    riskNote: "Riesgo alto. Referencias muestran fricción con jefaturas anteriores.",
  },
  {
    id: "cand-15",
    name: "Manuela Giraldo",
    stage: "new",
    role: "Anfitrión",
    city: "Cartagena",
    availability: "Inmediata",
    experience: "2 años en hotelería y recepción.",
    cultureScore: 89,
    serviceScore: 83,
    overallScore: 86,
    strengths: ["Primera impresión", "Orden", "Idioma inglés"],
    aiSummary:
      "Tiene tono y presencia para un punto turístico. Si aprende rápido la lógica del salón, puede volverse una pieza muy valiosa.",
    interviewQuestions: [
      "¿Cómo manejas a un cliente que llega molesto antes de sentarse?",
      "¿Qué detalles observas para anticipar una experiencia especial?",
      "¿Cómo equilibras velocidad y calidez en recepción?",
    ],
    recommendation: "Subir a preselección para Bocagrande.",
    riskNote: "Riesgo bajo. Revisar disponibilidad de noches extendidas.",
  },
  {
    id: "cand-16",
    name: "Luis Fernando Díaz",
    stage: "hired",
    role: "Mesero",
    city: "Cali",
    availability: "Contratado",
    experience: "3 años en restaurantes de alto flujo y banquetes.",
    cultureScore: 85,
    serviceScore: 87,
    overallScore: 86,
    strengths: ["Ritmo", "Ventas", "Actitud"],
    aiSummary:
      "Contratación orientada a subir ticket y sostener velocidad. Tiene potencial para convertirse en referente del punto.",
    interviewQuestions: [
      "¿Qué vendes primero cuando la mesa viene a celebrar?",
      "¿Cómo manejas cambios de último minuto en comanda?",
      "¿Qué hábito te diferencia como mesero?",
    ],
    recommendation: "Acelerar onboarding de upsell y protocolo de celebración.",
    riskNote: "Riesgo bajo. Medir desempeño en primera quincena.",
  },
  {
    id: "cand-17",
    name: "Tatiana Forero",
    stage: "trial",
    role: "Cajero",
    city: "Bogotá",
    availability: "Inmediata",
    experience: "4 años en caja, delivery y conciliación.",
    cultureScore: 82,
    serviceScore: 78,
    overallScore: 80,
    strengths: ["Orden", "Concentración", "Seguimiento"],
    aiSummary:
      "Puede corregir fricción en caja desde el primer día. Le falta un poco de calidez en el speech comercial, pero es entrenable.",
    interviewQuestions: [
      "¿Cómo mantienes foco con muchas órdenes simultáneas?",
      "¿Qué haces cuando un cliente siente que la cuenta está mal?",
      "¿Cómo conviertes un cierre rápido en una experiencia correcta?",
    ],
    recommendation: "Prueba recomendada para Usaquén o Parque 93.",
    riskNote: "Riesgo medio. Validar adaptación a ritmo muy alto de fines de semana.",
  },
  {
    id: "cand-18",
    name: "Juan Esteban Mejía",
    stage: "shortlisted",
    role: "Mesero",
    city: "Medellín",
    availability: "Inmediata",
    experience: "5 años en restaurantes con show de experiencia y banquetes.",
    cultureScore: 93,
    serviceScore: 92,
    overallScore: 93,
    strengths: ["Storytelling", "Celebración", "Ventas premium"],
    aiSummary:
      "Uno de los perfiles más completos del pipeline. Tiene lenguaje comercial, manejo de energía y lectura de mesa muy por encima del promedio.",
    interviewQuestions: [
      "¿Cómo conviertes una visita normal en una celebración memorable?",
      "¿Qué guion usas para vender una segunda ronda sin ser invasivo?",
      "¿Cómo mantienes consistencia cuando el salón está lleno?",
    ],
    recommendation: "Prioridad alta para Laureles o plan cantera de liderazgo.",
    riskNote: "Riesgo bajo. Revisar aspiración salarial vs. estructura actual.",
  },
  {
    id: "cand-19",
    name: "Katherine Solarte",
    stage: "interview",
    role: "Líder de punto",
    city: "Cali",
    availability: "20 días",
    experience: "8 años liderando casual dining y entrenamiento de equipos.",
    cultureScore: 90,
    serviceScore: 84,
    overallScore: 88,
    strengths: ["Formación", "Disciplina", "Cultura"],
    aiSummary:
      "Candidata muy fuerte para profesionalizar ejecución. Tiene mentalidad de entrenamiento continuo, justo donde la cadena quiere diferenciarse.",
    interviewQuestions: [
      "¿Cómo adaptas formación según el desempeño real del punto?",
      "¿Qué tablero revisas cada día y qué decisiones tomas con él?",
      "¿Cómo equilibras cultura, ventas y control operativo?",
    ],
    recommendation: "Mantener en finalistas para Granada o futura expansión.",
    riskNote: "Riesgo bajo. Confirmar velocidad de incorporación.",
  },
  {
    id: "cand-20",
    name: "Óscar Velasco",
    stage: "new",
    role: "Cocina",
    city: "Bucaramanga",
    availability: "Inmediata",
    experience: "2 años en producción y ensamble de tickets rápidos.",
    cultureScore: 72,
    serviceScore: 61,
    overallScore: 70,
    strengths: ["Velocidad", "Disciplina", "Disponibilidad"],
    aiSummary:
      "Es una opción de cobertura rápida más que de alto potencial. Puede ayudar a estabilizar operación si la supervisión es estrecha.",
    interviewQuestions: [
      "¿Qué haces si recibes varias comandas urgentes al mismo tiempo?",
      "¿Cómo te aseguras de no cometer errores con presión?",
      "¿Qué parte del trabajo en cocina disfrutas más?",
    ],
    recommendation: "Dejar en pool secundario hasta validar mejor fit cultural.",
    riskNote: "Riesgo medio-alto. Requiere estructura y feedback muy frecuente.",
  },
];

export const benitezModules: BenitezModule[] = [
  {
    id: "cultura-benitez",
    title: "Cultura Benítez",
    category: "Cultura",
    description:
      "Qué significa operar una marca de celebración: energía, hospitalidad y disciplina visible en cada turno.",
    duration: "18 min",
    targetRoles: ["Todos"],
    impact: "Estabiliza experiencia y onboarding desde la primera semana.",
  },
  {
    id: "protocolo-celebracion",
    title: "Protocolo de celebración",
    category: "Servicio",
    description:
      "Secuencia de canto, timing, coordinación con cocina y manejo de sorpresa para cumpleaños y grupos.",
    duration: "22 min",
    targetRoles: ["Mesero", "Anfitrión", "Líder de punto"],
    impact: "Mejora percepción de marca y repetición de visitas.",
  },
  {
    id: "venta-sugerida",
    title: "Venta sugerida y ticket promedio",
    category: "Ventas",
    description:
      "Cómo recomendar entradas, bebidas y extras premium según tipo de mesa y momento del servicio.",
    duration: "16 min",
    targetRoles: ["Mesero", "Anfitrión", "Cajero", "Líder de punto"],
    impact: "Aumenta ticket promedio sin generar fricción comercial.",
  },
  {
    id: "tiempos-pico",
    title: "Manejo de tiempos pico",
    category: "Operación",
    description:
      "Ritmo, asignación de tareas y control visual para responder mejor en almuerzos y noches de alta ocupación.",
    duration: "19 min",
    targetRoles: ["Cocina", "Mesero", "Líder de punto"],
    impact: "Reduce esperas y evita deterioro de satisfacción.",
  },
  {
    id: "manejo-quejas",
    title: "Manejo de quejas",
    category: "Servicio",
    description:
      "Guía práctica para recuperar experiencia, contener escalaciones y cerrar con sensación positiva.",
    duration: "14 min",
    targetRoles: ["Mesero", "Anfitrión", "Cajero", "Líder de punto"],
    impact: "Disminuye fricción y protege reputación del punto.",
  },
  {
    id: "hospitalidad-experiencia",
    title: "Hospitalidad y experiencia",
    category: "Cultura",
    description:
      "Microcomportamientos visibles que convierten una visita funcional en una experiencia memorable.",
    duration: "17 min",
    targetRoles: ["Todos"],
    impact: "Aumenta satisfacción y consistencia entre turnos.",
  },
  {
    id: "cocina-hora-pico",
    title: "Coordinación de cocina en hora pico",
    category: "Operación",
    description:
      "Preparación previa, lectura de tickets y sincronización con salón para no perder velocidad.",
    duration: "21 min",
    targetRoles: ["Cocina", "Líder de punto"],
    impact: "Recorta minutos de preparación en picos complejos.",
  },
  {
    id: "caja-fluida",
    title: "Caja sin fricción y cierres limpios",
    category: "Operación",
    description:
      "Cobro ágil, cierres ordenados y lenguaje comercial breve para no romper el cierre de experiencia.",
    duration: "13 min",
    targetRoles: ["Cajero", "Líder de punto"],
    impact: "Disminuye filas y errores de cuenta.",
  },
];

const collaboratorFirstNames = [
  "Valentina",
  "Mateo",
  "Isabella",
  "Samuel",
  "Antonia",
  "Juan José",
  "Lucía",
  "Jerónimo",
  "Mariana",
  "Tomás",
  "Sara",
  "Emiliano",
];

const collaboratorLastNames = [
  "Gómez",
  "Rodríguez",
  "Pérez",
  "Londoño",
  "Cárdenas",
  "Arias",
  "Castro",
  "Molina",
  "Morales",
  "Ramírez",
  "Mejía",
  "Salazar",
];

const roleRotation: BenitezRole[] = [
  "Mesero",
  "Mesero",
  "Anfitrión",
  "Cocina",
  "Cajero",
  "Líder de punto",
];

const roleBaseProgress: Record<BenitezRole, number> = {
  Mesero: 72,
  Anfitrión: 75,
  Cocina: 68,
  Cajero: 74,
  "Líder de punto": 78,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return values.length ? sum(values) / values.length : 0;
}

function getRequiredModulesForRole(role: BenitezRole) {
  return benitezModules
    .filter(
      (module) =>
        module.targetRoles.includes("Todos") || module.targetRoles.includes(role)
    )
    .map((module) => module.id);
}

export const benitezCollaborators: BenitezCollaborator[] = Array.from(
  { length: 48 },
  (_, index) => {
    const location = benitezLocations[index % benitezLocations.length];
    const role = roleRotation[index % roleRotation.length];
    const requiredModules = getRequiredModulesForRole(role);
    const rawProgress =
      roleBaseProgress[role] +
      Math.round(location.trainingCompliance * 0.18) +
      ((index * 7) % 16) -
      11;
    const progress = clamp(rawProgress, 48, 99);
    const completedCount = clamp(
      Math.round((requiredModules.length * progress) / 100),
      1,
      requiredModules.length
    );
    const completedModuleIds = requiredModules.slice(0, completedCount);
    const pendingModuleIds = requiredModules.slice(completedCount);
    const performanceScore = clamp(
      Math.round(progress * 0.52 + location.globalScore * 0.38 + (index % 9)),
      59,
      98
    );
    const streakDays = 2 + ((index * 3) % 19);
    const status =
      progress >= 85 ? "Al día" : progress >= 70 ? "En foco" : "Rezagado";

    return {
      id: `collab-${index + 1}`,
      name: `${collaboratorFirstNames[index % collaboratorFirstNames.length]} ${
        collaboratorLastNames[(index * 5) % collaboratorLastNames.length]
      }`,
      role,
      locationId: location.id,
      progress,
      performanceScore,
      streakDays,
      completedModuleIds,
      pendingModuleIds,
      recommendedModuleId:
        pendingModuleIds[0] ??
        requiredModules[requiredModules.length - 1] ??
        benitezModules[0].id,
      status,
    };
  }
);

export const benitezLocationMap = Object.fromEntries(
  benitezLocations.map((location) => [location.id, location])
) as Record<string, BenitezLocation>;

export const benitezModuleMap = Object.fromEntries(
  benitezModules.map((module) => [module.id, module])
) as Record<string, BenitezModule>;

export const benitezSalesTrend = BENITEZ_WEEKS.map((label, index) => ({
  label,
  sales: benitezLocations.reduce(
    (total, location) => total + location.weeklySales[index],
    0
  ),
  averageTicket: Math.round(
    average(
      benitezLocations.map(
        (location) => location.averageTicket - (5 - index) * 350 + index * 120
      )
    )
  ),
  score: Math.round(
    average(benitezLocations.map((location) => location.globalScore - 4 + index))
  ),
}));

export const benitezLocationRanking = [...benitezLocations].sort(
  (left, right) => right.globalScore - left.globalScore
);

export const benitezTopRiskLocations = benitezLocations.filter(
  (location) => location.riskLevel === "high" || location.globalScore < 80
);

export const benitezExecutiveSummary = [
  "La cadena se sostiene sobre dos fortalezas muy claras: experiencia en punto y una propuesta de celebración que ya demuestra impacto comercial en Bogotá y Medellín.",
  "El principal cuello de botella no está en ventas, sino en ejecución desigual entre sedes: vacantes abiertas, formación incompleta y tiempos de servicio irregulares ya están frenando el ticket en Pereira, Barranquilla y Laureles.",
  "Benítez OS convierte esas señales dispersas en una sola torre de control: detecta dónde contratar primero, qué entrenar y qué acciones operativas ejecutar para proteger rentabilidad.",
];

export const benitezOpportunitySignals: BenitezInsightItem[] = [
  {
    title: "Recuperar ticket promedio en Pereira",
    detail:
      "Si el punto sube de 64.2k a 69k COP replicando venta sugerida de Zona G, recupera una brecha relevante sin inversión estructural.",
    impact: "+27M COP/mes",
  },
  {
    title: "Escalar el playbook de celebración",
    detail:
      "Hay 14 puntos de diferencia entre la mejor y la peor ejecución de celebración. Estandarizarlo puede elevar satisfacción y repetición.",
    impact: "+4.2 pts NPS estimados",
  },
  {
    title: "Cerrar vacantes críticas antes de mayo",
    detail:
      "Cinco posiciones explican la mayor parte del riesgo operativo actual: 2 meseros y 1 líder en Pereira, 1 cocina y 1 anfitrión en Barranquilla.",
    impact: "-1.6 min en servicio",
  },
  {
    title: "Usar formación adaptativa por punto",
    detail:
      "Los puntos con menor cumplimiento tienen dolores distintos. El valor está en recomendar cápsulas específicas según desempeño, no por calendario.",
    impact: "+11 pts en cumplimiento",
  },
];

export const benitezGlobalAlerts = benitezLocations
  .flatMap((location) =>
    location.alerts.map((detail, index) => ({
      id: `${location.id}-${index}`,
      title:
        index === 0
          ? `${location.name} requiere atención`
          : `Señal operacional en ${location.name}`,
      detail,
      severity:
        location.riskLevel === "high"
          ? "Alta"
          : location.riskLevel === "medium"
            ? "Media"
            : "Baja" as "Alta" | "Media" | "Baja",
      locationId: location.id,
    }))
  )
  .sort((left, right) => {
    const severityOrder: Record<"Alta" | "Media" | "Baja", number> = {
      Alta: 0,
      Media: 1,
      Baja: 2,
    };
    return severityOrder[left.severity] - severityOrder[right.severity];
  })
  .slice(0, 8);

export const benitezRecruitmentPipeline = candidateStageOrder.map((stage) => ({
  stage,
  label: candidateStageLabels[stage],
  candidates: benitezCandidates.filter((candidate) => candidate.stage === stage),
}));

export const benitezTopCandidates = [...benitezCandidates]
  .filter((candidate) => candidate.stage !== "hired")
  .sort((left, right) => right.overallScore - left.overallScore)
  .slice(0, 5);

export const benitezHiringInsights: BenitezInsightItem[] = [
  {
    title: "Mover líderes antes que meseros en puntos críticos",
    detail:
      "Circunvalar y Usaquén no solo necesitan manos; necesitan liderazgo que ordene turno, briefing y seguimiento en piso.",
    impact: "Reduce fricción de onboarding",
  },
  {
    title: "Activar fast-track para perfiles experienciales",
    detail:
      "Los mejores perfiles de servicio y celebración deben saltar directamente a entrevista final cuando el punto depende de experiencia para vender más.",
    impact: "Time-to-hire -5 días",
  },
  {
    title: "Usar score cultural como filtro de calidad",
    detail:
      "Para Benítez no basta con experiencia técnica. Los candidatos con score cultural superior a 88 muestran mejor retención y mejor recepción en entrenamiento.",
    impact: "+18% retención esperada",
  },
];

export const benitezRoleTracks = (
  ["Mesero", "Anfitrión", "Cocina", "Cajero", "Líder de punto"] as BenitezRole[]
).map((role) => {
  const people = benitezCollaborators.filter((collaborator) => collaborator.role === role);
  const suggestedModuleId = people
    .map((collaborator) => collaborator.recommendedModuleId)
    .sort()[0];

  return {
    role,
    collaborators: people.length,
    averageProgress: Math.round(average(people.map((person) => person.progress))),
    averagePerformance: Math.round(
      average(people.map((person) => person.performanceScore))
    ),
    suggestedModule: benitezModuleMap[suggestedModuleId]?.title ?? "Cultura Benítez",
    laggingCount: people.filter((person) => person.status === "Rezagado").length,
  };
});

export const benitezAcademyByLocation = benitezLocations.map((location) => {
  const team = benitezCollaborators.filter(
    (collaborator) => collaborator.locationId === location.id
  );
  return {
    locationId: location.id,
    locationName: location.name,
    averageProgress: Math.round(average(team.map((member) => member.progress))),
    completedRate: Math.round(
      average(team.map((member) => member.completedModuleIds.length * 20))
    ),
    laggingCount: team.filter((member) => member.status === "Rezagado").length,
    topModule:
      benitezModuleMap[
        team.find((member) => member.pendingModuleIds.length > 0)?.pendingModuleIds[0] ??
          "cultura-benitez"
      ]?.title ?? "Cultura Benítez",
  };
});

export const benitezTopCollaborators = [...benitezCollaborators]
  .sort((left, right) => right.progress - left.progress)
  .slice(0, 10);

export const benitezAcademyRecommendations: BenitezInsightItem[] = [
  {
    title: "Adaptar formación por señal de negocio",
    detail:
      "Pereira y Barranquilla necesitan una combinación distinta: celebración, tiempos pico y coaching comercial, no solo cápsulas genéricas.",
    impact: "Formación conectada a operación",
  },
  {
    title: "Forzar onboarding visible en líderes nuevos",
    detail:
      "Los líderes con onboarding incompleto correlacionan con más alertas de servicio y menor adherencia del equipo.",
    impact: "Reduce dispersión entre turnos",
  },
  {
    title: "Subir refuerzo de upsell en caja y salón",
    detail:
      "Los módulos de venta sugerida hoy explican una parte importante de la brecha entre puntos top y medios.",
    impact: "+3 a +5% ticket promedio",
  },
];

export const benitezDashboardStats = {
  totalSales: sum(benitezLocations.map((location) => location.monthlySales)),
  averageTicket: Math.round(
    average(benitezLocations.map((location) => location.averageTicket))
  ),
  globalScore: Math.round(
    average(benitezLocations.map((location) => location.globalScore))
  ),
  pointsAtRisk: benitezTopRiskLocations.length,
  overdueTraining: benitezCollaborators.filter(
    (collaborator) => collaborator.progress < 70
  ).length,
  openVacancies: sum(benitezLocations.map((location) => location.openVacancies)),
  celebrationsExecuted: sum(
    benitezLocations.map((location) => location.celebrationsExecuted)
  ),
  chainSatisfaction: Math.round(
    average(benitezLocations.map((location) => location.satisfaction))
  ),
};

export const benitezLandingHighlights = [
  {
    label: "Ventas mensuales consolidadas",
    value: benitezDashboardStats.totalSales,
    kind: "currency" as const,
    detail: "10 puntos conectados en una sola torre de control",
  },
  {
    label: "Vacantes activas priorizadas por impacto",
    value: benitezDashboardStats.openVacancies,
    kind: "number" as const,
    detail: "Hiring intelligence con foco en servicio y cultura",
  },
  {
    label: "Cumplimiento formativo con señal operativa",
    value: Math.round(
      average(benitezLocations.map((location) => location.trainingCompliance))
    ),
    kind: "percent" as const,
    detail: "La academia se adapta al dolor real de cada punto",
  },
  {
    label: "Score global de la red",
    value: benitezDashboardStats.globalScore,
    kind: "score" as const,
    detail: "Visibilidad ejecutiva para intervenir antes de que el problema escale",
  },
];

export const benitezCapabilities: BenitezInsightItem[] = [
  {
    title: "AI Executive Summary",
    detail:
      "Lectura automática del negocio: dónde cae el ticket, qué punto requiere atención y qué palancas mover primero.",
  },
  {
    title: "AI Hiring Recommendation",
    detail:
      "Priorización de candidatos por fit cultural, servicio y urgencia operativa de cada sede.",
  },
  {
    title: "AI Training Recommendation",
    detail:
      "Rutas de formación dinámicas según desempeño real del punto, no según un calendario estático.",
  },
  {
    title: "AI Operational Actions",
    detail:
      "Sugerencias accionables para corregir tiempos, servicio, celebración y captura de ticket promedio.",
  },
];

export const benitezOperationsHeatmap = benitezLocations.map((location) => ({
  locationId: location.id,
  label: location.name,
  values: [
    { label: "Operación", value: location.globalScore },
    { label: "Servicio", value: location.satisfaction },
    { label: "Formación", value: location.trainingCompliance },
    { label: "Celebración", value: location.celebrationRate },
    {
      label: "Ticket",
      value: clamp(
        Math.round((location.averageTicket / 80_000) * 100),
        60,
        100
      ),
    },
  ],
}));

export const benitezModulePreview = [
  {
    href: "/benitez-os/dashboard",
    title: "Control Tower",
    description:
      "Visión ejecutiva del negocio con ventas, ticket promedio, sedes en riesgo, alertas y lectura gerencial asistida.",
  },
  {
    href: "/benitez-os/recruitment",
    title: "Hiring Intelligence",
    description:
      "Pipeline moderno de reclutamiento con scoring por cultura, servicio y recomendación de contratación.",
  },
  {
    href: "/benitez-os/academy",
    title: "Academy",
    description:
      "Formación viva por rol, colaborador y punto, conectada al desempeño real de la operación.",
  },
  {
    href: "/benitez-os/operations",
    title: "Operations",
    description:
      "Desempeño por sede, alertas, cumplimiento, experiencia y recomendaciones accionables para mover la operación.",
  },
];
