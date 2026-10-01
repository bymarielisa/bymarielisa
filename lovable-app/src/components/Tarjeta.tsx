import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tarjeta redondeada base de la app */
export function Tarjeta({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-3xl bg-card p-5 shadow-card", className)}>{children}</section>
  );
}

export function TituloSeccion({
  emoji,
  children,
  className,
}: {
  emoji?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("flex items-center gap-2 text-xl", className)}>
      {emoji && <span aria-hidden>{emoji}</span>}
      {children}
    </h2>
  );
}
