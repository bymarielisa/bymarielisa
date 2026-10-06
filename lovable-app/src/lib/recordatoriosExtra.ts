/**
 * Recordatorios/citas añadidos por Papá o Mamá desde la app (no los del cole, que son
 * los fijos de src/data/calendario.ts). Se guardan en Netlify Blobs: los ve cualquiera
 * que entre a la app, en cualquier dispositivo, sin necesidad de tocar código.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type AutorRecordatorio = "Papá" | "Mamá";

export interface RecordatorioExtra {
  id: string;
  titulo: string;
  fecha: string; // "YYYY-MM-DD"
  nota: string;
  autor: AutorRecordatorio;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-recordatorios-extra";
const KEY = "items";

async function leerTodos(): Promise<RecordatorioExtra[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: "json" });
  return Array.isArray(data) ? (data as RecordatorioExtra[]) : [];
}

export const getRecordatoriosExtra = createServerFn({ method: "GET" }).handler(
  async (): Promise<RecordatorioExtra[]> => leerTodos(),
);

export const addRecordatorioExtra = createServerFn({ method: "POST" })
  .validator(
    (data: { titulo: string; fecha: string; nota?: string; autor: AutorRecordatorio }) => data,
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

export const eliminarRecordatorioExtra = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<RecordatorioExtra[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.filter((r) => r.id !== data.id);
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });
