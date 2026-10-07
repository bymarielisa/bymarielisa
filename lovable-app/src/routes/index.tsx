import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { useNow } from "@/hooks/use-now";
import { COLEGIO, HORARIO_SEMANAL } from "@/data/horario";
import { CLASE_ASIGNATURAS, type Asignatura, type ClaveAsignatura } from "@/data/horarioClase";
import {
  actividadFueraDelColeHoy,
  aplicanExtraescolares,
  bloquesDelDia,
  esJornadaCorta,
  estadoAhora,
  type Bloque,
} from "@/lib/horario";
import { formatoHora } from "@/lib/fechas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horario — DamiánFG" },
      {
        name: "description",
        content:
          "Qué está haciendo Damián ahora mismo y su horario semanal en el CEIP María de Villota.",
      },
      { property: "og:title", content: "Horario — DamiánFG" },
      {
        property: "og:description",
        content: "Qué está haciendo Damián ahora mismo y su horario semanal.",
      },
    ],
  }),
  component: HorarioPage,
});

const TONO_BLOQUE: Record<Bloque["tipo"], string> = {
  entrada: "bg-sky-soft text-sky-soft-foreground",
  asignatura: "", // color propio por asignatura, ver COLOR_CHIP
  clase: "bg-sun-soft text-sun-soft-foreground",
  recreo: "bg-leaf-soft text-leaf-soft-foreground",
  comedor: "bg-coral-soft text-foreground",
  juegos: "bg-lilac-soft text-foreground",
  tardes: "bg-lilac-soft text-foreground",
  recogida: "bg-secondary text-secondary-foreground",
  extraescolar: "bg-sun-soft text-sun-soft-foreground",
  salida: "bg-secondary text-secondary-foreground",
  camino: "bg-secondary text-secondary-foreground",
  "fuera-del-cole": "bg-sky-soft text-sky-soft-foreground",
};

const COLOR_CHIP: Record<Asignatura["color"], string> = {
  sky: "bg-sky text-sky-foreground",
  sun: "bg-sun text-sun-foreground",
  coral: "bg-coral text-coral-foreground",
  leaf: "bg-leaf text-leaf-foreground",
  lilac: "bg-lilac text-lilac-foreground",
  teal: "bg-teal text-teal-foreground",
  orange: "bg-orange text-orange-foreground",
  sand: "bg-sand text-sand-foreground",
};

const hora = (h: string) => h.replace(/^0/, "");

function HorarioPage() {
  const now = useNow();
  return (
    <>
      <TarjetaAhora now={now} />
      <ListaSemanal now={now} />
    </>
  );
}

function TarjetaAhora({ now }: { now: Date | null }) {
  if (!now) {
    return (
      <Tarjeta className="animate-pulse">
        <TituloSeccion emoji="⏰">Ahora mismo</TituloSeccion>
        <div className="mt-3 h-10 rounded-2xl bg-muted" />
      </Tarjeta>
    );
  }
  const estado = estadoAhora(now);
  return (
    <Tarjeta className="bg-damian">
      <div className="flex items-center justify-between">
        <TituloSeccion emoji="⏰">Ahora mismo</TituloSeccion>
        <span className="rounded-full bg-card/30 px-3 py-0.5 font-display text-sm font-bold">
          {formatoHora(now)}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="text-5xl drop-shadow" aria-hidden>
          {estado.icono}
        </span>
        <div>
          <p className="font-display text-2xl font-extrabold leading-tight">{estado.titulo}</p>
          {estado.bloque && (
            <p className="text-sm font-bold opacity-90">
              {hora(estado.bloque.inicio)} – {hora(estado.bloque.fin)}
            </p>
          )}
          {estado.detalle && <p className="text-sm opacity-90">{estado.detalle}</p>}
          {estado.siguiente && (
            <p className="mt-1 text-xs font-bold opacity-80">
              Después: {estado.siguiente.titulo} ({hora(estado.siguiente.inicio)})
            </p>
          )}
        </div>
      </div>
    </Tarjeta>
  );
}

