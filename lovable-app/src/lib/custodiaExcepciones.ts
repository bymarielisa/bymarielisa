/**
 * Excepciones puntuales a la regla fija de custodia (cambios de mutuo acuerdo para un
 * día concreto). Se guardan en Netlify Blobs: las ve cualquiera que entre a la app, en
 * cualquier dispositivo, sin necesidad de tocar código.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type QuienCustodia = "Papá" | "Mamá";

export interface ExcepcionCustodia {
  id: string;
  fecha: string; // "YYYY-MM-DD"
  quien: QuienCustodia;
  nota: string;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-custodia-excepciones";
const KEY = "items";

async function leerTodas(): Promise<ExcepcionCustodia[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: "json" });
  return Array.isArray(data) ? (data as ExcepcionCustodia[]) : [];
}

export const getCustodiaExcepciones = createServerFn({ method: "GET" }).handler(
  async (): Promise<ExcepcionCustodia[]> => leerTodas(),
);

export const addCustodiaExcepcion = createServerFn({ method: "POST" })
  .validator((data: { fecha: string; quien: QuienCustodia; nota?: string }) => data)
  .handler(async ({ data }): Promise<ExcepcionCustodia[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodas();
    // Una excepción por fecha: si ya había una para ese día, la reemplaza.
    const sinEsaFecha = actuales.filter((e) => e.fecha !== data.fecha);
    const nueva: ExcepcionCustodia = {
      id: crypto.randomUUID(),
      fecha: data.fecha,
      quien: data.quien,
      nota: data.nota?.trim() ?? "",
      creadoEn: new Date().toISOString(),
    };
    const siguiente = [...sinEsaFecha, nueva];
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const eliminarCustodiaExcepcion = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<ExcepcionCustodia[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodas();
    const siguiente = actuales.filter((e) => e.id !== data.id);
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });
