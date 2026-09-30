# Prueba técnica - Automatizador QA

Solución con **Playwright + TypeScript**:

- Automatización web de OrangeHRM con Page Object Model.
- Pruebas de API sobre ReqRes.
- Diseño de casos de prueba, propuesta de framework, registro de defecto y pipeline de Azure DevOps.

**Candidato:** Michael Garzón · **Fecha:** 2026-09-30

## Contenido de la entrega

| Parte | Entregable | Ubicación |
|-------|------------|-----------|
| 1 - Diseño de casos (20) | Matriz de 24 casos con trazabilidad y prioridad por riesgo | [`docs/01-casos-de-prueba.md`](docs/01-casos-de-prueba.md) · versión Excel: [`docs/01-casos-de-prueba.xlsx`](docs/01-casos-de-prueba.xlsx) |
| 2 - Automatización web (40) | Escenarios A y B | `pages/`, `tests/web/`, `tests/fixtures.ts` |
| 3 - Framework (15) | Propuesta con diagrama + pipeline | [`docs/02-propuesta-framework.md`](docs/02-propuesta-framework.md), [`azure-pipelines.yml`](azure-pipelines.yml) |
| 4 - API (15) | GET `/api/users/2` + caso negativo | `api/`, `tests/api/` |
| 5 - Defecto (10) | BUG-001 | [`docs/03-registro-defecto.md`](docs/03-registro-defecto.md) |
| Informe | Resultados y evidencias | [`docs/04-informe-ejecucion.md`](docs/04-informe-ejecucion.md), `docs/evidencias/` |

## Estructura

```
├── api/                 # Service Object (ReqresClient) y validación de estructura
├── config/              # Configuración por ambiente (TEST_ENV) + variables de entorno
├── data/                # Datos de prueba centralizados
├── docs/                # Partes 1, 3 y 5, informe y evidencias
├── pages/               # Page Objects: BasePage, LoginPage, DashboardPage, PimPage
├── reports/             # Salida: html/, junit.xml, results/ (capturas, video, trace)
├── tests/
│   ├── fixtures.ts      # Inyección de Page Objects + fixture de sesión "loggedIn"
│   ├── web/             # login.spec.ts (Escenario A), pim-search.spec.ts (Escenario B)
│   └── api/             # users.spec.ts
├── playwright.config.ts
├── azure-pipelines.yml
└── .env.example
```

## Prerrequisitos

| Herramienta | Versión usada | Mínimo |
|-------------|---------------|--------|
| Node.js | 20.20.2 | 18+ |
| npm | 10.8.2 | 9+ |
| Git | 2.x | — |
| Acceso a internet | OrangeHRM demo y reqres.in | — |

Dependencias exactas en `package.json` y `package-lock.json`:

- `@playwright/test` 1.63.0
- `typescript` 5.9.3
- `dotenv` 16.6.1
- `@types/node` 20.x

## Instalación

```bash
git clone <url-del-repositorio>
cd automatizador-qa-playwright
npm ci                              # instala dependencias exactas del lock
npx playwright install chromium     # navegador (agregar firefox si se usará)
```

En Linux o en un agente de CI, usar `npx playwright install --with-deps chromium`.

## Configuración (opcional)

Copiar `.env.example` como `.env`:

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

| Variable | Default | Uso |
|----------|---------|-----|
| `TEST_ENV` | `qa` | Ambiente (`qa`, `staging`), definido en `config/environments.ts` |
| `ORANGE_USER` / `ORANGE_PASSWORD` | `Admin` / `admin123` | Credenciales del demo (ver supuestos) |
| `REQRES_API_KEY` | *(vacía)* | Se envía como `x-api-key` solo si tiene valor |
| `API_MAX_RESPONSE_MS` | `2000` | Umbral de tiempo de la API |
| `HEADLESS` | `true` | `false` para ver el navegador |

Sin `.env` la suite funciona con los valores por defecto.

## Ejecución

| Comando | Qué ejecuta |
|---------|-------------|
| `npm test` | **Web (Chromium) + API**: la suite completa en un solo comando |
| `npm run test:web` | Solo web |
| `npm run test:api` | Solo API, de forma independiente |
| `npm run test:headed` | Web con el navegador visible |
| `npm run test:firefox` | Web en Firefox |
| `npx playwright test --grep @smoke` | Filtrar por tag (`@smoke`, `@regression`, `@api`, `@web`) |
| `npm run typecheck` | Validación estática de TypeScript |

