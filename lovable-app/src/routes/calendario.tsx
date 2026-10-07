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
import { CUMPLEANOS, FESTIVOS, type Cumple, type TipoCumple } from "@/data/calendario";
import { deFechaISO, diasEntre, formatoCorto } from "@/lib/fechas";
import {
  addRecordatorioExtra,
  editarRecordatorioExtra,
  eliminarRecordatorioExtra,
  getRecordatoriosExtra,
  type AutorRecordatorio,
  type RecordatorioExtra,
} from "@/lib/recordatoriosExtra";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario — DamiánFG" },
      {
        name: "description",
        content:
          "Recordatorios y citas de Damián, cumpleaños cercanos y días no lectivos del curso 2026-2027.",
      },
      { property: "og:title", content: "Calendario — DamiánFG" },
      {
        property: "og:description",
        content: "Recordatorios y citas de Damián, cumpleaños y días no lectivos.",
      },
    ],
  }),
  component: CalendarioPage,
});

const TONO_CUMPLE: Record<TipoCumple, string> = {
  damian: "bg-damian",
  familia: "bg-leaf text-leaf-foreground",
  amigo: "bg-lilac text-lilac-foreground",
};
const ETIQUETA_CUMPLE: Record<TipoCumple, string> = {
  damian: "¡Es Damián!",
  familia: "Familia",
  amigo: "Amigo/a",
};

/** Próxima ocurrencia anual de un cumpleaños a partir de hoy (hora local) */
function proximaOcurrencia(c: Cumple, hoy: Date): Date {
  const esteAnio = new Date(hoy.getFullYear(), c.mes - 1, c.dia);
  return diasEntre(hoy, esteAnio) >= 0
    ? esteAnio
    : new Date(hoy.getFullYear() + 1, c.mes - 1, c.dia);
}

const textoDias = (n: number) => (n === 0 ? "Hoy" : n === 1 ? "Mañana" : `en ${n} días`);

const festivoDe = (f: Date) =>
  FESTIVOS.find(
    (x) => x.anio === f.getFullYear() && x.mes === f.getMonth() + 1 && x.dia === f.getDate(),
  );
const cumpleDe = (f: Date) =>
  CUMPLEANOS.find((c) => c.mes === f.getMonth() + 1 && c.dia === f.getDate());

