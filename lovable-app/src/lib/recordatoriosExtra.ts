/**
 * Recordatorios y citas de Damián: tanto los fijos del cole (Halloween, salidas, festivales)
 * como los que Papá o Mamá añaden sobre la marcha. Todo en una sola lista compartida y
 * editable — si el cole avisa una fecha nueva, se corrige aquí mismo, sin tocar código. Se
 * guarda en Netlify Blobs: lo ve cualquiera que entre a la app, en cualquier dispositivo.
 *
 * Cada recordatorio es su propia entrada (clave = su id), no un array compartido bajo una
 * sola clave. Guardarlos juntos bajo una clave causaba que, al añadir varios seguidos rápido,
 * una escritura leyera la lista antes de que la anterior terminara de guardarse y la pisara
 * sin querer (se "perdía" uno). Con una clave por recordatorio eso ya no puede pasar.
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
/** Clave antigua: antes todo se guardaba junto como un array bajo esta clave. */
const CLAVE_LEGADO = "items";
/** Marca que ya se sembraron los recordatorios fijos del cole (para no repetirlo si se borran). */
const CLAVE_SEMBRADO = "_sembrado";

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
  const { blobs } = await store.list();
  const claves = blobs.map((b) => b.key).filter((k) => k !== CLAVE_LEGADO && k !== CLAVE_SEMBRADO);

  if (claves.length > 0) {
    const items = await Promise.all(claves.map((k) => store.get(k, { type: "json" })));
    return items.filter((r): r is RecordatorioExtra => r != null);
  }

  // Migración única desde el formato antiguo (array bajo una sola clave).
  const legado = await store.get(CLAVE_LEGADO, { type: "json" });
  if (Array.isArray(legado) && legado.length > 0) {
    await Promise.all(legado.map((r: RecordatorioExtra) => store.setJSON(r.id, r)));
    await store.set(CLAVE_SEMBRADO, "1");
    return legado;
  }

  // Primera vez de verdad (y solo esa vez): sembramos los recordatorios fijos del cole.
  const yaSembrado = await store.get(CLAVE_SEMBRADO);
  if (yaSembrado) return [];
  await Promise.all(SEED.map((r) => store.setJSON(r.id, r)));
  await store.set(CLAVE_SEMBRADO, "1");
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
    await store.setJSON(nuevo.id, nuevo);
    return [...actuales, nuevo];
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
    const existente = actuales.find((r) => r.id === data.id);
    const actualizado: RecordatorioExtra = {
      id: data.id,
      titulo: data.titulo.trim(),
      fecha: data.fecha,
      nota: data.nota?.trim() ?? "",
      autor: data.autor,
      creadoEn: existente?.creadoEn ?? new Date().toISOString(),
    };
    await store.setJSON(data.id, actualizado);
    return actuales.map((r) => (r.id === data.id ? actualizado : r));
  });

export const eliminarRecordatorioExtra = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<RecordatorioExtra[]> => {
    const store = getStore(STORE_NAME);
    const actuales = await leerTodos();
    await store.delete(data.id);
    return actuales.filter((r) => r.id !== data.id);
  });
