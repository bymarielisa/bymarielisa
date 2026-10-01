import { CLASE_FRANJAS_HORAS, CLASE_HORARIO, type ClaveAsignatura } from "@/data/horarioClase";
import type { DiaSemana } from "@/data/horario";
import { minutosDelDia, parseHora } from "./fechas";

/** Asignatura que toca en un día+hora dados, o null si está fuera de las franjas (antes de las 9:00 o desde las 14:00). */
export function asignaturaEnFranja(dia: DiaSemana, minutos: number): ClaveAsignatura | null {
  const franjas = CLASE_HORARIO[dia];
  const primeraHora = CLASE_FRANJAS_HORAS[0];
  if (!franjas || !primeraHora) return null;
  if (minutos < parseHora(primeraHora) || minutos >= parseHora("14:00")) return null;

  for (let i = 0; i < franjas.length; i++) {
    const horaInicio = CLASE_FRANJAS_HORAS[i];
    const horaFin = CLASE_FRANJAS_HORAS[i + 1];
    const franja = franjas[i];
    if (!horaInicio || !horaFin || !franja) continue;
    if (minutos >= parseHora(horaInicio) && minutos < parseHora(horaFin)) return franja.asignatura;
  }
  return null;
}

export const asignaturaAhora = (fecha: Date): ClaveAsignatura | null =>
  asignaturaEnFranja(fecha.getDay() as DiaSemana, minutosDelDia(fecha));
