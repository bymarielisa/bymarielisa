import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { GASTOS, formatEuros, totalMes } from "@/data/gastos";
import {
  addGastoExtra,
  editarGastoExtra,
  eliminarGastoExtra,
  getGastosExtra,
  marcarGastoPagado,
  type AutorGasto,
  type GastoExtraCompartido,
} from "@/lib/gastosExtra";

const SIN_MES = "sin-mes";

const sumaCambiosMes = (mesId: string, cambios: GastoExtraCompartido[]) =>
  Math.round(cambios.filter((c) => c.mesId === mesId).reduce((s, c) => s + c.importe, 0) * 100) /
  100;

const sumaGastosSueltos = (cambios: GastoExtraCompartido[]) =>
  Math.round(cambios.filter((c) => c.mesId === null).reduce((s, c) => s + c.importe, 0) * 100) /
  100;

export const Route = createFileRoute("/gastos")({
  head: () => ({
    meta: [
      { title: "Gastos — DamiánFG" },
      {
        name: "description",
        content:
          "Presupuesto mensual del cole de Damián: comedor, extraescolares y reparto entre Papá y Mamá.",
      },
      { property: "og:title", content: "Gastos — DamiánFG" },
      {
        property: "og:description",
        content: "Presupuesto mensual del cole y reparto entre Papá y Mamá.",
      },
    ],
  }),
  component: GastosPage,
});