function CalendarioPage() {
  const now = useNow();
  const [extra, setExtra] = useState<RecordatorioExtra[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getRecordatoriosExtra()
      .then(setExtra)
      .catch(() => setExtra([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <RecordatoriosFamilia extra={extra} cargando={cargando} onCambio={setExtra} />

      {now && <CumplesCerca hoy={now} />}

      <Tarjeta>
        <TituloSeccion emoji="🎈">Días no lectivos</TituloSeccion>
        <div className="mt-3">
          {now ? (
            <MiniCalendario
              hoy={now}
              renderDia={(fecha, esHoy) => {
                const festivo = festivoDe(fecha);
                const cumple = cumpleDe(fecha);
                const tono = festivo
                  ? "bg-coral text-coral-foreground"
                  : cumple
                    ? TONO_CUMPLE[cumple.tipo]
                    : "text-foreground";
                return (
                  <div
                    title={festivo?.nombre ?? (cumple ? `Cumple de ${cumple.nombre}` : undefined)}
                    className={`relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-2xl text-sm font-bold ${tono} ${
                      esHoy ? "ring-[3px] ring-sky ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    {fecha.getDate()}
                    {cumple && (
                      <span className="absolute -right-1 -top-1 text-[10px]" aria-hidden>
                        🎂
                      </span>
                    )}
                  </div>
                );
              }}
              pie={(anio, mes0) => {
                const delMes = FESTIVOS.filter((f) => f.anio === anio && f.mes === mes0 + 1);
                const cumplesMes = CUMPLEANOS.filter((c) => c.mes === mes0 + 1);
                return (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <i className="size-3 rounded-full bg-coral" /> Festivo
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="size-3 rounded-full ring-2 ring-sky" /> Hoy
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="size-3 rounded-full bg-leaf" /> Familia
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="size-3 rounded-full bg-lilac" /> Amigos
                      </span>
                    </div>
                    {delMes.length > 0 ? (
                      <ul className="space-y-1.5">
                        {delMes.map((f) => (
                          <li
                            key={f.dia}
                            className="flex items-center gap-3 rounded-2xl bg-coral-soft px-3 py-2 text-sm"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-coral font-display font-extrabold text-coral-foreground">
                              {f.dia}
                            </span>
                            <span className="font-bold">{f.nombre}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sin días no lectivos este mes.
                      </p>
                    )}
                    {cumplesMes.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        🎂 Cumples: {cumplesMes.map((c) => `${c.nombre} (${c.dia})`).join(", ")}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          ) : (
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          )}
        </div>
      </Tarjeta>
    </>
  );
}

function RecordatoriosFamilia({
  extra,
  cargando,
  onCambio,
}: {
  extra: RecordatorioExtra[];
  cargando: boolean;
  onCambio: (r: RecordatorioExtra[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [nota, setNota] = useState("");
  const [autor, setAutor] = useState<AutorRecordatorio>("Papá");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  const conFecha = [...extra]
    .filter((r) => r.fecha)
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));
  const sinFecha = [...extra]
    .filter((r) => !r.fecha)
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
  const ordenados = [...conFecha, ...sinFecha];

  const limpiar = () => {
    setEditId(null);
    setTitulo("");
    setFecha("");
    setNota("");
    setAutor("Papá");
  };

  const editar = (r: RecordatorioExtra) => {
    setEditId(r.id);
    setTitulo(r.titulo);
    setFecha(r.fecha ?? "");
    setNota(r.nota);
    setAutor(r.autor);
  };

  const enviar = async () => {
    if (!titulo.trim()) return;
    setEnviando(true);
    setError(false);
    const datos = { titulo, fecha: fecha || null, nota, autor };
    try {
      const siguiente = editId
        ? await editarRecordatorioExtra({ data: { id: editId, ...datos } })
        : await addRecordatorioExtra({ data: datos });
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
      const siguiente = await eliminarRecordatorioExtra({ data: { id } });
      onCambio(siguiente);
      if (editId === id) limpiar();
    } catch {
      setError(true);
    }
  };

  return (
    <Tarjeta>
      <TituloSeccion emoji="📌">Recordatorios y citas de Damián</TituloSeccion>
      <p className="mt-1 text-sm text-muted-foreground">
        Avisos del cole y citas de Damián. Lo que añadan o corrijan se ve automáticamente en ambos
        celulares.
      </p>

      <div className="mt-3 space-y-2">
        <Input placeholder="¿Qué es?" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="rec-fecha" className="text-xs">
              Fecha (si ya se sabe)
            </Label>
            <Input
              id="rec-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="rec-autor" className="text-xs">
              Quién avisa
            </Label>
            <Select value={autor} onValueChange={(v) => setAutor(v as AutorRecordatorio)}>
              <SelectTrigger id="rec-autor" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Papá">Papá</SelectItem>
                <SelectItem value="Mamá">Mamá</SelectItem>
                <SelectItem value="Cole">El cole</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nota (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
          <Button onClick={enviar} disabled={!titulo.trim() || enviando}>
            {editId ? "Guardar" : "Añadir"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" onClick={limpiar} disabled={enviando}>
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

      {!cargando && ordenados.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ordenados.map((r) => (
            <li
              key={r.id}
              className="flex items-start gap-3 rounded-2xl bg-sun-soft px-3 py-2 text-sun-soft-foreground"
            >
              <span aria-hidden>📍</span>
              <button type="button" onClick={() => editar(r)} className="min-w-0 flex-1 text-left">
                <p className="font-display font-bold leading-tight">{r.titulo}</p>
                <p className="text-xs opacity-80">
                  {r.fecha ? formatoCorto(deFechaISO(r.fecha)) : "Fecha por confirmar"} · avisó{" "}
                  {r.autor}
                  {r.nota && ` · ${r.nota}`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => borrar(r.id)}
                className="shrink-0 text-xs font-bold opacity-70 hover:opacity-100"
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

function CumplesCerca({ hoy }: { hoy: Date }) {
  const cerca = CUMPLEANOS.map((c) => ({ c, dias: diasEntre(hoy, proximaOcurrencia(c, hoy)) }))
    .filter((x) => x.dias <= 14)
    .sort((a, b) => a.dias - b.dias);
  if (cerca.length === 0) return null;

  return (
    <Tarjeta>
      <TituloSeccion emoji="🎉">Cumpleaños cerca</TituloSeccion>
      <ul className="mt-3 space-y-2">
        {cerca.map(({ c, dias }) => (
          <li
            key={c.nombre}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${TONO_CUMPLE[c.tipo]}`}
          >
            <span className="text-2xl" aria-hidden>
              {c.tipo === "damian" ? "🎂" : "🎁"}
            </span>
            <div className="flex-1">
              <p className="font-display text-lg font-extrabold leading-tight">{c.nombre}</p>
              <p className="text-xs font-bold opacity-90">
                {ETIQUETA_CUMPLE[c.tipo]} · {formatoCorto(proximaOcurrencia(c, hoy))}
              </p>
            </div>
            <span className="rounded-full bg-card/30 px-3 py-1 font-display text-sm font-extrabold">
              {textoDias(dias)}
            </span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
