import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MiniCalendario } from "@/components/MiniCalendario";
import { Tarjeta, TituloSeccion } from "@/components/Tarjeta";
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
import { useNow } from "@/hooks/use-now";
import {
  NOMBRE,
  esDiaDeCambio,
  excepcionEnFecha,
  proximoCambio,
  quienTieneConExcepciones,
  repartoDia,
} from "@/lib/custodia";
import { DIAS_SEMANA, deFechaISO, esFinDeSemana, formatoCorto } from "@/lib/fechas";
import {
  addCustodiaExcepcion,
  eliminarCustodiaExcepcion,
  getCustodiaExcepciones,
  type ExcepcionCustodia,
  type QuienCustodia,
} from "@/lib/custodiaExcepciones";

export const Route = createFileRoute("/custodia")({
  head: () => ({
    meta: [
      { title: "Custodia — DamiánFG" },
      {
        name: "description",
        content:
          "Con quién está Damián hoy, próximo cambio y calendario mensual de custodia entre Papá y Mamá.",
      },
      { property: "og:title", content: "Custodia — DamiánFG" },
      {
        property: "og:description",
        content: "Con quién está Damián hoy y calendario mensual de custodia.",
      },
    ],
  }),
  component: CustodiaPage,
});

function CustodiaPage() {
  const now = useNow();
  const [excepciones, setExcepciones] = useState<ExcepcionCustodia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getCustodiaExcepciones()
      .then(setExcepciones)
      .catch(() => setExcepciones([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      {now ? (
        <TarjetaHoy now={now} excepciones={excepciones} />
      ) : (
        <Tarjeta className="h-36 animate-pulse" children={null} />
      )}

      <Tarjeta>
        <TituloSeccion emoji="🗓️">Calendario de custodia</TituloSeccion>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1">
            <i className="size-3 rounded-full bg-sky" /> Papá
          </span>
          <span className="flex items-center gap-1">
            <i className="size-3 rounded-full bg-coral" /> Mamá
          </span>
          <span className="flex items-center gap-1">
            <i className="size-3 rounded-full bg-split-mama-papa" /> Día de cambio (17:00)
          </span>
          <span className="flex items-center gap-1">🤝 Cambio acordado</span>
        </div>
        <div className="mt-3">
          {now ? (
            <MiniCalendario
              hoy={now}
              renderDia={(fecha, esHoy) => {
                const d = fecha.getDate();
                const exc = excepcionEnFecha(excepciones, fecha);
                const { manana, tarde } = repartoDia(d);
                const cambio = !exc && esDiaDeCambio(d);
                const fondo = exc
                  ? exc.quien === "Papá"
                    ? "bg-sky text-sky-foreground"
                    : "bg-coral text-coral-foreground"
                  : cambio
                    ? manana === "mama"
                      ? "bg-split-mama-papa text-coral-foreground"
                      : "bg-split-papa-mama text-coral-foreground"
                    : manana === "papa"
                      ? "bg-sky text-sky-foreground"
                      : "bg-coral text-coral-foreground";
                const titulo = exc
                  ? `Cambio acordado: ${exc.quien}${exc.nota ? ` — ${exc.nota}` : ""}`
                  : cambio
                    ? `${NOMBRE[manana]} por la mañana, ${NOMBRE[tarde]} por la tarde`
                    : NOMBRE[manana];
                return (
                  <div
                    title={titulo}
                    className={`relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-2xl text-sm font-extrabold ${fondo} ${
                      esHoy ? "ring-[3px] ring-sun ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    <span className="drop-shadow-sm">{d}</span>
                    {exc && (
                      <span className="absolute -right-1 -top-1 text-[10px]" aria-hidden>
                        🤝
                      </span>
                    )}
                    {!exc && cambio && esFinDeSemana(fecha) && (
                      <span className="absolute -right-1 -top-1 text-[10px]" aria-hidden>
                        ⚠
                      </span>
                    )}
                  </div>
                );
              }}
              pie={() => (
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li className="rounded-2xl bg-sky-soft px-3 py-2 text-sky-soft-foreground">
                    <b>Día 1 (tarde) → día 16 (mañana):</b> con Papá
                  </li>
                  <li className="rounded-2xl bg-coral-soft px-3 py-2">
                    <b>Día 16 (tarde) → día 1 (mañana):</b> con Mamá
                  </li>
                </ul>
              )}
            />
          ) : (
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          )}
        </div>
      </Tarjeta>

      <ExcepcionesCustodia
        excepciones={excepciones}
        cargando={cargando}
        onCambio={setExcepciones}
      />
    </>
  );
}

function TarjetaHoy({ now, excepciones }: { now: Date; excepciones: ExcepcionCustodia[] }) {
  const exc = excepcionEnFecha(excepciones, now);
  const quien = quienTieneConExcepciones(now, excepciones);
  const prox = proximoCambio(now);
  const esPapa = quien === "papa";
  const hoyCambio = !exc && esDiaDeCambio(now.getDate());

  return (
    <Tarjeta className={esPapa ? "bg-sky text-sky-foreground" : "bg-coral text-coral-foreground"}>
      <TituloSeccion emoji={esPapa ? "👨" : "👩"}>
        Hoy Damián está con {NOMBRE[quien]}
      </TituloSeccion>
      {exc && (
        <p className="mt-1 text-sm font-bold opacity-90">
          🤝 Cambio acordado para hoy{exc.nota ? `: ${exc.nota}` : ""}
        </p>
      )}
      {hoyCambio && (
        <p className="mt-1 text-sm font-bold opacity-90">
          Hoy es día de cambio: {NOMBRE[repartoDia(now.getDate()).manana]} por la mañana,{" "}
          {NOMBRE[repartoDia(now.getDate()).tarde]} por la tarde.
        </p>
      )}
      <div className="mt-3 rounded-2xl bg-card/30 px-4 py-3">
        <p className="text-xs font-extrabold uppercase tracking-wide opacity-80">Próximo cambio</p>
        <p className="font-display text-xl font-extrabold leading-tight">
          {DIAS_SEMANA[prox.fecha.getDay()]} {formatoCorto(prox.fecha)} → {NOMBRE[prox.hacia]}
        </p>
        <p className="text-sm font-bold opacity-90">
          {prox.finDeSemana
            ? "⚠ Cambio en fin de semana, hora variable"
            : "A las 17:00 en el colegio"}
        </p>
        <p className="mt-1 text-xs opacity-75">
          (Calculado con la regla fija; no tiene en cuenta cambios acordados que aún no has
          añadido.)
        </p>
      </div>
    </Tarjeta>
  );
}

function ExcepcionesCustodia({
  excepciones,
  cargando,
  onCambio,
}: {
  excepciones: ExcepcionCustodia[];
  cargando: boolean;
  onCambio: (e: ExcepcionCustodia[]) => void;
}) {
  const [fecha, setFecha] = useState("");
  const [quien, setQuien] = useState<QuienCustodia>("Papá");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  const ordenadas = [...excepciones].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const enviar = async () => {
    if (!fecha) return;
    setEnviando(true);
    setError(false);
    try {
      const siguiente = await addCustodiaExcepcion({ data: { fecha, quien, nota } });
      onCambio(siguiente);
      setFecha("");
      setNota("");
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (id: string) => {
    try {
      const siguiente = await eliminarCustodiaExcepcion({ data: { id } });
      onCambio(siguiente);
    } catch {
      setError(true);
    }
  };

  return (
    <Tarjeta>
      <TituloSeccion emoji="🤝">Cambios de mutuo acuerdo</TituloSeccion>
      <p className="mt-1 text-sm text-muted-foreground">
        La regla de siempre se mantiene; esto es solo para anotar un día concreto en el que quedamos
        en algo distinto.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="min-w-0">
            <Label htmlFor="exc-fecha" className="text-xs">
              Día
            </Label>
            <Input
              id="exc-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor="exc-quien" className="text-xs">
              Con quién
            </Label>
            <Select value={quien} onValueChange={(v) => setQuien(v as QuienCustodia)}>
              <SelectTrigger id="exc-quien" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Papá">Papá</SelectItem>
                <SelectItem value="Mamá">Mamá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="sm:self-end">
          <Label htmlFor="exc-nota" className="text-xs">
            Nota (opcional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="exc-nota"
              placeholder="Ej. viaje de trabajo"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
            <Button onClick={enviar} disabled={!fecha || enviando}>
              Añadir
            </Button>
          </div>
          {error && (
            <p className="mt-1 text-xs font-bold text-destructive">
              No se pudo guardar, inténtalo de nuevo en un momento.
            </p>
          )}
        </div>
      </div>

      {!cargando && ordenadas.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ordenadas.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/60 px-3 py-2 text-sm"
            >
              <span>
                <b>{formatoCorto(deFechaISO(e.fecha))}</b> → {e.quien}
                {e.nota && <span className="text-muted-foreground"> · {e.nota}</span>}
              </span>
              <button
                type="button"
                onClick={() => borrar(e.id)}
                className="shrink-0 text-xs font-bold text-muted-foreground hover:text-foreground"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}
