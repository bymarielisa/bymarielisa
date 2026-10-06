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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { GASTOS, GASTOS_EXTRA, formatEuros, totalGastosExtra, totalMes } from "@/data/gastos";
import {
  addGastoExtra,
  eliminarGastoExtra,
  getGastosExtra,
  type AutorGasto,
  type GastoExtraCompartido,
} from "@/lib/gastosExtra";

const EXTRA_PAGADOS_KEY = "damianfg-gastos-extra-pagados";

/** Qué gastos extra están marcados como pagados. Se guarda en este navegador (localStorage). */
function useExtraPagados() {
  const [pagados, setPagados] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(EXTRA_PAGADOS_KEY);
      if (guardado) setPagados(new Set(JSON.parse(guardado) as string[]));
    } catch {
      // localStorage no disponible (modo privado, etc.): se ignora y queda sin marcar
    }
  }, []);

  const marcar = (id: string, pagado: boolean) => {
    setPagados((anterior) => {
      const siguiente = new Set(anterior);
      if (pagado) siguiente.add(id);
      else siguiente.delete(id);
      try {
        localStorage.setItem(EXTRA_PAGADOS_KEY, JSON.stringify([...siguiente]));
      } catch {
        // idem
      }
      return siguiente;
    });
  };

  return { pagados, marcar };
}

const sumaCambiosMes = (mesId: string, cambios: GastoExtraCompartido[]) =>
  Math.round(cambios.filter((c) => c.mesId === mesId).reduce((s, c) => s + c.importe, 0) * 100) /
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
  const [cargandoCambios, setCargandoCambios] = useState(true);

  useEffect(() => {
    getGastosExtra()
      .then(setCambios)
      .catch(() => setCambios([]))
      .finally(() => setCargandoCambios(false));
  }, []);

  const totales = GASTOS.map((mes) => totalMes(mes) + sumaCambiosMes(mes.id, cambios));
  const extraTotal = totalGastosExtra();
  const acumulado = totales.reduce((s, t) => s + t, 0) + extraTotal;
  const media = totales.length ? acumulado / totales.length : 0;
  const { pagados, marcar } = useExtraPagados();

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
            <p className="text-xs opacity-80">{GASTOS.length} meses</p>
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

      <AnadirCambioGasto cambios={cambios} cargando={cargandoCambios} onCambio={setCambios} />

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
                        className="flex items-center justify-between gap-3 py-2 text-sm text-lilac-foreground"
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
                    <div className="rounded-2xl bg-sky-soft p-3 text-sky-foreground">
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

      <Tarjeta>
        <TituloSeccion emoji="🧦">Gastos extras</TituloSeccion>
        <ul className="mt-2 divide-y divide-border">
          {GASTOS_EXTRA.map((gasto) => {
            const pagado = pagados.has(gasto.id);
            return (
              <li key={gasto.id} className="flex items-center gap-3 py-3">
                <Checkbox
                  checked={pagado}
                  onCheckedChange={(valor) => marcar(gasto.id, valor === true)}
                  aria-label={`Marcar "${gasto.nombre}" como pagado`}
                />
                <span
                  className={`flex-1 text-sm font-semibold ${pagado ? "text-muted-foreground line-through" : ""}`}
                >
                  {gasto.nombre}
                </span>
                <span className="font-bold tabular-nums">{formatEuros(gasto.importe)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-sky-soft p-3 text-sky-foreground">
            <p className="text-xs font-extrabold">👨 Papá paga</p>
            <p className="font-display text-xl font-extrabold tabular-nums">
              {formatEuros(extraTotal / 2)}
            </p>
          </div>
          <div className="rounded-2xl bg-coral-soft p-3">
            <p className="text-xs font-extrabold">👩 Mamá paga</p>
            <p className="font-display text-xl font-extrabold tabular-nums">
              {formatEuros(extraTotal / 2)}
            </p>
          </div>
        </div>
      </Tarjeta>
    </>
  );
}

function AnadirCambioGasto({
  cambios,
  cargando,
  onCambio,
}: {
  cambios: GastoExtraCompartido[];
  cargando: boolean;
  onCambio: (c: GastoExtraCompartido[]) => void;
}) {
  const [mesId, setMesId] = useState(GASTOS[GASTOS.length - 1]?.id ?? "");
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("");
  const [autor, setAutor] = useState<AutorGasto>("Papá");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  const ordenados = [...cambios].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  const enviar = async () => {
    const valor = parseFloat(importe.replace(",", "."));
    if (!mesId || !nombre.trim() || !Number.isFinite(valor) || valor <= 0) return;
    setEnviando(true);
    setError(false);
    try {
      const siguiente = await addGastoExtra({
        data: { mesId, nombre: nombre.trim(), importe: valor, autor },
      });
      onCambio(siguiente);
      setNombre("");
      setImporte("");
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
    } catch {
      setError(true);
    }
  };

  return (
    <Tarjeta>
      <TituloSeccion emoji="➕">Añadir un cambio</TituloSeccion>
      <p className="mt-1 text-sm text-muted-foreground">
        Para un gasto nuevo o distinto en un mes (ej. una matrícula o un cambio de mensualidad) — lo
        que añada uno lo ve el otro automáticamente, sin tener que pedírmelo. Se reparte 50/50 como
        el resto.
      </p>

      <div className="mt-3 space-y-2">
        <Select value={mesId} onValueChange={setMesId}>
          <SelectTrigger>
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {GASTOS.map((mes) => (
              <SelectItem key={mes.id} value={mes.id}>
                {mes.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="¿Qué es? (ej. Matrícula Rugby)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Importe €"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
          <Select value={autor} onValueChange={(v) => setAutor(v as AutorGasto)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Papá">Lo añade Papá</SelectItem>
              <SelectItem value="Mamá">Lo añade Mamá</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={enviar}
          disabled={!mesId || !nombre.trim() || !importe || enviando}
          className="w-full"
        >
          Añadir
        </Button>
        {error && (
          <p className="text-xs font-bold text-destructive">
            No se pudo guardar, inténtalo de nuevo en un momento.
          </p>
        )}
      </div>

      {!cargando && ordenados.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ordenados.map((c) => {
            const mes = GASTOS.find((m) => m.id === c.mesId);
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-lilac-soft px-3 py-2 text-sm text-lilac-foreground"
              >
                <span className="min-w-0 flex-1">
                  <b>{c.nombre}</b> · {mes?.nombre ?? c.mesId} · añadido por {c.autor}
                </span>
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
    </Tarjeta>
  );
}
