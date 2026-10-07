# Damián's Day Planner

Quiero construir "DamiánFG": una app web personal familiar de horario, presupuesto, calendario y custodia de mi hijo Damián, de 3 años, alumno de Educación Infantil (4 años A) en el CEIP María de Villota, Madrid (colegio bilingüe). Su tutora es Sara; la profesora de inglés es Pilar Vera ("Miss Pilar"). Mobile-first, responsive.

Ya existe un prototipo funcional en HTML/CSS/JS vanilla (sin frameworks) que implementa toda la lógica; quiero que reconstruyas la misma app con tu stack nativo (React + TypeScript + Tailwind + shadcn/ui), manteniendo exactamente los mismos datos y reglas de cálculo.

## Estructura general
Bottom nav fija con 4 pestañas: Horario, Gastos, Calendario, Custodia.

## Diseño / estilo
- Estética pensada para un niño de 3 años: alegre, cálida, nada corporativa.
- Paleta: azul cielo #6EC6FF, amarillo sol #FFD166, coral #FF6B6B, verde hoja #06D6A0, lila #B98CE0, fondo crema #FFFDF7.
- Tipografía: Google Fonts "Baloo 2" (títulos) + "Nunito" (texto).
- Cabecera con avatar SVG (dibujado, no foto) de un niño de pelo castaño claro y rizado, muy sonriente, estilo flat/cartoon. Saludo dinámico: "¡Hola! Hoy es [día], [fecha]".
- Esquinas redondeadas, botones grandes touch-friendly.
- Soporta modo oscuro con los mismos acentos sobre fondo oscuro.
- Todo el texto en español de España.

## Sección 1: Horario
Tarjeta "Ahora mismo" arriba: calcula con la hora real del dispositivo en qué momento del día está Damián (antes de entrar / acogida / clase / recreo con la merienda de hoy / comedor / recogida / extraescolar / camino a natación / natación / ya salió), usando este horario:

- Octubre a mayo: entrada 8:55, acogida hasta 9:05, clases 9:30–11:15, recreo 11:15–11:45, clases 11:45–14:00, comedor 14:05–14:40, juegos hasta la salida general 15:45, recogida, extraescolar 16:00–17:00, salida del cole 17:00.
- Septiembre y junio: mismo esquema pero con la tarde adelantada ~1h: clases 11:45–13:00, comedor 13:05–13:40, y luego "tardes de cole" hasta las 17:00 (si hay extraescolar ese día, ocupa el tramo 16:00–17:00 dentro de esas tardes de cole). Las extraescolares regulares (robótica, inglés, minichef) y la natación de miércoles NO aplican en septiembre, empiezan en octubre. En junio sí aplican con normalidad.
- Miércoles añade (cuando aplican extraescolares): 17:00–17:30 camino a natación, 17:30–18:00 Natación en el polideportivo (fuera del cole, aparte de la extraescolar de robótica de las 16:00).
- Fin de semana: mensaje "Hoy no hay cole".

Debajo, una lista semanal (Lunes a Viernes) donde cada día se expande (acordeón, hoy abierto por defecto) mostrando la línea de tiempo completa con horas según las reglas de arriba: Entrada/acogida, Clases, Recreo + merienda del día, Clases, Comedor, Juegos (o Tardes de cole en sept/junio), Extraescolar, Salida (17:00), y en miércoles el bloque extra de Natación 17:30–18:00.

Datos por día:
- Lunes: extraescolar Robótica — merienda: fruta
- Martes: extraescolar Inglés — merienda: lácteos/cereales
- Miércoles: extraescolar Robótica (16:00–17:00) + Natación aparte (17:30–18:00, polideportivo) — merienda: fruta
- Jueves: extraescolar Inglés — merienda: bocadillo/sándwich
- Viernes: extraescolar Minichef — merienda: libre

No incluyas una tarjeta de notas genéricas de horario aparte — toda esa info va dentro del acordeón de cada día.

## Sección 2: Gastos (presupuesto)
Array de meses fácil de extender. El primer concepto de cada mes es siempre "Comedor María de Villota". Importes en euros:

- Septiembre 2026: Comedor 54 + Alventus tardes de cole 58 + Cooperativa 60 + AFA 30 + Material aula 7,20 + Natación 8,90 → Total 218,10 → 109,05 c/u
- Octubre 2026: Comedor 63 + Inglés 38 + Robótica 40,50 + Minichef 19 + Material anual 16,50 + Natación 8,90 → Total 185,90 → 92,95 c/u
- Noviembre 2026: Comedor 57 + Inglés 38 + Robótica 40,50 + Minichef 19 + Natación 8,90 → Total 163,40 → 81,70 c/u
- Diciembre 2026: Comedor 42 + Inglés 38 + Robótica 40,50 + Minichef 19 + Natación 8,90 → Total 148,40 → 74,20 c/u
- Enero 2027: Comedor 45 + Inglés 38 + Robótica 40,50 + Minichef 19 + Natación 8,90 → Total 151,40 → 75,70 c/u
- Febrero 2027: Comedor 54 + Inglés 38 + Robótica 40,50 + Minichef 19 + Natación 8,90 → Total 160,40 → 80,20 c/u

