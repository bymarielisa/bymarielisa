/**
 * Horario de clase oficial del curso 2026-27 (Infantil 4 años A, CEIP María de Villota).
 * Para cambiar de profe, color o descripción de una asignatura, edita CLASE_ASIGNATURAS.
 * Para cambiar una franja horaria, edita CLASE_HORARIO.
 */
import type { DiaSemana } from "./horario";

export type ClaveAsignatura =
  "AREA1" | "AREA2" | "AREA3" | "INGLES" | "MUSICA" | "PSICO" | "MAE" | "PATIO";

export interface Asignatura {
  nombre: string;
  etiqueta: string;
  /** Token de color del sistema de diseño (ver styles.css): sky, sun, coral, leaf, lilac, teal, orange, sand */
  color: "sky" | "sun" | "coral" | "leaf" | "lilac" | "teal" | "orange" | "sand";
  icono: string;
  descripcion: string;
  profe: string | null;
}

export const CLASE_ASIGNATURAS: Record<ClaveAsignatura, Asignatura> = {
  AREA1: {
    nombre: "Área 1",
    etiqueta: "Área 1 · Crecimiento en Armonía",
    color: "leaf",
    icono: "🌱",
    descripcion:
      "Conocerse a sí mismo, emociones, autonomía (baño, comer, vestirse), hábitos de higiene y convivencia con los demás.",
    profe: "Sara (tutora)",
  },
  AREA2: {
    nombre: "Área 2",
    etiqueta: "Área 2 · Descubrimiento y Exploración del Entorno",
    color: "sky",
    icono: "🔎",
    descripcion:
      "Números, formas, colores, clasificar, naturaleza, animales, estaciones y pequeños experimentos.",
    profe: "Sara (tutora)",
  },
  AREA3: {
    nombre: "Área 3",
    etiqueta: "Área 3 · Comunicación y Representación de la Realidad",
    color: "coral",
    icono: "🎨",
    descripcion:
      "Lenguaje oral, iniciación a la lectoescritura, cuentos, dibujo y plástica, expresión corporal.",
    profe: "Sara (tutora)",
  },
  INGLES: {
    nombre: "Inglés",
    etiqueta: "Inglés",
    color: "sun",
    icono: "🇬🇧",
    descripcion: "Clase de inglés del colegio bilingüe.",
    profe: "Miss Pilar (Pilar Vera)",
  },
  MUSICA: {
    nombre: "Música",
    etiqueta: "Música",
    color: "teal",
    icono: "🎵",
    descripcion: "Clase de música.",
    profe: "Alba",
  },
  PSICO: {
    nombre: "Psicomotricidad",
    etiqueta: "Psicomotricidad",
    color: "orange",
    icono: "🤸",
    descripcion: "Psicomotricidad.",
    profe: "Sara (tutora)",
  },
  MAE: {
    nombre: "MAE/Religión",
    etiqueta: "MAE / Religión",
    color: "sand",
    icono: "🕊️",
    descripcion:
      "Religión o Medidas de Atención Educativa (la alternativa a Religión), según lo elegido en la matrícula.",
    profe: "Según matrícula",
  },
  PATIO: {
    nombre: "Patio",
    etiqueta: "Patio",
    color: "sand",
    icono: "🌳",
    descripcion: "Recreo de 11:15 a 11:45.",
    profe: null,
  },
};

export interface FranjaClase {
  hora: string; // "HH:MM"
  asignatura: ClaveAsignatura;
}

/** Franjas de referencia: cada franja empieza en `hora` y termina en la siguiente de esta lista. */
export const CLASE_FRANJAS_HORAS = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "11:45",
  "12:30",
  "13:15",
  "14:00",
];

export const CLASE_HORARIO: Record<DiaSemana, FranjaClase[]> = {
  1: [
    { hora: "09:00", asignatura: "AREA1" },
    { hora: "09:45", asignatura: "AREA2" },
    { hora: "10:30", asignatura: "AREA1" },
    { hora: "11:15", asignatura: "PATIO" },
    { hora: "11:45", asignatura: "INGLES" },
    { hora: "12:30", asignatura: "AREA3" },
    { hora: "13:15", asignatura: "MAE" },
  ],
  2: [
    { hora: "09:00", asignatura: "INGLES" },
    { hora: "09:45", asignatura: "AREA2" },
    { hora: "10:30", asignatura: "AREA1" },
    { hora: "11:15", asignatura: "PATIO" },
    { hora: "11:45", asignatura: "AREA2" },
    { hora: "12:30", asignatura: "INGLES" },
    { hora: "13:15", asignatura: "AREA3" },
  ],
  3: [
    { hora: "09:00", asignatura: "AREA1" },
    { hora: "09:45", asignatura: "AREA2" },
    { hora: "10:30", asignatura: "MUSICA" },
    { hora: "11:15", asignatura: "PATIO" },
    { hora: "11:45", asignatura: "AREA2" },
    { hora: "12:30", asignatura: "INGLES" },
    { hora: "13:15", asignatura: "AREA3" },
  ],
  4: [
    { hora: "09:00", asignatura: "AREA1" },
    { hora: "09:45", asignatura: "AREA2" },
    { hora: "10:30", asignatura: "AREA3" },
    { hora: "11:15", asignatura: "PATIO" },
    { hora: "11:45", asignatura: "AREA1" },
    { hora: "12:30", asignatura: "INGLES" },
    { hora: "13:15", asignatura: "AREA2" },
  ],
  5: [
    { hora: "09:00", asignatura: "AREA1" },
    { hora: "09:45", asignatura: "AREA2" },
    { hora: "10:30", asignatura: "MAE" },
    { hora: "11:15", asignatura: "PATIO" },
    { hora: "11:45", asignatura: "AREA1" },
    { hora: "12:30", asignatura: "PSICO" },
    { hora: "13:15", asignatura: "AREA3" },
  ],
};
