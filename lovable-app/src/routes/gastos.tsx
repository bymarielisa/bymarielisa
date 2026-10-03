import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { GASTOS, GASTOS_EXTRA, formatEuros, totalGastosExtra, totalMes } from "@/data/gastos";

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
  const totales = GASTOS.map(totalMes);
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

      <Tarjeta>
        <TituloSeccion emoji="🧾">Mes a mes</TituloSeccion>
        <Accordion type="single" collapsible className="mt-2">
          {GASTOS.map((mes) => {
            const total = totalMes(mes);
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
