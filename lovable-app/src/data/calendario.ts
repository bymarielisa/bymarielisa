/**
 * Cumpleaños y días no lectivos del curso 2026-2027. Los recordatorios y citas de Damián
 * ahora viven en Netlify Blobs (src/lib/recordatoriosExtra.ts), editables desde la app.
 * Todas las fechas se manejan en hora local (año/mes/día), nunca en UTC.
 */

// ---------- Cumpleaños (día/mes, sin año) ----------
export type TipoCumple = "damian" | "familia" | "amigo";
export interface Cumple {
  nombre: string;
  dia: number;
  mes: number; // 1-12
  tipo: TipoCumple;
}

export const CUMPLEANOS: Cumple[] = [
  { nombre: "Gonzalo", dia: 18, mes: 3, tipo: "amigo" },
  { nombre: "Adrián", dia: 28, mes: 4, tipo: "amigo" },
  { nombre: "Victoria", dia: 6, mes: 5, tipo: "amigo" },
  { nombre: "Rodrigo", dia: 8, mes: 7, tipo: "amigo" },
  { nombre: "Daniela", dia: 15, mes: 8, tipo: "amigo" },
  { nombre: "Lola", dia: 4, mes: 10, tipo: "amigo" },
  { nombre: "Damián", dia: 21, mes: 10, tipo: "damian" },
  { nombre: "Mamá", dia: 2, mes: 12, tipo: "familia" },
  { nombre: "Claudia", dia: 16, mes: 12, tipo: "familia" },
  { nombre: "Papá", dia: 19, mes: 12, tipo: "familia" },
  // 👉 Añade aquí más cumpleaños
];

// ---------- Días no lectivos ----------
export interface Festivo {
  anio: number;
  mes: number; // 1-12
  dia: number;
  nombre: string;
}

export const FESTIVOS: Festivo[] = [
  { anio: 2026, mes: 10, dia: 12, nombre: "Fiesta Nacional" },
  { anio: 2026, mes: 11, dia: 2, nombre: "Todos los Santos" },
  { anio: 2026, mes: 11, dia: 9, nombre: "La Almudena" },
  { anio: 2026, mes: 12, dia: 7, nombre: "Día de la Constitución" },
  { anio: 2026, mes: 12, dia: 8, nombre: "Inmaculada Concepción" },
  { anio: 2026, mes: 12, dia: 23, nombre: "Comienzan las vacaciones de Navidad" },
  // 👉 Añade aquí los siguientes festivos / días no lectivos
];
