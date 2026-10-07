import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIAS_CORTOS, MESES, capitalizar, columnaLunes, diasDelMes } from "@/lib/fechas";

interface Props {
  /** Fecha actual (hora local) para abrir el mes y marcar "hoy" */
  hoy: Date;
  /** Cómo pintar cada celda del mes visible */
  renderDia: (fecha: Date, esHoy: boolean) => ReactNode;
  /** Contenido extra bajo el grid según el mes visible */
  pie?: (anio: number, mes0: number) => ReactNode;
}

/** Mini-calendario mensual navegable. Todas las comparaciones en hora local. */
export function MiniCalendario({ hoy, renderDia, pie }: Props) {
  const [vista, setVista] = useState({ anio: hoy.getFullYear(), mes0: hoy.getMonth() });

  const mover = (delta: number) =>
    setVista((v) => {
      const d = new Date(v.anio, v.mes0 + delta, 1);
      return { anio: d.getFullYear(), mes0: d.getMonth() };
    });

  const primerDia = new Date(vista.anio, vista.mes0, 1);
  const huecos = columnaLunes(primerDia);
  const total = diasDelMes(vista.anio, vista.mes0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Mes anterior"
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h3 className="text-lg">
          {capitalizar(MESES[vista.mes0] ?? "")} {vista.anio}
        </h3>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Mes siguiente"
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_CORTOS.map((d, i) => (
          <div key={i} className="py-1 text-xs font-extrabold text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: huecos }).map((_, i) => (
          <div key={`h${i}`} />
        ))}
        {Array.from({ length: total }).map((_, i) => {
          const fecha = new Date(vista.anio, vista.mes0, i + 1);
          const esHoy =
            fecha.getFullYear() === hoy.getFullYear() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getDate() === hoy.getDate();
          return <div key={i}>{renderDia(fecha, esHoy)}</div>;
        })}
      </div>

      {pie?.(vista.anio, vista.mes0)}
    </div>
  );
}