function ListaSemanal({ now }: { now: Date | null }) {
  // Fecha de referencia para las reglas (sept/junio/otros, día de natación). Hasta hidratar, usamos octubre.
  const fecha = now ?? new Date(2026, 9, 1);
  const mes0 = fecha.getMonth();
  const hoyDia = now ? now.getDay() : 0;
  const [abierto, setAbierto] = useState<string>("");
  const [asignaturaAbierta, setAsignaturaAbierta] = useState<ClaveAsignatura | null>(null);
  useEffect(() => {
    if (now) setAbierto(String(now.getDay()));
  }, [now === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const detalleAsignatura = asignaturaAbierta ? CLASE_ASIGNATURAS[asignaturaAbierta] : null;

  return (
    <Tarjeta>
      <TituloSeccion emoji="📅">Semana en el cole</TituloSeccion>
      <p className="mt-1 text-sm text-muted-foreground">
        {COLEGIO.clase} · {COLEGIO.nombre}
        <br />
        Tutora: {COLEGIO.tutora} · Inglés: {COLEGIO.ingles}
      </p>
      {esJornadaCorta(mes0) && (
        <p className="mt-2 rounded-2xl bg-sun-soft px-3 py-2 text-sm font-bold text-sun-soft-foreground">
          {aplicanExtraescolares(mes0)
            ? "Junio: jornada de tarde adelantada, con extraescolares."
            : "Septiembre: jornada de tarde adelantada, sin extraescolares ni natación hasta octubre."}
        </p>
      )}

      <Accordion
        type="single"
        collapsible
        value={abierto}
        onValueChange={setAbierto}
        className="mt-3"
      >
        {HORARIO_SEMANAL.map((dia) => {
          const esHoy = dia.dia === hoyDia;
          const bloques = bloquesDelDia(dia, fecha);
          const extras = aplicanExtraescolares(mes0);
          const actividad = extras ? actividadFueraDelColeHoy(dia, fecha) : undefined;
          return (
            <AccordionItem key={dia.dia} value={String(dia.dia)} className="border-b-0 py-1">
              <AccordionTrigger className="min-h-14 rounded-2xl px-3 hover:bg-secondary hover:no-underline">
                <div className="flex flex-1 items-center gap-3 text-left">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold ${
                      esHoy
                        ? "bg-sun text-sun-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {dia.nombre.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold leading-tight">
                      {dia.nombre}
                      {esHoy && <span className="ml-2 text-xs font-extrabold text-coral">HOY</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {extras ? `⭐ ${dia.extraescolar}` : "Sin extraescolar"}
                      {actividad && ` · ${actividad.icono} ${actividad.nombre}`} · 🍎 {dia.merienda}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <ol className="relative ml-3 space-y-2 border-l-2 border-dashed border-border pl-5">
                  {bloques.map((b, i) => {
                    const esAsignatura = b.tipo === "asignatura" && b.asignatura;
                    const tono = esAsignatura
                      ? COLOR_CHIP[CLASE_ASIGNATURAS[b.asignatura as ClaveAsignatura].color]
                      : TONO_BLOQUE[b.tipo];
                    const contenido = (
                      <>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-display font-bold">{b.titulo}</p>
                          <p className="shrink-0 text-xs font-extrabold tabular-nums">
                            {b.inicio === b.fin
                              ? hora(b.inicio)
                              : `${hora(b.inicio)} – ${hora(b.fin)}`}
                          </p>
                        </div>
                        {b.detalle && <p className="text-xs opacity-80">{b.detalle}</p>}
                      </>
                    );
                    return (
                      <li key={i} className="relative">
                        <span
                          className={`absolute -left-[31px] top-2 flex size-6 items-center justify-center rounded-full text-sm ${tono}`}
                          aria-hidden
                        >
                          {b.icono}
                        </span>
                        {esAsignatura ? (
                          <button
                            type="button"
                            onClick={() => setAsignaturaAbierta(b.asignatura ?? null)}
                            className={`w-full rounded-2xl px-3 py-2 text-left ${tono}`}
                          >
                            {contenido}
                          </button>
                        ) : (
                          <div className={`rounded-2xl px-3 py-2 ${tono}`}>{contenido}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Las áreas son las del currículo oficial de Infantil (LOMLOE). En clase se trabajan de forma
        global: el horario marca el foco de cada franja.
      </p>

      <Sheet
        open={detalleAsignatura !== null}
        onOpenChange={(open) => !open && setAsignaturaAbierta(null)}
      >
        <SheetContent side="bottom" className="rounded-t-3xl">
          {detalleAsignatura && (
            <>
              <SheetHeader className="items-start text-left">
                <span className="text-4xl" aria-hidden>
                  {detalleAsignatura.icono}
                </span>
                <SheetTitle className="font-display text-xl">
                  {detalleAsignatura.etiqueta}
                </SheetTitle>
              </SheetHeader>
              {detalleAsignatura.profe && (
                <p className="text-sm font-bold text-muted-foreground">
                  Imparte: {detalleAsignatura.profe}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed">{detalleAsignatura.descripcion}</p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Tarjeta>
  );
}
