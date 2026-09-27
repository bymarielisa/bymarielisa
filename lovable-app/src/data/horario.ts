/**
 * Datos del horario semanal de Damián (Infantil 4 años A, CEIP María de Villota).
 * Para cambiar la extraescolar o la merienda de un día, edita la entrada correspondiente.
 */
export type DiaSemana = 1 | 2 | 3 | 4 | 5; // 1 = lunes … 5 = viernes

export interface DiaHorario {
  dia: DiaSemana;
  nombre: string;
  extraescolar: string;
  merienda: string;
  /** Actividad extra fuera del cole (solo miércoles: natación) */
  natacion?: { inicio: string; fin: string; lugar: string };
}

export const COLEGIO = {
  nombre: "CEIP María de Villota",
  clase: "Infantil 4 años A",
  tutora: "Sara",
  ingles: "Pilar Vera (Miss Pilar)",
};

export const HORARIO_SEMANAL: DiaHorario[] = [
  {
    dia: 1,
    nombre: "Lunes",
    extraescolar: "Robótica",
    merienda: "Fruta",
    natacion: { inicio: "17:30", fin: "18:00", lugar: "Polideportivo" },
  },
  { dia: 2, nombre: "Martes", extraescolar: "Inglés", merienda: "Lácteos / cereales" },
  {
    dia: 3,
    nombre: "Miércoles",
    extraescolar: "Robótica",
    merienda: "Fruta",
    natacion: { inicio: "17:30", fin: "18:00", lugar: "Polideportivo" },
  },
  { dia: 4, nombre: "Jueves", extraescolar: "Inglés", merienda: "Bocadillo / sándwich" },
  { dia: 5, nombre: "Viernes", extraescolar: "Minichef", merienda: "Libre" },
];

/**
 * A partir de esta fecha la natación pasa de los miércoles a los lunes (17:30–18:00).
 * Para el siguiente cambio de día de natación, añade otra fecha de corte aquí y
 * ajusta `diaActivoNatacion` en src/lib/horario.ts.
 */
export const CAMBIO_NATACION_A_LUNES = new Date(2026, 10, 1); // 1 de noviembre de 2026
