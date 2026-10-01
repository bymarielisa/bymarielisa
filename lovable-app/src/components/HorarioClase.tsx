import { useEffect, useState } from "react";
import {
  CLASE_ASIGNATURAS,
  CLASE_FRANJAS_HORAS,
  CLASE_HORARIO,
  type Asignatura,
  type ClaveAsignatura,
} from "@/data/horarioClase";
import type { DiaSemana } from "@/data/horario";
import { parseHora } from "@/lib/fechas";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

const DIAS_PILL: { dia: DiaSemana; letra: string }[] = [
  { dia: 1, letra: "L" },
  { dia: 2, letra: "M" },
  { dia: 3, letra: "X" },
  { dia: 4, letra: "J" },
  { dia: 5, letra: "V" },
];

/** Sábado/domingo (0, 6) no tienen horario propio: se muestra el lunes por defecto */
const diaPorDefecto = (hoy: number): DiaSemana => (hoy >= 1 && hoy <= 5 ? (hoy as DiaSemana) : 1);

export function HorarioClase({ now }: { now: Date | null }) {
  const [diaSel, setDiaSel] = useState<DiaSemana>(1);
  const [abierta, setAbierta] = useState<ClaveAsignatura | null>(null);

  // En el primer render `now` es null (hidratación); en cuanto llega la hora real,
  // seleccionamos el día de hoy por defecto (una sola vez, sin pisar clics posteriores del usuario).
  useEffect(() => {
    if (now) setDiaSel(diaPorDefecto(now.getDay()));
  }, [now === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const franjas = CLASE_HORARIO[diaSel];
  const minutosAhora = now ? now.getHours() * 60 + now.getMinutes() : -1;
  const esHoy = now ? now.getDay() === diaSel : false;
  const asignaturaAbierta = abierta ? CLASE_ASIGNATURAS[abierta] : null;

  return (
    <Tarjeta>
      <TituloSeccion emoji="🏫">Horario de clase – 4 años A</TituloSeccion>

      <div className="mt-3 flex gap-2">
        {DIAS_PILL.map(({ dia, letra }) => (
          <button
            key={dia}
            type="button"
            onClick={() => setDiaSel(dia)}
            className={`flex-1 rounded-full py-2 font-display text-sm font-bold transition-colors ${
              dia === diaSel
                ? "bg-lilac text-lilac-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {letra}
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {franjas.map((franja, i) => {
          const asign = CLASE_ASIGNATURAS[franja.asignatura];
          const fin = CLASE_FRANJAS_HORAS[i + 1];
          const esAhora =
            esHoy &&
            !!fin &&
            minutosAhora >= parseHora(franja.hora) &&
            minutosAhora < parseHora(fin);
          const discreta = franja.asignatura === "PATIO";
          return (
            <li key={franja.hora} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs font-extrabold tabular-nums text-muted-foreground">
                {franja.hora}
              </span>
              {discreta ? (
                <span className="flex-1 rounded-xl border border-dashed border-border py-1 text-center text-sm font-bold italic text-muted-foreground">
                  {asign.icono} {asign.nombre}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAbierta(franja.asignatura)}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left font-display font-bold ${COLOR_CHIP[asign.color]} ${
                    esAhora ? "ring-2 ring-foreground ring-offset-1 ring-offset-card" : ""
                  }`}
                >
                  <span aria-hidden>{asign.icono}</span>
                  <span>{asign.nombre}</span>
                </button>
              )}
            </li>
          );
        })}
        <li className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-xs font-extrabold tabular-nums text-muted-foreground">
            14:00
          </span>
          <span className="flex-1 rounded-xl border border-dashed border-border py-1 text-center text-sm font-bold italic text-muted-foreground">
            🍽️ Comedor / Casa
          </span>
        </li>
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Las áreas son las del currículo oficial de Infantil (LOMLOE). En clase se trabajan de forma
        global: el horario marca el foco de cada franja.
      </p>

      <Sheet open={asignaturaAbierta !== null} onOpenChange={(open) => !open && setAbierta(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {asignaturaAbierta && (
            <>
              <SheetHeader className="items-start text-left">
                <span className="text-4xl" aria-hidden>
                  {asignaturaAbierta.icono}
                </span>
                <SheetTitle className="font-display text-xl">
                  {asignaturaAbierta.etiqueta}
                </SheetTitle>
              </SheetHeader>
              {asignaturaAbierta.profe && (
                <p className="text-sm font-bold text-muted-foreground">
                  Imparte: {asignaturaAbierta.profe}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed">{asignaturaAbierta.descripcion}</p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Tarjeta>
  );
}
