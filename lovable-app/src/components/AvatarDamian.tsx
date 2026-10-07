import { useEffect, useState } from "react";

/** Ruta de la foto real de Damián dentro de public/. Sube el archivo ahí con este nombre. */
const FOTO_SRC = "/damian.jpg";

/**
 * Avatar de Damián: usa la foto real (public/damian.jpg) si existe.
 * El servidor siempre dibuja el cartoon (para que SSR e hidratación coincidan); una vez
 * en el cliente, comprobamos si la foto carga y, si es así, la cambiamos. Así evitamos
 * depender de `onError` en el <img>, que puede perderse por una carrera con la hidratación
 * cuando el archivo falta y el 404 llega casi al instante.
 */
export function AvatarDamian({ className = "" }: { className?: string }) {
  const [fotoLista, setFotoLista] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelado) setFotoLista(true);
    };
    img.src = FOTO_SRC;
    return () => {
      cancelado = true;
    };
  }, []);

  if (fotoLista) {
    return <img src={FOTO_SRC} alt="Damián" className={`${className} object-cover`} />;
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Damián"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="avatar-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      {/* fondo */}
      <circle cx="60" cy="60" r="58" fill="var(--sun)" />
      <g clipPath="url(#avatar-clip)">
        {/* camiseta */}
        <path d="M18 128c0-24 18-38 42-38s42 14 42 38z" fill="var(--sky)" />
        <path d="M46 92l14 10 14-10-14 8z" fill="var(--sky-foreground)" opacity=".25" />
        {/* cuello */}
        <rect x="50" y="76" width="20" height="18" rx="8" fill="#F2B98F" />
        {/* cara */}
        <ellipse cx="60" cy="58" rx="27" ry="29" fill="#F8C9A3" />
        {/* orejas */}
        <circle cx="33" cy="60" r="5" fill="#F8C9A3" />
        <circle cx="87" cy="60" r="5" fill="#F8C9A3" />
        {/* pelo rizado castaño claro */}
        <g fill="#A9743E">
          <circle cx="40" cy="36" r="10" />
          <circle cx="50" cy="28" r="10" />
          <circle cx="61" cy="25" r="11" />
          <circle cx="72" cy="28" r="10" />
          <circle cx="81" cy="36" r="9" />
          <circle cx="34" cy="46" r="7" />
          <circle cx="86" cy="46" r="7" />
          <circle cx="45" cy="32" r="6" fill="#C08A50" />
          <circle cx="66" cy="27" r="5" fill="#C08A50" />
          <circle cx="78" cy="33" r="5" fill="#C08A50" />
        </g>
        {/* cejas */}
        <path
          d="M45 48q5-4 10 0"
          stroke="#8D5E2E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M65 48q5-4 10 0"
          stroke="#8D5E2E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* ojos sonrientes */}
        <circle cx="50" cy="56" r="3.2" fill="#3B2A20" />
        <circle cx="70" cy="56" r="3.2" fill="#3B2A20" />
        <circle cx="51" cy="55" r="1" fill="#fff" />
        <circle cx="71" cy="55" r="1" fill="#fff" />
        {/* mejillas */}
        <circle cx="42" cy="66" r="4.5" fill="var(--coral)" opacity=".45" />
        <circle cx="78" cy="66" r="4.5" fill="var(--coral)" opacity=".45" />
        {/* gran sonrisa */}
        <path d="M46 68q14 14 28 0z" fill="#3B2A20" />
        <path d="M49 69q11 8 22 0z" fill="#fff" />
        <path d="M51 74q9 6 18 0v2q-9 5-18 0z" fill="var(--coral)" opacity=".8" />
      </g>
    </svg>
  );
}
