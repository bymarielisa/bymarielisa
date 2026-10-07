// Protege todo el sitio con una contraseña compartida (HTTP Basic Auth), aplicada en el
// borde de la red antes de que llegue ninguna petición a la app. Así ningún dato de Damián
// (horario, fotos, custodia, etc.) sale del servidor sin la contraseña correcta.
//
// La contraseña vive en la variable de entorno APP_PASSWORD de Netlify (no en el código).
// El usuario del diálogo de login no importa, solo la contraseña.
declare const Netlify: { env: { get(key: string): string | undefined } };

export default async (request: Request) => {
  // Netlify.env es la forma documentada de leer variables de entorno en Edge Functions;
  // Deno.env.get no las ve ahí (son runtimes aislados distintos).
  const clave = Netlify.env.get("APP_PASSWORD");
  if (!clave) {
    // Si no hay contraseña configurada, dejamos pasar para no bloquear el sitio por error.
    return;
  }

  const auth = request.headers.get("authorization") ?? "";
  const esperado = `Basic ${btoa(`familia:${clave}`)}`;

  if (auth !== esperado) {
    return new Response("Autenticación requerida", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="DamianFG", charset="UTF-8"',
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  // Credenciales correctas: dejamos que la petición siga hacia la app.
};

export const config = { path: "/*" };
