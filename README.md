# Prueba técnica - Automatizador QA

**Candidato:** Michael Garzón

Automatización web de OrangeHRM y prueba de API sobre ReqRes, hechas con **Playwright + TypeScript**.

## Entregables

| Parte | Ubicación |
|-------|-----------|
| 1 y 2. Casos de prueba y automatización web | Casos: [`docs/01-casos-de-prueba-web.pdf`](docs/01-casos-de-prueba-web.pdf) · Código: `pages/` y `tests/web/` |
| 3. Propuesta de framework | [`docs/04-propuesta-framework.pdf`](docs/04-propuesta-framework.pdf) y [`azure-pipelines.yml`](azure-pipelines.yml) |
| 4. Automatización de API | Casos: [`docs/02-casos-de-prueba-api.pdf`](docs/02-casos-de-prueba-api.pdf) · Código: `api/` y `tests/api/` |
| 5. Registro de defecto | [`docs/06-registro-defecto.pdf`](docs/06-registro-defecto.pdf) |
| Informe de ejecución | [`docs/05-informe-ejecucion.pdf`](docs/05-informe-ejecucion.pdf) y `docs/evidencias/` |

## Prerrequisitos

- Node.js 18 o superior (probado con 20.20.2) y npm.
- Git.
- Conexión a internet.

Dependencias: `@playwright/test` 1.63.0, `typescript` 5.9.3, `dotenv` 16.6.1 y `@types/node` 20. Las versiones exactas quedan fijas en `package-lock.json`.

## Instalación

```bash
git clone https://github.com/Mike2599/Prueba-Tecnica-Automatizador-QA.git
cd Prueba-Tecnica-Automatizador-QA
npm ci
npx playwright install chromium
```

## Configuración

La suite funciona sin configurar nada. Para cambiar algún valor, copia `.env.example` como `.env`. Ese archivo no se sube al repositorio.

| Variable | Por defecto | Para qué sirve |
|----------|-------------|----------------|
| `TEST_ENV` | `qa` | Ambiente a usar (`config/environments.ts`) |
| `ORANGE_USER` / `ORANGE_PASSWORD` | `Admin` / `admin123` | Credenciales públicas del demo |
| `REQRES_API_KEY` | vacía | Solo se necesita si ReqRes exige API key |
| `API_MAX_RESPONSE_MS` | `2000` | Umbral de tiempo de respuesta de la API |
| `HEADLESS` | `true` | Con `false` se ve el navegador |

## Ejecución

```bash
npm test               # web + API en un solo comando
npm run test:web       # solo web
npm run test:api       # solo API
npm run test:headed    # web con el navegador visible
```

## Reportes

```bash
npm run report
```

Al ejecutar se generan estos archivos:

- `reports/html/`: reporte HTML con los pasos y una captura de cada prueba.
- `reports/junit.xml`: resultados para CI.
- `reports/results/`: capturas. Si una prueba falla, también quedan el video y el trace, que se abre con `npx playwright show-trace <ruta>/trace.zip`.

Los reportes no se versionan. El resultado de mi ejecución, con las capturas de cada caso, está en [`docs/05-informe-ejecucion.pdf`](docs/05-informe-ejecucion.pdf).

La suite también corre en **GitHub Actions** con cada push a `main`. El resultado se ve en la pestaña *Actions* del repositorio, y el reporte HTML queda como archivo descargable del run.

## Decisiones técnicas

- **Playwright.** Con una sola herramienta cubro web y API. Además trae esperas automáticas, reporte HTML y video y trace ante fallas.
- **Page Object Model con fixtures.** Las pruebas no tienen selectores. Cada prueba inicia su propia sesión, así que se pueden correr en cualquier orden y en paralelo.
- **Selectores estables.** Uso rol, placeholder y etiqueta visible. No uso XPath.
- **Sin pausas fijas.** Las validaciones reintentan hasta que se cumple la condición. En la búsqueda de PIM, la prueba espera la respuesta real del servidor.
- **Búsqueda sin resultados.** El nombre buscado es único en cada ejecución (`QA-NoExiste-<timestamp>`), así que nunca va a existir. Valido que el servidor devuelva 0 registros y que la pantalla muestre "No Records Found" con la tabla vacía.
- **API.** Valido el código de estado, la estructura, el id, nombre y correo, los headers (`content-type` y de seguridad) y el tiempo de respuesta.
- **Umbral de 2000 ms.** ReqRes respondió entre 430 y 600 ms en mis ejecuciones. Es un servicio público y la latencia de red varía. 2 s deja margen sin ocultar una degradación real. En una API interna usaría el SLA del servicio.

## Supuestos y limitaciones

- `Admin/admin123` son credenciales públicas del demo, no secretos. Aun así se leen de variables de entorno.
- ReqRes respondió sin API key cuando ejecuté las pruebas. Si en algún momento la exige, se define `REQRES_API_KEY` y la prueba falla con un mensaje que lo indica.
- OrangeHRM es un demo compartido que se reinicia y puede ir lento. Algunas imágenes y scripts externos del demo a veces no terminan de cargar, así que la navegación no espera la carga completa sino los elementos que usa cada prueba. En CI hay un reintento, y si una prueba pasa al reintentar el reporte la marca como flaky.
- La Parte 1 no tiene una aplicación real. Los supuestos de esos casos están en el mismo documento.
- El pipeline de Azure DevOps es una referencia. Para usarlo hay que crear el Variable Group con los secretos.

## Uso de IA

Usé Claude Code como apoyo para redactar la documentación. 