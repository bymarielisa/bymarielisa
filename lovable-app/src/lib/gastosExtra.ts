/**
 * Cambios o gastos nuevos que Papá o Mamá añaden a un mes concreto desde la app (ej. una
 * matrícula puntual o un cambio de mensualidad), distintos de los conceptos fijos de
 * src/data/gastos.ts. Se guardan en Netlify Blobs: los ve cualquiera que entre a la app, en
 * cualquier dispositivo, sin necesidad de tocar código.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type AutorGasto = "Papá" | "Mamá";

export interface GastoExtraCompartido {
  id: string;
  mesId: string; // referencia a MesGastos.id, ej. "2026-11"
  nombre: string;
  importe: number; // euros, total a repartir entre los dos
  autor: AutorGasto;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-gastos-cambios";
const KEY = "items";

async function leerTodos(): Promise<GastoExtraCompartido[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: "json" });
  return Array.isArray(data) ? (data as GastoExtraCompartido[]) : [];
}

export const getGastosExtra = createServerFn({ method: "GET" }).handler(
  async (): Promise<GastoExtraCompartido[]> => leerTodos(),
);

export const addGastoExtra = createServerFn({ method: "POST" })
  .validator((data: { mesId: string; nombre: string; importe: number; autor: AutorGasto }) => data)
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const nuevo: GastoExtraCompartido = {
      id: crypto.randomUUID(),
      mesId: data.mesId,
      nombre: data.nombre.trim(),
      importe: data.importe,
      autor: data.autor,
      creadoEn: new Date().toISOString(),
    };
    const siguiente = [...actuales, nuevo];
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const eliminarGastoExtra = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.filter((g) => g.id !== data.id);
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });
