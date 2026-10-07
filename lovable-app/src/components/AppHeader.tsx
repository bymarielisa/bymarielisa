import { useNow } from "@/hooks/use-now";
import { DIAS_SEMANA, capitalizar, formatoCorto } from "@/lib/fechas";
import { AvatarDamian } from "./AvatarDamian";

export function AppHeader() {
  const now = useNow();
  return (
    <header className="flex items-center gap-4 px-5 pt-6 pb-2">
      <AvatarDamian className="size-16 shrink-0 rounded-full shadow-card sm:size-20" />
      <div className="min-w-0">
        <h1 className="text-2xl leading-tight sm:text-3xl">¡Hola!</h1>
        <p className="text-sm text-muted-foreground sm:text-base" suppressHydrationWarning>
          {now
            ? `Hoy es ${capitalizar(DIAS_SEMANA[now.getDay()] ?? "")}, ${formatoCorto(now)}`
            : "Cargando el día…"}
        </p>
      </div>
      <span className="ml-auto hidden rounded-full bg-sky-soft px-3 py-1 font-display text-sm font-bold text-sky-soft-foreground sm:inline-flex">
        DamiánFG
      </span>
    </header>
  );
}