## Reportes y evidencias

| Salida | Ubicación | Cómo verla |
|--------|-----------|------------|
| Reporte HTML (pasos, capturas, adjuntos, tiempos) | `reports/html/index.html` | `npm run report` |
| JUnit XML (para Azure DevOps o Jenkins) | `reports/junit.xml` | Se publica en el pipeline |
| Captura de cada prueba | `reports/results/` | También dentro del HTML |
| Video y **trace** si la prueba falla | `reports/results/` | `npx playwright show-trace <ruta>/trace.zip` |

## Decisiones técnicas

- **Playwright + TypeScript.** Una sola herramienta cubre web y API, tiene auto-wait, genera reporte HTML, trace y video nativos, y ejecuta todo con un comando.
- **Page Object Model + fixtures.** Las pruebas no tienen selectores. La fixture `loggedIn` hace login en cada prueba, así que ninguna depende del orden (`fullyParallel: true`).
- **Selectores estables.** Se usan `getByRole` y `getByPlaceholder`. El campo *Employee Name* se ubica por su **etiqueta visible**, no por posición. Sin XPath.
- **Sincronización inteligente.** No hay `waitForTimeout`. Se usan aserciones web-first con reintento y `waitForResponse` sobre la API de búsqueda de PIM.
- **Validación en dos capas (Escenario B).** El backend responde `total = 0` y la UI muestra el *toast* y la etiqueta "No Records Found", con 0 filas en la tabla.
- **Datos únicos.** El empleado inexistente es `QA-NoExiste-<timestamp>`. Así la prueba sigue siendo válida aunque otros usuarios del demo creen empleados, y es repetible.
- **API.** El `ReqresClient` (Service Object) mide el tiempo con `performance.now()` y adjunta el body al reporte. Se validan estos headers:
  - `content-type: application/json; charset=utf-8`, que confirma el contrato.
  - `x-content-type-options: nosniff` y `strict-transport-security`, que son headers de seguridad.
- **Reintentos solo en CI (1).** En local una falla se ve de inmediato. En CI, una prueba que pasa al reintentar queda marcada como *flaky* en el reporte.

### Umbral de tiempo de respuesta de la API: 2000 ms

- En ejecuciones repetidas, ReqRes respondió entre **~430 y 600 ms**. Es un servicio público detrás de Cloudflare y Heroku, con latencia de red variable desde Colombia.
- 2 s es cerca de 3 a 4 veces el valor observado. Da margen ante la variabilidad de red sin ocultar una degradación real.
- Para una API interna el umbral sería más estricto, basado en el SLA (p. ej. p95 < 500 ms).
- El umbral se puede cambiar con `API_MAX_RESPONSE_MS`.

## Supuestos y limitaciones

- **Credenciales.** `Admin/admin123` son públicas y aparecen en la pantalla de login del demo y en el enunciado. No son secretos reales. Aun así, se leen de variables de entorno, así que en un proyecto real vendrían del *Variable Group* o de Key Vault.
- **Autenticación de ReqRes.** El enunciado advierte que podría exigir autenticación. En la fecha de ejecución `GET /api/users/2` respondió **200 sin API key**.
  - Decisión: soportar `REQRES_API_KEY` opcional, que se envía como `x-api-key`, sin versionarla.
  - Si el servicio responde 401 o 403, la prueba falla con un mensaje que explica cómo configurarla.
- **Demo compartido.** OrangeHRM se reinicia y lo modifican terceros. Puede haber lentitud o caídas ajenas a la solución, y los timeouts están ajustados para eso. El usuario que aparece en el menú de perfil cambia, por eso no se valida su nombre.
- **Parte 1.** No existe una aplicación real para la autenticación descrita. Los casos son de diseño y sus supuestos (qué cuenta como intento fallido, textos de mensajes) están documentados en el mismo archivo.
- **Pipeline.** `azure-pipelines.yml` es una referencia funcional. Requiere crear el Variable Group `qa-automation-secrets` en Azure DevOps.

## Uso de IA

Para agilizar la construcción, la solución se desarrolló con apoyo de un asistente de IA (Claude Code). Ese apoyo incluyó el andamiaje del proyecto, la redacción de la documentación y la exploración de selectores. El candidato revisó el diseño, las decisiones técnicas y los resultados, ejecutó la suite y la validó.
