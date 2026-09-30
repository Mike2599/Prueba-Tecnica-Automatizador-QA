# Informe de ejecución

| Ítem | Valor |
|------|-------|
| Fecha | 2026-09-30 |
| Comando | `npm test` (proyectos `web-chromium` + `api`) |
| Ambiente | `TEST_ENV=qa`: OrangeHRM demo público y ReqRes |
| Herramienta | Playwright 1.63.0 + TypeScript 5.9 sobre Node 20.20 |
| Resultado | **4/4 aprobadas** (0 fallidas, 0 flaky) · duración de ~9 a 16 s con 4 workers |

## Resultados por caso

| ID | Caso | Proyecto | Resultado | Validaciones clave |
|----|------|----------|-----------|--------------------|
| WEB-01 | Login exitoso muestra el Dashboard | web-chromium | ✅ Aprobado | URL `/dashboard/index`, login oculto, usuario autenticado visible, título "Dashboard" y widgets visibles |
| WEB-02 | Búsqueda de empleado inexistente en PIM | web-chromium | ✅ Aprobado | API de búsqueda con `200` y `meta.total = 0`, *toast* "No Records Found", etiqueta "No Records Found" y 0 filas |
| API-01 | GET `/api/users/2` | api | ✅ Aprobado | 200, estructura, id/nombre/correo, `content-type`, headers de seguridad, **521 ms < 2000 ms** |
| API-02 | GET `/api/users/23` (negativo) | api | ✅ Aprobado | 404 con cuerpo `{}` |

## Pruebas de estabilidad
- `--repeat-each=3` en web-chromium: **6/6** aprobadas, sin fallas intermitentes.
- Navegador adicional `web-firefox`: **2/2** aprobadas.
- Falla provocada a propósito (`ORANGE_PASSWORD=claveErrada`): la prueba falla con un mensaje claro y genera **captura, video y trace**. Ver `evidencias/ejemplo-falla-login-clave-errada.png`.

## Evidencias
- `evidencias/WEB-01-dashboard.png`
- `evidencias/WEB-02-pim-sin-resultados.png`
- `evidencias/ejemplo-falla-login-clave-errada.png`
- Reporte HTML completo con pasos, capturas y adjuntos: `reports/html/index.html` (se genera al ejecutar).
- JUnit: `reports/junit.xml`.

## Observaciones
- OrangeHRM es un demo público compartido. Sus datos cambian y a veces responde lento. Por eso el nombre buscado es único en cada ejecución y las esperas se sincronizan con la respuesta real del backend.
- ReqRes respondió **200 sin API key** en la fecha de ejecución. El cliente soporta `x-api-key` opcional por variable de entorno por si el servicio vuelve a exigirla.
