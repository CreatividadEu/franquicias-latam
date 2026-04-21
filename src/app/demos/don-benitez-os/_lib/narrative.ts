import type { NarrativeFlag, PointId } from "./types";

export const NARRATIVE_FLAGS: Record<PointId, NarrativeFlag> = {
  chapinero: "star",
  "medellin-poblado": "second-best",
  kennedy: "wait-problem",
  "cali-granada": "ramping",
  barranquilla: "food-cost",
  usaquen: "steady",
  cedritos: "steady",
  salitre: "steady",
  "medellin-laureles": "steady",
  bucaramanga: "steady",
};

export const POINT_NAMES: Record<PointId, string> = {
  chapinero: "Chapinero",
  usaquen: "Usaquén",
  cedritos: "Cedritos",
  salitre: "Salitre",
  kennedy: "Kennedy",
  "medellin-poblado": "Medellín · Poblado",
  "medellin-laureles": "Medellín · Laureles",
  "cali-granada": "Cali · Granada",
  barranquilla: "Barranquilla",
  bucaramanga: "Bucaramanga",
};

export const POINT_CITIES: Record<PointId, string> = {
  chapinero: "Bogotá",
  usaquen: "Bogotá",
  cedritos: "Bogotá",
  salitre: "Bogotá",
  kennedy: "Bogotá",
  "medellin-poblado": "Medellín",
  "medellin-laureles": "Medellín",
  "cali-granada": "Cali",
  barranquilla: "Barranquilla",
  bucaramanga: "Bucaramanga",
};

export const POINT_MANAGERS: Record<PointId, string> = {
  chapinero: "Laura Téllez",
  usaquen: "Andrés Moreno",
  cedritos: "Mariana Ruiz",
  salitre: "Juan Pablo Ochoa",
  kennedy: "Camilo Restrepo",
  "medellin-poblado": "Isabela Jaramillo",
  "medellin-laureles": "Daniel Ortiz",
  "cali-granada": "Valentina Cruz",
  barranquilla: "Esteban Polo",
  bucaramanga: "Natalia Rojas",
};

export const FLAG_COPY: Record<NarrativeFlag, string> = {
  star: "Referente · NPS top · ticket alto",
  "second-best": "Segundo mejor consistente",
  "wait-problem": "Anomalía de espera · 14 días",
  ramping: "Apertura reciente · rampa operativa",
  "food-cost": "Food cost fuera de rango",
  steady: "Operación estable",
};

export const ALL_POINTS: PointId[] = [
  "chapinero",
  "usaquen",
  "cedritos",
  "salitre",
  "kennedy",
  "medellin-poblado",
  "medellin-laureles",
  "cali-granada",
  "barranquilla",
  "bucaramanga",
];
