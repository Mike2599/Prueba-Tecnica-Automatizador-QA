# Parte 3 - Propuesta de framework de automatización empresarial

Este repositorio es una versión reducida de la propuesta. La misma estructura escala a varios equipos y aplicaciones.

```
                 ┌────────────── Azure DevOps ──────────────┐
  Git (PR) ────► │ Build: npm ci → lint/tsc → tests → report │ ──► Test Plans / artefactos
                 └─────────────────────┬────────────────────┘
                                       ▼
   tests/ (specs por dominio y tags @smoke @regression @api)
        │ usan
        ▼
   fixtures/ (inyección de pages, sesión, clientes API, datos)
        │            │                     │
        ▼            ▼                     ▼
   pages/        api/ (clients,        data/ (builders,
   components/    schemas)               JSON por ambiente)
        │            │
        └──── config/ (ambientes + variables de entorno / Key Vault) ────┘
                                       ▼
                 reports/ (HTML, JUnit, trazas, capturas, video)
```

**1. Arquitectura y carpetas.** El proyecto está separado en capas: `tests` (qué se prueba), `pages` y `components` (cómo se interactúa con la UI), `api` (clientes de servicio y esquemas), `data`, `config`, `fixtures` y `utils`. Las pruebas no contienen selectores ni URLs.

**2. Patrón de diseño.**
- UI: **Page Object Model** con componentes reutilizables (menú, tablas, *toasts*) y **fixtures** de Playwright para inyectar dependencias.
- API: **Service Object** (`ReqresClient`), que centraliza headers, autenticación y medición de tiempos, junto con validación de contrato por esquema.
- Selectores en este orden de preferencia: `getByRole`, `getByLabel` o `getByPlaceholder`, luego `data-testid` (se acuerda con desarrollo) y al final CSS semántico. Nunca XPath absoluto.
- La prueba fuera de la UI, en móvil, se haría con el mismo patrón (Screen Objects con Appium).

**3. Datos de prueba.**
- Datos estáticos en `data/`, separados por ambiente.
- Datos dinámicos con *builders* o *factories*, con nombres únicos (timestamp o UUID) para que las pruebas sean independientes.
- Cuando se necesita estado, se crea y se limpia por API en *setup/teardown*, no por UI.
- Nunca se usan datos productivos reales.

**4. Configuración por ambientes.** `TEST_ENV=dev|qa|staging` selecciona las URLs en `config/environments.ts`. Los secretos solo llegan por variables de entorno: `.env` local (no se versiona) o *Variable Groups* y **Azure Key Vault** en el pipeline.

**5. Evidencias y reportes.**
- Reporte HTML de Playwright y JUnit XML, que se publica en la pestaña *Tests* de Azure DevOps.
- Captura en cada prueba. Video y *trace* solo cuando falla.
- Pasos con `test.step` para que el reporte sea legible por negocio.
- Opcionalmente, Allure o la integración con Azure Test Plans para trazar la prueba automatizada con el caso de prueba.

**6. Paralelismo y pruebas inestables.**
- Pruebas atómicas y sin orden (`fullyParallel`), cada una con su propio contexto de navegador. La sesión se puede reutilizar con `storageState`.
- Las ejecuciones se reparten en varios agentes con `--shard`.
- Las esperas se basan en condiciones (*auto-wait*, `expect` con reintentos, `waitForResponse`). No se usan `sleep`.
- En CI hay un solo reintento, y la prueba que pasa al reintentar se marca como **flaky** en el reporte.
- Las pruebas flaky se registran, se ponen en cuarentena con el tag `@quarantine` en un job aparte que no bloquea, y se les asigna un responsable para corregirlas. No se ocultan.

**7. Git y CI/CD (Azure DevOps).**
- Flujo con ramas `feature/*` y PR hacia `main`, con *branch policy* que exige que el pipeline pase.
- El pipeline tiene un smoke en cada PR (`@smoke` + API) y regresión completa nocturna programada o antes de un release.
- Etapas del pipeline: `npm ci`, instalación de navegadores, `tsc`, pruebas, publicación de JUnit y del artefacto HTML.
- Ver [`azure-pipelines.yml`](../azure-pipelines.yml).
