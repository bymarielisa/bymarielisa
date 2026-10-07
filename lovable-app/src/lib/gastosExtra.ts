/**
 * Gastos añadidos por Papá o Mamá desde la app: pueden estar atados a un mes concreto
 * (ej. una matrícula puntual, un cambio de mensualidad — se suman al total de ese mes) o
 * sueltos (gastos extra, tipo "zapatillas nuevas"). Cada uno se puede editar, marcar como
 * pagado o eliminar. Se guardan en Netlify Blobs: los ve cualquiera que entre a la app, en
 * cualquier dispositivo, sin necesidad de tocar código.
 */
import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";

export type AutorGasto = "Papá" | "Mamá";

export interface GastoExtraCompartido {
  id: string;
  nombre: string;
  importe: number; // euros, total a repartir entre los dos
  autor: AutorGasto;
  mesId: string | null; // null = gasto extra suelto, no atado a un mes
  pagado: boolean;
  creadoEn: string; // ISO
}

const STORE_NAME = "damianfg-gastos-cambios";
const KEY = "items";

/** Lo único que había como gasto extra fijo antes de este sistema compartido. */
const SEED: GastoExtraCompartido[] = [
  {
    id: "seed-equipo-rugby-2026",
    nombre: "Zapatillas, protector bucal y calcetines",
    importe: 26.97,
    autor: "Mamá",
    mesId: null,
    pagado: false,
    creadoEn: new Date(2026, 8, 1).toISOString(),
  },
];

async function leerTodos(): Promise<GastoExtraCompartido[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(KEY, { type: "json" });
  if (Array.isArray(data)) return data as GastoExtraCompartido[];
  await store.setJSON(KEY, SEED);
  return SEED;
}

export const getGastosExtra = createServerFn({ method: "GET" }).handler(
  async (): Promise<GastoExtraCompartido[]> => leerTodos(),
);

export const addGastoExtra = createServerFn({ method: "POST" })
  .validator(
    (data: { nombre: string; importe: number; autor: AutorGasto; mesId: string | null }) => data,
  )
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const nuevo: GastoExtraCompartido = {
      id: crypto.randomUUID(),
      nombre: data.nombre.trim(),
      importe: data.importe,
      autor: data.autor,
      mesId: data.mesId,
      pagado: false,
      creadoEn: new Date().toISOString(),
    };
    const siguiente = [...actuales, nuevo];
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const editarGastoExtra = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      nombre: string;
      importe: number;
      autor: AutorGasto;
      mesId: string | null;
    }) => data,
  )
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.map((g) =>
      g.id === data.id
        ? {
            ...g,
            nombre: data.nombre.trim(),
            importe: data.importe,
            autor: data.autor,
            mesId: data.mesId,
          }
        : g,
    );
    await store.setJSON(KEY, siguiente);
    return siguiente;
  });

export const marcarGastoPagado = createServerFn({ method: "POST" })
  .validator((data: { id: string; pagado: boolean }) => data)
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const siguiente = actuales.map((g) => (g.id === data.id ? { ...g, pagado: data.pagado } : g));
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
