/**
 * Datos del horario semanal de Damián (Infantil 4 años A, CEIP María de Villota).
 * Para cambiar la extraescolar o la merienda de un día, edita la entrada correspondiente.
 */
export type DiaSemana = 1 | 2 | 3 | 4 | 5; // 1 = lunes … 5 = viernes

/** Actividad fuera del cole después de la extraescolar normal (natación, rugby…) */
export interface ActividadFueraDelCole {
  nombre: string;
  icono: string;
  inicio: string;
  fin: string;
  lugar: string;
  /** Si se indica, la actividad solo aplica a partir de esta fecha (inclusive) */
  desde?: Date;
  /** Si se indica, la actividad solo aplica hasta esta fecha (exclusive) */
  hasta?: Date;
}

export interface DiaHorario {
  dia: DiaSemana;
  nombre: string;
  extraescolar: string;
  merienda: string;
  actividadFueraDelCole?: ActividadFueraDelCole;
}

export const COLEGIO = {
  nombre: "CEIP María de Villota",
  clase: "Infantil 4 años A",
  tutora: "Sara",
  ingles: "Pilar Vera (Miss Pilar)",
};

/**
 * A partir de esta fecha la natación pasa de los miércoles a los lunes (17:30–18:00),
 * coincidiendo con que Damián cumple oficialmente 4 años.
 * Para el siguiente cambio de día de natación, añade otra fecha de corte aquí.
 */
export const CAMBIO_NATACION_A_LUNES = new Date(2026, 10, 1); // 1 de noviembre de 2026

export const HORARIO_SEMANAL: DiaHorario[] = [
  {
    dia: 1,
    nombre: "Lunes",
    extraescolar: "Música, Arte y Psicomotricidad",
    merienda: "Fruta",
    actividadFueraDelCole: {
      nombre: "Natación",
      icono: "🏊",
      inicio: "17:30",
      fin: "18:00",
      lugar: "Polideportivo",
      desde: CAMBIO_NATACION_A_LUNES,
    },
  },
  {
    dia: 2,
    nombre: "Martes",
    extraescolar: "Inglés",
    merienda: "Lácteos / cereales",
    actividadFueraDelCole: {
      nombre: "Rugby",
      icono: "🏉",
      inicio: "17:30",
      fin: "19:00",
      lugar: "Campo de las Leonas",
    },
  },
  {
    dia: 3,
    nombre: "Miércoles",
    extraescolar: "Música, Arte y Psicomotricidad",
    merienda: "Fruta",
    actividadFueraDelCole: {
      nombre: "Natación",
      icono: "🏊",
      inicio: "17:30",
      fin: "18:00",
      lugar: "Polideportivo",
      hasta: CAMBIO_NATACION_A_LUNES,
    },
  },
  {
    dia: 4,
    nombre: "Jueves",
    extraescolar: "Inglés",
    merienda: "Bocadillo / sándwich",
    actividadFueraDelCole: {
      nombre: "Rugby",
      icono: "🏉",
      inicio: "17:30",
      fin: "19:00",
      lugar: "Campo de las Leonas",
    },
  },
  { dia: 5, nombre: "Viernes", extraescolar: "Minichef", merienda: "Libre" },
];
