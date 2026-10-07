/**
 * Recordatorios y citas de Damián: tanto los fijos del cole (Halloween, salidas, festivales)
 * como los que Papá o Mamá añaden sobre la marcha. Todo en una sola lista compartida y
 * editable — si el cole avisa una fecha nueva, se corrige aquí mismo, sin tocar código. Se
 * guarda en Netlify Blobs: lo ve cualquiera que entre a la app, en cualquier dispositivo.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type AutorRecordatorio = "Papá" | "Mamá" | "Cole";

export interface RecordatorioExtra {
  id: string;
  titulo: string;
  fecha: string | null; // "YYYY-MM-DD", o null si aún no hay fecha confirmada
  nota: string;
  autor: AutorRecordatorio;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-recordatorios-extra";
const KEY = "items";

/** Los recordatorios fijos del cole que había antes de este sistema compartido. */
const SEED: RecordatorioExtra[] = [
  {
    id: "seed-halloween",
    titulo: "Halloween",
    fecha: "2026-10-30",
    nota: "Actividad de centro",
    autor: "Cole",
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
  {
    id: "seed-visita-parque",
    titulo: "Visita al parque (todo Infantil)",
    fecha: null,
    nota: "Finales de octubre, fecha por confirmar",
    autor: "Cole",
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
  {
    id: "seed-cita-policia",
    titulo: "Cita en la policía (renovar DNI y pasaporte)",
    fecha: "2026-10-28",
    nota: "11:48",
    autor: "Mamá",
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
  {
    id: "seed-planetario",
    titulo: "Salida al Planetario",
    fecha: null,
    nota: "Fecha por confirmar",
    autor: "Cole",
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
  {
    id: "seed-festival-invierno",
    titulo: "Festival de Invierno (con familias)",
    fecha: "2026-12-17",
    nota: "17–18 dic (dos días)",
    autor: "Cole",
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
];

async function leerTodos(): Promise<RecordatorioExtra[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: "json" });
  if (Array.isArray(data)) return data as RecordatorioExtra[];
  await store.setJSON(KEY, SEED);
  return SEED;
}

export const getRecordatoriosExtra = createServerFn({ method: "GET" }).handler(
  async (): Promise<RecordatorioExtra[]> => leerTodos(),
);

export const addRecordatorioExtra = createServerFn({ method: "POST" })
  .validator(
    (data: { titulo: string; fecha: string | null; nota?: string; autor: AutorRecordatorio }) =>
      data,
  )
  .handler(async ({ data }): Promise<RecordatorioExtra[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const nuevo: RecordatorioExtra = {
      id: crypto.randomUUID(),
      titulo: data.titulo.trim(),
      fecha: data.fecha,
      nota: data.nota?.trim() ?? "",
      autor: data.autor,
      creadoEn: new Date().toISOString(),
    };
    const siguiente = [...actuales, nuevo];
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const editarRecordatorioExtra = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      titulo: string;
      fecha: string | null;
      nota?: string;
      autor: AutorRecordatorio;
    }) => data,
  )
  .handler(async ({ data }): Promise<RecordatorioExtra[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.map((r) =>
      r.id === data.id
        ? {
            ...r,
            titulo: data.titulo.trim(),
            fecha: data.fecha,
            nota: data.nota?.trim() ?? "",
            autor: data.autor,
          }
        : r,
    );
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const eliminarRecordatorioExtra = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<RecordatorioExtra[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.filter((r) => r.id !== data.id);
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });
