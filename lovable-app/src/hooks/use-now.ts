import { useEffect, useState } from "react";

/**
 * Devuelve la fecha/hora actual del dispositivo (hora local).
 * Es `null` durante el renderizado en servidor y la hidratación para evitar
 * desajustes; después se actualiza cada minuto.
 */
export function useNow(intervaloMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return now;
}
