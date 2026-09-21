import { createFileRoute } from "@tanstack/react-router";
import { MiniCalendario } from "@/components/MiniCalendario";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
import { useNow } from "@/hooks/use-now";
import { NOMBRE, esDiaDeCambio, proximoCambio, quienTiene, repartoDia } from "@/lib/custodia";
import { DIAS_SEMANA, esFinDeSemana, formatoCorto } from "@/lib/fechas";

export const Route = createFileRoute("/custodia")({
  head: () => ({
    meta: [
      { title: "Custodia — DamiánFG" },
      { name: "description", content: "Con quién está Damián hoy, próximo cambio y calendario mensual de custodia entre Papá y Mamá." },
      { property: "og:title", content: "Custodia — DamiánFG" },
      { property: "og:description", content: "Con quién está Damián hoy y calendario mensual de custodia." },
    ],
  }),
  component: CustodiaPage,
});

function CustodiaPage() {
  const now = useNow();

  return (
    <>
      {now ? <TarjetaHoy now={now} /> : <Tarjeta className="h-36 animate-pulse" children={null} />}

      <Tarjeta>
        <TituloSeccion emoji="🗓️">Calendario de custodia</TituloSeccion>
        <div className="mt-2 flex gap-3 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1"><i className="size-3 rounded-full bg-sky" /> Papá</span>
          <span className="flex items-center gap-1"><i className="size-3 rounded-full bg-coral" /> Mamá</span>
          <span className="flex items-center gap-1"><i className="size-3 rounded-full bg-split-mama-papa" /> Día de cambio (14:00)</span>
        </div>
        <div className="mt-3">
          {now ? (
            <MiniCalendario
              hoy={now}
              renderDia={(fecha, esHoy) => {
                const d = fecha.getDate();
                const { manana, tarde } = repartoDia(d);
                const cambio = esDiaDeCambio(d);
                const fondo = cambio
                  ? manana === "mama"
                    ? "bg-split-mama-papa text-coral-foreground"
                    : "bg-split-papa-mama text-coral-foreground"
                  : manana === "papa"
                    ? "bg-sky text-sky-foreground"
                    : "bg-coral text-coral-foreground";
                return (
                  <div
                    title={cambio ? `${NOMBRE[manana]} por la mañana, ${NOMBRE[tarde]} por la tarde` : NOMBRE[manana]}
                    className={`relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-2xl text-sm font-extrabold ${fondo} ${
                      esHoy ? "ring-[3px] ring-sun ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    <span className="drop-shadow-sm">{d}</span>
                    {cambio && esFinDeSemana(fecha) && (
                      <span className="absolute -right-1 -top-1 text-[10px]" aria-hidden>⚠</span>
                    )}
                  </div>
                );
              }}
              pie={() => (
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li className="rounded-2xl bg-sky-soft px-3 py-2 text-sky-foreground">
                    <b>Día 1 (tarde) → día 16 (mañana):</b> con Papá
                  </li>
                  <li className="rounded-2xl bg-coral-soft px-3 py-2">
                    <b>Día 16 (tarde) → día 1 (mañana):</b> con Mamá
                  </li>
                  <li className="px-3 text-xs text-muted-foreground">
                    Los cambios se hacen en el colegio a las 14:00 (después del comedor), de lunes a viernes. ⚠ Si el 1 o el 16
                    cae en fin de semana, la hora es variable.
                  </li>
                </ul>
              )}
            />
          ) : (
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          )}
        </div>
      </Tarjeta>
    </>
  );
}

function TarjetaHoy({ now }: { now: Date }) {
  const quien = quienTiene(now);
  const prox = proximoCambio(now);
  const esPapa = quien === "papa";
  const hoyCambio = esDiaDeCambio(now.getDate());

  return (
    <Tarjeta className={esPapa ? "bg-sky text-sky-foreground" : "bg-coral text-coral-foreground"}>
      <TituloSeccion emoji={esPapa ? "👨" : "👩"}>Hoy Damián está con {NOMBRE[quien]}</TituloSeccion>
      {hoyCambio && (
        <p className="mt-1 text-sm font-bold opacity-90">
          Hoy es día de cambio: {NOMBRE[repartoDia(now.getDate()).manana]} por la mañana, {NOMBRE[repartoDia(now.getDate()).tarde]} por la tarde.
        </p>
      )}
      <div className="mt-3 rounded-2xl bg-card/30 px-4 py-3">
        <p className="text-xs font-extrabold uppercase tracking-wide opacity-80">Próximo cambio</p>
        <p className="font-display text-xl font-extrabold leading-tight">
          {DIAS_SEMANA[prox.fecha.getDay()]} {formatoCorto(prox.fecha)} → {NOMBRE[prox.hacia]}
        </p>
        <p className="text-sm font-bold opacity-90">
          {prox.finDeSemana ? "⚠ Cambio en fin de semana, hora variable" : "A las 14:00 en el colegio"}
        </p>
      </div>
    </Tarjeta>
  );
}
