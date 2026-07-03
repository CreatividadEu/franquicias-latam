import type { Proposal } from "./types";

/**
 * Registro tipado de propuestas — la vía rápida para crear un cliente
 * sin tocar la base de datos. Ver README.md de este directorio.
 *
 * Alternativa: tabla `proposals` en Supabase con la misma shape
 * (ver supabase/sql/20260703120000_propuestas.sql). El registro gana
 * si el slug existe en ambos lados.
 */
export const PROPOSAL_REGISTRY: Record<string, Proposal> = {
  "la-clasica": {
    slug: "la-clasica",
    cliente: "La Clásica",
    industria: "F&B",
    // logoUrl: "/propuestas/la-clasica.png", // opcional — se integra en el hero
    // acento: "#00F0FF",                     // opcional — default: token de marca

    // Ejemplo financiero ilustrativo (COP) — editar por cliente.
    finanzas: {
      ventasMensuales: 180_000_000,
      utilidadActualPct: 12,
      utilidadOptimizadaPct: 22,
      mesInflexion: 2,
      paybackMeses: 3,
    },

    escenarios: [
      {
        id: "conservador",
        nombre: "Conservador",
        descripcion: "Crecimiento orgánico, franquiciados selectos.",
        unidadesPorAno: [2, 5, 9],
        paybackMeses: 30,
        regaliaPct: 5,
      },
      {
        id: "base",
        nombre: "Base",
        descripcion: "El equilibrio entre velocidad y control de marca.",
        unidadesPorAno: [3, 9, 20],
        paybackMeses: 24,
        regaliaPct: 5,
        destacado: true,
      },
      {
        id: "agresivo",
        nombre: "Agresivo",
        descripcion: "Expansión multi-ciudad con capital de socios.",
        unidadesPorAno: [5, 15, 32],
        paybackMeses: 18,
        regaliaPct: 6,
      },
    ],

    mesObjetivo: "Agosto",
    descuentoPct: 10,
    createdAt: "2026-07-03T12:00:00.000Z",
    // deadline: se resuelve como createdAt + 7 días si no se define.

    whatsapp: "+573001234567", // placeholder — reemplazar por el real
    calUrl: "https://cal.franquiciaslatam.com/estrategia", // placeholder Cal.com
    unlisted: true,

    // Placeholders configurables — la evidencia habla por sí sola.
    videosMercadeo: [
      {
        titulo: "Sebastián Yatra — la marca detrás del artista",
        handle: "@sebastianyatra",
        vistas: 28_400_000,
      },
      {
        titulo: "Cómo franquiciar su negocio en Colombia",
        handle: "@franquiciaslatam",
        vistas: 3_200_000,
      },
      {
        titulo: "Líderes de industria: expansión en LATAM",
        handle: "@franquiciaslatam",
        vistas: 1_800_000,
      },
    ],
  },
};
