/** Utilidades de fecha en hora LOCAL del dispositivo (nunca UTC). */

export const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
export const DIAS_CORTOS = ["L", "M", "X", "J", "V", "S", "D"];
export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const soloFecha = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** "YYYY-MM-DD" en hora LOCAL (nunca usar toISOString: desplaza el día según la zona horaria) */
export const aFechaISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Parsea "YYYY-MM-DD" como fecha LOCAL a medianoche (nunca `new Date(str)`: lo interpreta en UTC) */
export const deFechaISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const diasEntre = (desde: Date, hasta: Date) =>
  Math.round((soloFecha(hasta).getTime() - soloFecha(desde).getTime()) / 86_400_000);

export const esFinDeSemana = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export const diasDelMes = (anio: number, mes0: number) => new Date(anio, mes0 + 1, 0).getDate();

/** Índice de columna con la semana empezando en lunes (0 = lunes … 6 = domingo) */
export const columnaLunes = (d: Date) => (d.getDay() + 6) % 7;

/** "lunes, 21 de septiembre de 2026" */
export const formatoLargo = (d: Date) =>
  `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

/** "21 de septiembre" */
export const formatoCorto = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()]}`;

export const formatoHora = (d: Date) =>
  `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

export const minutosDelDia = (d: Date) => d.getHours() * 60 + d.getMinutes();

export const parseHora = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
