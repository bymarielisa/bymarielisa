/**
 * Protege toda la app con una sola contraseña compartida (APP_PASSWORD), usando una
 * cookie de sesión firmada con HMAC (SESSION_SECRET) — ambas son variables de entorno
 * de Netlify, nunca están en el código. La verificación corre en el servidor (la misma
 * función de Netlify que ya usan recordatorios/custodia/gastos), así que ningún dato
 * sale sin la cookie válida.
 */
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "damianfg_auth";
const VALOR_SESION = "ok";
const UN_DIA = 60 * 60 * 24;

function firmar(secreto: string): string {
  return createHmac("sha256", secreto).update(VALOR_SESION).digest("hex");
}

function cookiesIguales(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export const verificarSesion = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ autenticado: boolean }> => {
    const secreto = process.env["SESSION_SECRET"];
    const cookie = getCookie(COOKIE_NAME);
    if (!secreto || !cookie) return { autenticado: false };
    return { autenticado: cookiesIguales(cookie, firmar(secreto)) };
  },
);

export const iniciarSesion = createServerFn({ method: "POST" })
  .validator((data: { clave: string }) => data)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const claveReal = process.env["APP_PASSWORD"];
    const secreto = process.env["SESSION_SECRET"];
    if (!claveReal || !secreto || data.clave !== claveReal) {
      return { ok: false };
    }
    setCookie(COOKIE_NAME, firmar(secreto), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: UN_DIA,
    });
    return { ok: true };
  });

export const cerrarSesion = createServerFn({ method: "POST" }).handler(async (): Promise<void> => {
  deleteCookie(COOKIE_NAME, { path: "/" });
});
