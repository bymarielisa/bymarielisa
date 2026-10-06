import { HORARIO_SEMANAL, type ActividadFueraDelCole, type DiaHorario } from "@/data/horario";
import {
  CLASE_ASIGNATURAS,
  CLASE_FRANJAS_HORAS,
  CLASE_HORARIO,
  type ClaveAsignatura,
  type FranjaClase,
} from "@/data/horarioClase";
import { minutosDelDia, parseHora } from "./fechas";

export type TipoBloque =
  | "entrada"
  | "asignatura"
  | "clase"
  | "recreo"
  | "comedor"
  | "juegos"
  | "tardes"
  | "recogida"
  | "extraescolar"
  | "salida"
  | "camino"
  | "fuera-del-cole";

export interface Bloque {
  tipo: TipoBloque;
  titulo: string;
  inicio: string; // "HH:MM"
  fin: string; // "HH:MM"
  detalle?: string;
  icono: string;
  /** Solo en bloques tipo "asignatura": qué asignatura es (para color y ficha de detalle) */
  asignatura?: ClaveAsignatura;
}

/** Septiembre (8) y junio (5) tienen la tarde adelantada */
export const esJornadaCorta = (mes0: number) => mes0 === 8 || mes0 === 5;

/** Extraescolares y natación empiezan en octubre: no aplican en septiembre */
export const aplicanExtraescolares = (mes0: number) => mes0 !== 8;

/** Julio y agosto: vacaciones de verano */
export const esVerano = (mes0: number) => mes0 === 6 || mes0 === 7;

export const diaHorario = (fecha: Date): DiaHorario | undefined =>
  HORARIO_SEMANAL.find((d) => d.dia === fecha.getDay());

/** Actividad fuera del cole de un día (natación, rugby…) si está vigente en esa fecha, o undefined */
export function actividadFueraDelColeHoy(
  dia: DiaHorario,
  fecha: Date,
): ActividadFueraDelCole | undefined {
  const act = dia.actividadFueraDelCole;
  if (!act) return undefined;
  if (act.desde && fecha < act.desde) return undefined;
  if (act.hasta && fecha >= act.hasta) return undefined;
  return act;
}

/** Bloque de la franja de asignatura `index` (0-6) del horario de clase de un día, o undefined si faltan datos */
function bloqueAsignatura(franjas: FranjaClase[], index: number): Bloque | undefined {
  const franja = franjas[index];
  const horaFin = CLASE_FRANJAS_HORAS[index + 1];
  if (!franja || !horaFin) return undefined;
  const asig = CLASE_ASIGNATURAS[franja.asignatura];
  return {
    tipo: "asignatura",
    titulo: asig.nombre,
    inicio: franja.hora,
    fin: horaFin,
    icono: asig.icono,
    asignatura: franja.asignatura,
  };
}

/**
 * Construye la línea de tiempo completa de un día lectivo según la fecha: entrada, las
 * asignaturas concretas del horario de clase (de octubre a mayo — en septiembre/junio,
 * con la tarde adelantada, no tenemos el horario oficial comprimido así que se muestra
 * "Clases" genérico), recreo, comedor, extraescolar y, si toca, la actividad fuera del cole.
 */
