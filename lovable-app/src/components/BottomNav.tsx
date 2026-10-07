import { Link } from "@tanstack/react-router";
import { Clock, PiggyBank, CalendarDays, Users } from "lucide-react";

const TABS = [
  { to: "/", label: "Horario", Icon: Clock, tono: "text-sky" },
  { to: "/gastos", label: "Gastos", Icon: PiggyBank, tono: "text-leaf" },
  { to: "/calendario", label: "Calendario", Icon: CalendarDays, tono: "text-lilac" },
  { to: "/custodia", label: "Custodia", Icon: Users, tono: "text-coral" },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid w-full max-w-md grid-cols-4 gap-1 rounded-3xl border bg-card/95 p-1.5 shadow-pop backdrop-blur">
        {TABS.map(({ to, label, Icon, tono }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="group flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-xs font-bold text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
          >
            <Icon className={`size-6 transition-transform group-data-[status=active]:scale-110 group-data-[status=active]:${tono}`} />
            <span className="font-display">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