Tarjeta resumen arriba con total acumulado del curso y media mensual. Cada mes es una tarjeta expandible con el desglose, el total, y "a pagar cada uno" (total ÷ 2) etiquetado "Papá" / "Mamá".

## Sección 3: Calendario
Tres bloques, en este orden:

1. Recordatorios (actividades del cole, no festivos), agrupados por mes:
   - Octubre 2026: Halloween — 30 oct (actividad de centro); Visita al parque, todo Infantil — finales de oct, fecha por confirmar
   - Noviembre 2026: Salida al Planetario — fecha por confirmar
   - Diciembre 2026: Festival de Invierno (con familias) — 17–18 dic

2. Cumpleaños cerca: solo se muestra esta tarjeta si hay algún cumpleaños dentro de los próximos 14 días (calcula la próxima ocurrencia anual de cada fecha); si no hay ninguno cerca, la tarjeta no se muestra. Cuando se muestra, cada entrada dice "Hoy" / "Mañana" / "en X días". Lista completa de cumpleaños (día/mes, sin año — calcula el año próximo dinámicamente):
   - Gonzalo, 18 mar (amigo)
   - Adrián, 28 abr (amigo)
   - Victoria, 6 may (amigo)
   - Rodrigo, 8 jul (amigo)
   - Daniela, 15 ago (amigo)
   - Lola, 4 oct (amigo)
   - Damián, 21 oct (tipo especial — es el hijo, usar 🎂 y color propio)
   - Mamá, 2 dic (familia)
   - Claudia, 16 dic (familia)
   - Papá, 19 dic (familia)
   Colores: Damián = degradado amarillo sol → coral; familia = verde hoja; amigos = lila.

3. Días no lectivos: mini-calendario mensual navegable (mes anterior/siguiente, abre por defecto en el mes actual), con estos días festivos/no lectivos del curso 2026-2027 resaltados en coral (se irán añadiendo más con el tiempo):
   - 12 de octubre de 2026 — Fiesta Nacional
   - 2 de noviembre de 2026 — Todos los Santos
   - 9 de noviembre de 2026 — La Almudena
   - 7 de diciembre de 2026 — Día de la Constitución
   - 8 de diciembre de 2026 — Inmaculada Concepción
   - 23 de diciembre de 2026 — Comienzan las vacaciones de Navidad
   El mismo mini-calendario también marca los cumpleaños de arriba con su color (al navegar al mes correspondiente), y marca "hoy" con un borde/indicador distinto que no se confunda con un festivo. Debajo del grid, lista con el nombre de cada festivo.

   IMPORTANTE — bug a evitar: al comparar la fecha de una celda del calendario contra las fechas de festivos/cumpleaños, NO conviertas a UTC (por ejemplo con toISOString, que desplaza el día según la zona horaria de Madrid). Compara siempre por año/mes/día en hora local.

## Sección 4: Custodia
Regla fija recurrente cada mes (fuera de periodos de vacaciones escolares, sin regla especial definida todavía para esos periodos):
- Del día 1 (tarde) al día 16 (mañana) → con Papá
- Del día 16 (tarde) al día 1 del mes siguiente (mañana) → con Mamá
- El umbral mañana/tarde para los días de cambio (1 y 16) es a las 14:00 (después del comedor).
- Cambios en el colegio, de lunes a viernes. Si el día 1 o el 16 cae en fin de semana, la hora de entrega varía — mostrar nota "⚠ Cambio en fin de semana, hora variable" en vez de una hora fija.

Tarjeta arriba: "Hoy Damián está con [Papá/Mamá]" (calculado con la fecha real del dispositivo) + "Próximo cambio: [fecha]". Debajo, calendario mensual navegable coloreado por quién lo tiene (azul cielo #6EC6FF para Papá, coral #FF6B6B para Mamá), y los días 1 y 16 mostrados como "día partido" (mitad de cada color, con el orden correcto según quién tiene la mañana y quién la tarde ese día) ya que el cambio ocurre a media jornada.

## Consideraciones técnicas
- Sin autenticación ni backend por ahora: datos estáticos definidos en el código (arrays fáciles de ampliar con comentarios indicando dónde añadir el siguiente mes/festivo/cumpleaños/recordatorio).
- Todos los cálculos de fecha deben usar la hora/zona local del dispositivo, nunca UTC.
- Diseño mobile-first pero que se vea bien también en pantallas de escritorio (centrado, ancho máximo razonable).

Empieza construyendo la estructura completa con las 4 secciones y su navegación inferior, con datos de ejemplo reales (los de arriba), antes de refinar detalles visuales.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b32c1e56-c658-4ae0-b677-5b2cf327f859).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
