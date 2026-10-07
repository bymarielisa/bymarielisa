/**
 * Presupuesto mensual del curso 2026-2027.
 * El primer concepto de cada mes es siempre "Comedor María de Villota".
 * Para añadir un mes nuevo: copia el último objeto al final del array y cambia
 * nombre, mes/año e importes. El total y el reparto se calculan solos.
 */
export interface Concepto {
  nombre: string;
  importe: number; // euros
}

export interface MesGastos {
  id: string; // "2026-09"
  nombre: string; // "Septiembre 2026"
  conceptos: Concepto[];
}

const COMEDOR = "Comedor María de Villota";

export const GASTOS: MesGastos[] = [
  {
    id: "2026-09",
    nombre: "Septiembre 2026",
    conceptos: [
      { nombre: COMEDOR, importe: 54 },
      { nombre: "Alventus tardes de cole", importe: 58 },
      { nombre: "Cooperativa", importe: 60 },
      { nombre: "AFA", importe: 30 },
      { nombre: "Material aula", importe: 7.2 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  {
    id: "2026-10",
    nombre: "Octubre 2026",
    conceptos: [
      { nombre: COMEDOR, importe: 63 },
      { nombre: "Inglés", importe: 38 },
      { nombre: "Multideporte", importe: 0 },
      { nombre: "Rugby", importe: 32 },
      { nombre: "Matrícula Rugby", importe: 50 },
      { nombre: "Minichef", importe: 19 },
      { nombre: "Minichef — material (pago único al empezar)", importe: 16.5 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  {
    id: "2026-11",
    nombre: "Noviembre 2026",
    conceptos: [
      { nombre: COMEDOR, importe: 57 },
      { nombre: "Inglés", importe: 38 },
      { nombre: "Multideporte", importe: 0 },
      { nombre: "Rugby", importe: 32 },
      { nombre: "Matrícula Rugby", importe: 50 },
      { nombre: "Minichef", importe: 19 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  {
    id: "2026-12",
    nombre: "Diciembre 2026",
    conceptos: [
      { nombre: COMEDOR, importe: 42 },
      { nombre: "Inglés", importe: 38 },
      { nombre: "Multideporte", importe: 0 },
      { nombre: "Rugby", importe: 32 },
      { nombre: "Minichef", importe: 19 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  {
    id: "2027-01",
    nombre: "Enero 2027",
    conceptos: [
      { nombre: COMEDOR, importe: 45 },
      { nombre: "Inglés", importe: 38 },
      { nombre: "Multideporte", importe: 0 },
      { nombre: "Rugby", importe: 32 },
      { nombre: "Minichef", importe: 19 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  {
    id: "2027-02",
    nombre: "Febrero 2027",
    conceptos: [
      { nombre: COMEDOR, importe: 54 },
      { nombre: "Inglés", importe: 38 },
      { nombre: "Multideporte", importe: 0 },
      { nombre: "Rugby", importe: 32 },
      { nombre: "Minichef", importe: 19 },
      { nombre: "Natación", importe: 8.9 },
    ],
  },
  // 👉 Añade aquí el siguiente mes (Marzo 2027, …)
];

export const totalMes = (mes: MesGastos) =>
  Math.round(mes.conceptos.reduce((s, c) => s + c.importe, 0) * 100) / 100;

export const formatEuros = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
