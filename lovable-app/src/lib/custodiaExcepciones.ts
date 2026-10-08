/**
 * Excepciones puntuales a la regla fija de custodia (cambios de mutuo acuerdo para un
 * día concreto). Se guardan en Netlify Blobs: las ve cualquiera que entre a la app, en
 * cualquier dispositivo, sin necesidad de tocar código.
 *
 * Cada excepción es su propia entrada (clave = la fecha), no un array compartido bajo una
 * sola clave. Guardarlas juntas bajo una clave causaba que, al añadir varios días seguidos
 * rápido, una escritura leyera la lista antes de que la anterior terminara de guardarse y
 * la pisara sin querer (se "perdía" un día). Con una clave por fecha eso ya no puede pasar.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type QuienCustodia = "Papá" | "Mamá";

export interface ExcepcionCustodia {
  id: string; // igual a `fecha`
  fecha: string; // "YYYY-MM-DD"
  quien: QuienCustodia;
  nota: string;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-custodia-excepciones";
/** Clave antigua: antes todo se guardaba junto como un array bajo esta clave. */
const CLAVE_LEGADO = "items";

async function leerTodas(): Promise<ExcepcionCustodia[]> {
  const store = getStore(STORE_NAME);
  const { blobs } = await store.list();
  const claves = blobs.map((b) => b.key).filter((k) => k !== CLAVE_LEGADO);

  if (claves.length > 0) {
    const items = await Promise.all(claves.map((k) => store.get(k, { type: "json" })));
    return items.filter((e): e is ExcepcionCustodia => e != null);
  }

  // Migración única desde el formato antiguo (array bajo una sola clave).
  const legado = await store.get(CLAVE_LEGADO, { type: "json" });
  if (Array.isArray(legado) && legado.length > 0) {
    const migradas: ExcepcionCustodia[] = legado.map((e: ExcepcionCustodia) => ({
      ...e,
      id: e.fecha,
    }));
    await Promise.all(migradas.map((e) => store.setJSON(e.fecha, e)));
    return migradas;
  }

  return [];
}

export const getCustodiaExcepciones = createServerFn({ method: "GET" }).handler(
  async (): Promise<ExcepcionCustodia[]> => leerTodas(),
);

export const addCustodiaExcepcion = createServerFn({ method: "POST" })
  .validator((data: { fecha: string; quien: QuienCustodia; nota?: string }) => data)
  .handler(async ({ data }): Promise<ExcepcionCustodia[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodas();
    const nueva: ExcepcionCustodia = {
      id: data.fecha,
      fecha: data.fecha,
      quien: data.quien,
      nota: data.nota?.trim() ?? "",
      creadoEn: new Date().toISOString(),
    };
    // Una excepción por fecha: guardar en la misma clave reemplaza la anterior para ese día.
    await store.setJSON(data.fecha, nueva);
    return [...actuales.filter((e) => e.fecha !== data.fecha), nueva];
  });

export const eliminarCustodiaExcepcion = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<ExcepcionCustodia[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodas();
    await store.delete(data.id);
    return actuales.filter((e) => e.id !== data.id);
  });
