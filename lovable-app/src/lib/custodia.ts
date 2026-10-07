import type { ExcepcionCustodia } from "@/lib/custodiaExcepciones";
import { aFechaISO, esFinDeSemana } from "./fechas";

export type Progenitor = "papa" | "mama";

export const NOMBRE: Record<Progenitor, string> = { papa: "Papá", mama: "Mamá" };
const DESDE_NOMBRE: Record<string, Progenitor> = { Papá: "papa", Mamá: "mama" };

/** Excepción (si la hay) para el día de `fecha`, de una lista ya cargada */
export function excepcionEnFecha(
  excepciones: ExcepcionCustodia[],
  fecha: Date,
): ExcepcionCustodia | undefined {
  const iso = aFechaISO(fecha);
  return excepciones.find((e) => e.fecha === iso);
}

/** Hora (24h) a la que se produce el cambio los días 1 y 16 (cuando D sale del cole) */
export const HORA_CAMBIO = 17;

/**
 * Regla fija mensual:
 *  - día 1 (tarde) → día 16 (mañana): Papá
 *  - día 16 (tarde) → día 1 siguiente (mañana): Mamá
 * TODO: periodos de vacaciones escolares (sin regla especial definida todavía).
 */
export function quienTiene(fecha: Date): Progenitor {
  const d = fecha.getDate();
  const tarde = fecha.getHours() >= HORA_CAMBIO;
  if (d === 1) return tarde ? "papa" : "mama";
  if (d === 16) return tarde ? "mama" : "papa";
  return d < 16 ? "papa" : "mama";
}

/** Igual que `quienTiene`, pero una excepción de mutuo acuerdo para ese día la sustituye (día completo) */
export function quienTieneConExcepciones(
  fecha: Date,
  excepciones: ExcepcionCustodia[],
): Progenitor {
  const exc = excepcionEnFecha(excepciones, fecha);
  if (exc) return DESDE_NOMBRE[exc.quien] ?? quienTiene(fecha);
  return quienTiene(fecha);
}

export const esDiaDeCambio = (dia: number) => dia === 1 || dia === 16;

/** Quién tiene la mañana y la tarde de un día concreto del mes */
export function repartoDia(dia: number): { manana: Progenitor; tarde: Progenitor } {
  if (dia === 1) return { manana: "mama", tarde: "papa" };
  if (dia === 16) return { manana: "papa", tarde: "mama" };
  const p: Progenitor = dia < 16 ? "papa" : "mama";
  return { manana: p, tarde: p };
}

export interface ProximoCambio {
  fecha: Date;
  hacia: Progenitor;
  finDeSemana: boolean;
}

export function proximoCambio(ahora: Date): ProximoCambio {
  const y = ahora.getFullYear();
  const m = ahora.getMonth();
  const candidatos = [
    new Date(y, m, 1, HORA_CAMBIO),
    new Date(y, m, 16, HORA_CAMBIO),
    new Date(y, m + 1, 1, HORA_CAMBIO),
  ];
  const fecha = candidatos.find((c) => c.getTime() > ahora.getTime())!;
  return {
    fecha,
    hacia: fecha.getDate() === 1 ? "papa" : "mama",
    finDeSemana: esFinDeSemana(fecha),
  };
}
