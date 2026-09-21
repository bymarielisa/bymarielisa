import { HORARIO_SEMANAL, type DiaHorario } from "@/data/horario";
import { minutosDelDia, parseHora } from "./fechas";

export type TipoBloque =
  | "entrada"
  | "clase"
  | "recreo"
  | "comedor"
  | "juegos"
  | "tardes"
  | "recogida"
  | "extraescolar"
  | "salida"
  | "camino"
  | "natacion";

export interface Bloque {
  tipo: TipoBloque;
  titulo: string;
  inicio: string; // "HH:MM"
  fin: string; // "HH:MM"
  detalle?: string;
  icono: string;
}

/** Septiembre (8) y junio (5) tienen la tarde adelantada */
export const esJornadaCorta = (mes0: number) => mes0 === 8 || mes0 === 5;

/** Extraescolares y natación empiezan en octubre: no aplican en septiembre */
export const aplicanExtraescolares = (mes0: number) => mes0 !== 8;

/** Julio y agosto: vacaciones de verano */
export const esVerano = (mes0: number) => mes0 === 6 || mes0 === 7;

export const diaHorario = (fecha: Date): DiaHorario | undefined =>
  HORARIO_SEMANAL.find((d) => d.dia === fecha.getDay());

/** Construye la línea de tiempo completa de un día lectivo según la fecha (mes) */
export function bloquesDelDia(dia: DiaHorario, mes0: number): Bloque[] {
  const corta = esJornadaCorta(mes0);
  const extras = aplicanExtraescolares(mes0);

  const b: Bloque[] = [
    {
      tipo: "entrada",
      titulo: "Entrada y acogida",
      inicio: "08:55",
      fin: "09:30",
      detalle: "Puerta a las 8:55 · acogida hasta las 9:05",
      icono: "🎒",
    },
    { tipo: "clase", titulo: "Clases", inicio: "09:30", fin: "11:15", icono: "✏️" },
    {
      tipo: "recreo",
      titulo: "Recreo y merienda",
      inicio: "11:15",
      fin: "11:45",
      detalle: `Merienda de hoy: ${dia.merienda}`,
      icono: "🍎",
    },
  ];

  if (corta) {
    b.push(
      { tipo: "clase", titulo: "Clases", inicio: "11:45", fin: "13:00", icono: "📚" },
      { tipo: "comedor", titulo: "Comedor", inicio: "13:05", fin: "13:40", icono: "🍽️" },
    );
    if (extras) {
      b.push(
        {
          tipo: "tardes",
          titulo: "Tardes de cole",
          inicio: "13:40",
          fin: "16:00",
          icono: "🧩",
        },
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
    b.push(
      { tipo: "clase", titulo: "Clases", inicio: "11:45", fin: "14:00", icono: "📚" },
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

  if (dia.natacion && extras) {
    b.push(
      {
        tipo: "camino",
        titulo: "Camino a natación",
        inicio: "17:00",
        fin: dia.natacion.inicio,
        icono: "🚶",
      },
      {
        tipo: "natacion",
        titulo: "Natación",
        inicio: dia.natacion.inicio,
        fin: dia.natacion.fin,
        detalle: dia.natacion.lugar,
        icono: "🏊",
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
    return { titulo: "¡Vacaciones de verano!", detalle: "No hay cole en julio ni agosto", icono: "☀️" };
  }
  const dia = diaHorario(ahora);
  if (!dia) {
    return { titulo: "Hoy no hay cole", detalle: "¡A disfrutar del fin de semana!", icono: "🎈" };
  }
  const bloques = bloquesDelDia(dia, mes0).filter((b) => b.tipo !== "salida");
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
