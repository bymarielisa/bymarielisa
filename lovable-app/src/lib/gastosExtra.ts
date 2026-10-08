/**
 * Gastos añadidos por Papá o Mamá desde la app: pueden estar atados a un mes concreto
 * (ej. una matrícula puntual, un cambio de mensualidad — se suman al total de ese mes) o
 * sueltos (gastos extra, tipo "zapatillas nuevas"). Cada uno se puede editar, marcar como
 * pagado o eliminar. Se guardan en Netlify Blobs: los ve cualquiera que entre a la app, en
 * cualquier dispositivo, sin necesidad de tocar código.
 *
 * Cada gasto es su propia entrada (clave = su id), no un array compartido bajo una sola
 * clave. Guardarlos juntos bajo una clave causaba que, al añadir varios seguidos rápido, una
 * escritura leyera la lista antes de que la anterior terminara de guardarse y la pisara sin
 * querer (se "perdía" uno). Con una clave por gasto eso ya no puede pasar.
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
/** Clave antigua: antes todo se guardaba junto como un array bajo esta clave. */
const CLAVE_LEGADO = "items";
/** Marca que ya se sembró el gasto extra fijo (para no repetirlo si se borra). */
const CLAVE_SEMBRADO = "_sembrado";

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
  const { blobs } = await store.list();
  const claves = blobs.map((b) => b.key).filter((k) => k !== CLAVE_LEGADO && k !== CLAVE_SEMBRADO);

  if (claves.length > 0) {
    const items = await Promise.all(claves.map((k) => store.get(k, { type: "json" })));
    return items.filter((g): g is GastoExtraCompartido => g != null);
  }

  // Migración única desde el formato antiguo (array bajo una sola clave).
  const legado = await store.get(CLAVE_LEGADO, { type: "json" });
  if (Array.isArray(legado) && legado.length > 0) {
    await Promise.all(legado.map((g: GastoExtraCompartido) => store.setJSON(g.id, g)));
    await store.set(CLAVE_SEMBRADO, "1");
    return legado;
  }

  // Primera vez de verdad (y solo esa vez): sembramos el gasto extra fijo que había.
  const yaSembrado = await store.get(CLAVE_SEMBRADO);
  if (yaSembrado) return [];
  await Promise.all(SEED.map((g) => store.setJSON(g.id, g)));
  await store.set(CLAVE_SEMBRADO, "1");
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
    await store.setJSON(nuevo.id, nuevo);
    return [...actuales, nuevo];
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
    const existente = actuales.find((g) => g.id === data.id);
    const actualizado: GastoExtraCompartido = {
      id: data.id,
      nombre: data.nombre.trim(),
      importe: data.importe,
      autor: data.autor,
      mesId: data.mesId,
      pagado: existente?.pagado ?? false,
      creadoEn: existente?.creadoEn ?? new Date().toISOString(),
    };
    await store.setJSON(data.id, actualizado);
    return actuales.map((g) => (g.id === data.id ? actualizado : g));
  });

export const marcarGastoPagado = createServerFn({ method: "POST" })
  .validator((data: { id: string; pagado: boolean }) => data)
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    const existente = actuales.find((g) => g.id === data.id);
    if (!existente) return actuales;
    const actualizado = { ...existente, pagado: data.pagado };
    await store.setJSON(data.id, actualizado);
    return actuales.map((g) => (g.id === data.id ? actualizado : g));
  });

export const eliminarGastoExtra = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<GastoExtraCompartido[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    await store.delete(data.id);
    return actuales.filter((g) => g.id !== data.id);
  });