function GastosPage() {
  const [cambios, setCambios] = useState<GastoExtraCompartido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getGastosExtra()
      .then(setCambios)
      .catch(() => setCambios([]))
      .finally(() => setCargando(false));
  }, []);

  const totales = GASTOS.map((mes) => totalMes(mes) + sumaCambiosMes(mes.id, cambios));
  const extraTotal = sumaGastosSueltos(cambios);
  const acumulado = totales.reduce((s, t) => s + t, 0) + extraTotal;
  const media = totales.length ? acumulado / totales.length : 0;

  return (
    <>
      <Tarjeta className="bg-leaf text-leaf-foreground">
        <TituloSeccion emoji="🐷">Resumen del curso</TituloSeccion>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card/40 p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide opacity-80">
              Total acumulado
            </p>
            <p className="font-display text-2xl font-extrabold">{formatEuros(acumulado)}</p>
            <p className="text-xs opacity-80">Suma de {GASTOS.length} meses cargados</p>
          </div>
          <div className="rounded-2xl bg-card/40 p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide opacity-80">
              Media mensual
            </p>
            <p className="font-display text-2xl font-extrabold">{formatEuros(media)}</p>
            <p className="text-xs opacity-80">{formatEuros(media / 2)} cada uno</p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloSeccion emoji="🧾">Mes a mes</TituloSeccion>
        <Accordion type="single" collapsible className="mt-2">
          {GASTOS.map((mes) => {
            const cambiosDelMes = cambios.filter((c) => c.mesId === mes.id);
            const total = totalMes(mes) + sumaCambiosMes(mes.id, cambios);
            return (
              <AccordionItem key={mes.id} value={mes.id} className="border-b-0 py-1">
                <AccordionTrigger className="min-h-14 rounded-2xl px-3 hover:bg-secondary hover:no-underline">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
                    <p className="font-display text-lg font-bold">{mes.nombre}</p>
                    <p className="font-display text-lg font-extrabold text-leaf-foreground tabular-nums">
                      {formatEuros(total)}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <ul className="divide-y divide-border rounded-2xl bg-secondary/60 px-3">
                    {mes.conceptos.map((c, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className={i === 0 ? "font-bold" : ""}>
                          {i === 0 && "🍽️ "}
                          {c.nombre}
                        </span>
                        <span className="font-bold tabular-nums">{formatEuros(c.importe)}</span>
                      </li>
                    ))}
                    {cambiosDelMes.map((c) => (
                      <li
                        key={c.id}
                        className={`flex items-center justify-between gap-3 py-2 text-sm text-lilac-soft-foreground ${
                          c.pagado ? "opacity-60 line-through" : ""
                        }`}
                      >
                        <span>➕ {c.nombre}</span>
                        <span className="font-bold tabular-nums">{formatEuros(c.importe)}</span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between gap-3 py-2 font-display text-base font-extrabold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatEuros(total)}</span>
                    </li>
                  </ul>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-sky-soft p-3 text-sky-soft-foreground">
                      <p className="text-xs font-extrabold">👨 Papá paga</p>
                      <p className="font-display text-xl font-extrabold tabular-nums">
                        {formatEuros(total / 2)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-coral-soft p-3">
                      <p className="text-xs font-extrabold">👩 Mamá paga</p>
                      <p className="font-display text-xl font-extrabold tabular-nums">
                        {formatEuros(total / 2)}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Tarjeta>

      <GastosExtraYCambios cambios={cambios} cargando={cargando} onCambio={setCambios} />
    </>
  );
}

function GastosExtraYCambios({
  cambios,
  cargando,
  onCambio,
}: {
  cambios: GastoExtraCompartido[];
  cargando: boolean;
  onCambio: (c: GastoExtraCompartido[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("");
  const [autor, setAutor] = useState<AutorGasto>("Papá");
  const [mesId, setMesId] = useState<string>(SIN_MES);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const [verPagados, setVerPagados] = useState(false);

  const pendientes = [...cambios]
    .filter((c) => !c.pagado)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  const pagados = cambios.filter((c) => c.pagado);

  const limpiar = () => {
    setEditId(null);
    setNombre("");
    setImporte("");
    setAutor("Papá");
    setMesId(SIN_MES);
  };

  const editar = (g: GastoExtraCompartido) => {
    setEditId(g.id);
    setNombre(g.nombre);
    setImporte(String(g.importe));
    setAutor(g.autor);
    setMesId(g.mesId ?? SIN_MES);
  };

  const enviar = async () => {
    const valor = parseFloat(importe.replace(",", "."));
    if (!nombre.trim() || !Number.isFinite(valor) || valor <= 0) return;
    setEnviando(true);
    setError(false);
    const datos = {
      nombre: nombre.trim(),
      importe: valor,
      autor,
      mesId: mesId === SIN_MES ? null : mesId,
    };
    try {
      const siguiente = editId
        ? await editarGastoExtra({ data: { id: editId, ...datos } })
        : await addGastoExtra({ data: datos });
      onCambio(siguiente);
      limpiar();
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (id: string) => {
    try {
      const siguiente = await eliminarGastoExtra({ data: { id } });
      onCambio(siguiente);
      if (editId === id) limpiar();
    } catch {
      setError(true);
    }
  };

  const marcarPagado = async (id: string, pagado: boolean) => {
    try {
      const siguiente = await marcarGastoPagado({ data: { id, pagado } });
      onCambio(siguiente);
    } catch {
      setError(true);
    }
  };

  return (
    <Tarjeta>
      <TituloSeccion emoji="➕">Gastos extra y cambios</TituloSeccion>
      <p className="mt-1 text-sm text-muted-foreground">
        Para un gasto nuevo o distinto (una matrícula, un cambio de mensualidad, algo que
        compraron). Si lo atan a un mes, se suma a ese mes y se reparte 50/50; si no, queda como
        gasto suelto.
      </p>

      <div className="mt-3 space-y-2">
        <Input
          placeholder="¿Qué es? (ej. Matrícula Rugby)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Importe €"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            className="w-full"
          />
          <Select value={autor} onValueChange={(v) => setAutor(v as AutorGasto)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Papá">Lo añade Papá</SelectItem>
              <SelectItem value="Mamá">Lo añade Mamá</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={mesId} onValueChange={setMesId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_MES}>Gasto extra (sin mes)</SelectItem>
            {GASTOS.map((mes) => (
              <SelectItem key={mes.id} value={mes.id}>
                {mes.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            onClick={enviar}
            disabled={!nombre.trim() || !importe || enviando}
            className="flex-1"
          >
            {editId ? "Guardar cambios" : "Añadir"}
          </Button>
          {editId && (
            <Button variant="outline" onClick={limpiar} disabled={enviando}>
              Cancelar
            </Button>
          )}
        </div>
        {error && (
          <p className="text-xs font-bold text-destructive">
            No se pudo guardar, inténtalo de nuevo en un momento.
          </p>
        )}
      </div>

      {!cargando && pendientes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pendientes.map((c) => {
            const mes = GASTOS.find((m) => m.id === c.mesId);
            return (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-2xl bg-lilac-soft px-3 py-2 text-sm text-lilac-soft-foreground"
              >
                <Checkbox
                  checked={c.pagado}
                  onCheckedChange={(valor) => marcarPagado(c.id, valor === true)}
                  aria-label={`Marcar "${c.nombre}" como pagado`}
                />
                <button
                  type="button"
                  onClick={() => editar(c)}
                  className="min-w-0 flex-1 text-left"
                >
                  <b>{c.nombre}</b> · {mes?.nombre ?? "gasto extra"} · añadido por {c.autor}
                </button>
                <span className="shrink-0 font-bold tabular-nums">{formatEuros(c.importe)}</span>
                <button
                  type="button"
                  onClick={() => borrar(c.id)}
                  className="shrink-0 text-xs font-bold opacity-70 hover:opacity-100"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!cargando && pagados.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setVerPagados((v) => !v)}
            className="text-xs font-bold text-muted-foreground underline"
          >
            {verPagados ? "Ocultar" : "Ver"} ya pagados ({pagados.length})
          </button>
          {verPagados && (
            <ul className="mt-2 space-y-2">
              {pagados.map((c) => {
                const mes = GASTOS.find((m) => m.id === c.mesId);
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 rounded-2xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <Checkbox
                      checked={c.pagado}
                      onCheckedChange={(valor) => marcarPagado(c.id, valor === true)}
                      aria-label={`Marcar "${c.nombre}" como pendiente`}
                    />
                    <span className="min-w-0 flex-1 line-through">
                      {c.nombre} · {mes?.nombre ?? "gasto extra"}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums">
                      {formatEuros(c.importe)}
                    </span>
                    <button
                      type="button"
                      onClick={() => borrar(c.id)}
                      className="shrink-0 text-xs font-bold opacity-70 hover:opacity-100"
                      aria-label="Eliminar"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Tarjeta>
  );
}