export function bloquesDelDia(dia: DiaHorario, fecha: Date): Bloque[] {
  const mes0 = fecha.getMonth();
  const corta = esJornadaCorta(mes0);
  const extras = aplicanExtraescolares(mes0);
  const actividad = extras ? actividadFueraDelColeHoy(dia, fecha) : undefined;
  const franjas = CLASE_HORARIO[dia.dia];

  const b: Bloque[] = [
    {
      tipo: "entrada",
      titulo: "Entrada y acogida",
      inicio: "08:55",
      fin: "09:00",
      detalle: "Puerta a las 8:55 · acogida hasta las 9:05",
      icono: "🎒",
    },
  ];

  if (!corta) {
    for (let i = 0; i < 3; i++) {
      const bloque = bloqueAsignatura(franjas, i);
      if (bloque) b.push(bloque);
    }
  } else {
    b.push({ tipo: "clase", titulo: "Clases", inicio: "09:30", fin: "11:15", icono: "✏️" });
  }

  b.push({
    tipo: "recreo",
    titulo: "Recreo y merienda",
    inicio: "11:15",
    fin: "11:45",
    detalle: `Merienda de hoy: ${dia.merienda}`,
    icono: "🍎",
  });

  if (corta) {
    b.push(
      { tipo: "clase", titulo: "Clases", inicio: "11:45", fin: "13:00", icono: "📚" },
      { tipo: "comedor", titulo: "Comedor", inicio: "13:05", fin: "13:40", icono: "🍽️" },
    );
    if (extras) {
      b.push(
        { tipo: "tardes", titulo: "Tardes de cole", inicio: "13:40", fin: "16:00", icono: "🧩" },
        {
          tipo: "extraescolar",
          titulo: `Extraescolar: ${dia.extraescolar}`,
          inicio: "16:00",
          fin: "17:00",
          icono: "⭐",
        },
      );
    } else {
      b.push({
        tipo: "tardes",
        titulo: "Tardes de cole",
        inicio: "13:40",
        fin: "17:00",
        detalle: "Sin extraescolares en septiembre",
        icono: "🧩",
      });
    }
  } else {
    for (let i = 4; i < 7; i++) {
      const bloque = bloqueAsignatura(franjas, i);
      if (bloque) b.push(bloque);
    }
    b.push(
      { tipo: "comedor", titulo: "Comedor", inicio: "14:05", fin: "14:40", icono: "🍽️" },
      {
        tipo: "juegos",
        titulo: "Juegos",
        inicio: "14:40",
        fin: "15:45",
        detalle: "Hasta la salida general de las 15:45",
        icono: "🧸",
      },
      { tipo: "recogida", titulo: "Recogida", inicio: "15:45", fin: "16:00", icono: "👋" },
      {
        tipo: "extraescolar",
        titulo: `Extraescolar: ${dia.extraescolar}`,
        inicio: "16:00",
        fin: "17:00",
        icono: "⭐",
      },
    );
  }

  b.push({ tipo: "salida", titulo: "Salida del cole", inicio: "17:00", fin: "17:00", icono: "🏠" });

  if (actividad) {
    b.push(
      {
        tipo: "camino",
        titulo: `Camino a ${actividad.nombre.toLowerCase()}`,
        inicio: "17:00",
        fin: actividad.inicio,
        icono: "🚶",
      },
      {
        tipo: "fuera-del-cole",
        titulo: actividad.nombre,
        inicio: actividad.inicio,
        fin: actividad.fin,
        detalle: `${actividad.lugar} (fuera del cole)`,
        icono: actividad.icono,
      },
    );
  }

  return b;
}

export interface EstadoAhora {
  titulo: string;
  detalle?: string | undefined;
  icono: string;
  bloque?: Bloque | undefined;
  siguiente?: Bloque | undefined;
}

/** Calcula en qué momento del día está Damián ahora mismo */
export function estadoAhora(ahora: Date): EstadoAhora {
  const mes0 = ahora.getMonth();
  if (esVerano(mes0)) {
    return {
      titulo: "¡Vacaciones de verano!",
      detalle: "No hay cole en julio ni agosto",
      icono: "☀️",
    };
  }
  const dia = diaHorario(ahora);
  if (!dia) {
    return { titulo: "Hoy no hay cole", detalle: "¡A disfrutar del fin de semana!", icono: "🎈" };
  }
  const bloques = bloquesDelDia(dia, ahora).filter((b) => b.tipo !== "salida");
  const t = minutosDelDia(ahora);
  const primero = bloques[0];
  const ultimo = bloques[bloques.length - 1];
  if (!primero || !ultimo) {
    return { titulo: "Hoy no hay cole", icono: "🎈" };
  }

  if (t < parseHora(primero.inicio)) {
    return {
      titulo: "Todavía en casa",
      detalle: `Entrada al cole a las ${primero.inicio.replace(/^0/, "")}`,
      icono: "🌅",
      siguiente: primero,
    };
  }
  if (t >= parseHora(ultimo.fin)) {
    return { titulo: "Ya salió", detalle: "Tarde en familia", icono: "🏠" };
  }
  // El primer bloque cuyo fin es posterior a ahora (los huecos se asignan al siguiente)
  const idx = bloques.findIndex((b) => t < parseHora(b.fin));
  const bloque = bloques[idx] ?? ultimo;
  return {
    titulo: bloque.titulo,
    detalle: bloque.detalle,
    icono: bloque.icono,
    bloque,
    siguiente: bloques[idx + 1],
  };
}
