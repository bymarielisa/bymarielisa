// Service worker mínimo: no cachea nada (la app se actualiza seguido vía Netlify),
// solo existe para que el navegador pueda "Añadir a pantalla de inicio" como una app.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Deliberadamente vacío: cada petición va siempre a la red.
});
