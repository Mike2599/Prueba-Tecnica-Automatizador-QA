# Parte 1 - Diseño de casos de prueba: Autenticación

## Reglas de negocio (base de trazabilidad)

| ID  | Regla |
|-----|-------|
| R1  | El usuario es obligatorio. |
| R2  | La contraseña es obligatoria. |
| R3  | El usuario debe tener formato de correo electrónico. |
| R4  | La contraseña debe contener mínimo 8 caracteres. |
| R5  | Después de tres intentos fallidos, la cuenta se bloquea. |
| R6  | Cuando el ingreso es exitoso, el sistema muestra el mensaje "Bienvenido al sistema". |

## Supuestos

1. Existe una cuenta activa `qa.activo@empresa.com` con contraseña `Clave2026*` (10 caracteres) y otra con contraseña de exactamente 8 caracteres, `qa.ocho@empresa.com` / `Clave26*`.
2. Un **intento fallido** es un envío con formato válido y credenciales incorrectas. Los errores de validación de formato (campo vacío, correo inválido, contraseña < 8) se rechazan antes de autenticar y **no suman** al contador de bloqueo. Esto se valida explícitamente en CP-19 y hay que confirmarlo con negocio.
3. Los intentos fallidos se cuentan **consecutivamente por cuenta**, y el contador se reinicia con un ingreso exitoso.
4. Por seguridad, el mensaje de credenciales inválidas es genérico y no revela si el usuario existe.
5. La regla no define un máximo de caracteres para la contraseña. Se prueba el límite inferior (7/8/9) y un valor largo razonable.
6. Los textos exactos de los mensajes de error no están definidos. Se indican como mensajes de referencia que hay que confirmar con el equipo.

## Criterio de priorización basada en riesgo

Prioridad = **impacto** (seguridad, acceso de usuarios legítimos) × **probabilidad** de falla.

| Prioridad | Criterio |
|-----------|----------|
| **Crítica** | Un fallo compromete la seguridad (acceso indebido, fuerza bruta) o impide ingresar a todos los usuarios. |
| **Alta** | Flujo principal o regla de negocio explícita, con impacto directo en el usuario. |
| **Media** | Variante de regla o frontera secundaria con impacto moderado. |
| **Baja** | Caso cosmético o de usabilidad con bajo impacto. |

## Matriz de casos de prueba

| ID | Tipo | Escenario | Datos | Resultado esperado | Regla | Prioridad |
|----|------|-----------|-------|--------------------|-------|-----------|
| CP-01 | Positivo | Ingreso exitoso con credenciales válidas | Usuario: `qa.activo@empresa.com` · Clave: `Clave2026*` | Ingresa al sistema y ve el mensaje exacto **"Bienvenido al sistema"**. El contador de intentos queda en 0. | R6 | Crítica |
| CP-02 | Frontera | Contraseña con **exactamente 8** caracteres (límite válido) | `qa.ocho@empresa.com` · `Clave26*` (8) | Ingreso exitoso y mensaje "Bienvenido al sistema". | R4, R6 | Alta |
| CP-03 | Frontera | Contraseña con **9** caracteres (límite + 1) | Cuenta con clave `Clave26*A` (9) | Ingreso exitoso. | R4 | Media |
| CP-04 | Frontera / Negativo | Contraseña con **7** caracteres (límite − 1) | `qa.activo@empresa.com` · `Clave2*` (7) | No autentica. Muestra "La contraseña debe tener mínimo 8 caracteres". No suma intento fallido. | R4 | Alta |
| CP-05 | Negativo | Usuario vacío | Usuario: *(vacío)* · `Clave2026*` | No autentica. Muestra "El usuario es obligatorio" en el campo usuario. | R1 | Alta |
| CP-06 | Negativo | Contraseña vacía | `qa.activo@empresa.com` · *(vacío)* | No autentica. Muestra "La contraseña es obligatoria". | R2 | Alta |
| CP-07 | Negativo | Usuario y contraseña vacíos | *(vacío)* · *(vacío)* | Muestra las dos validaciones de obligatoriedad al mismo tiempo y no envía la solicitud. | R1, R2 | Media |
| CP-08 | Negativo | Usuario con solo espacios | `"   "` · `Clave2026*` | Se trata como vacío: "El usuario es obligatorio". | R1 | Media |
| CP-09 | Negativo | Usuario sin `@` | `qa.activoempresa.com` · `Clave2026*` | Muestra "Ingrese un correo electrónico válido". No autentica. | R3 | Alta |
| CP-10 | Negativo | Usuario sin dominio | `qa.activo@` · `Clave2026*` | Mensaje de formato de correo inválido. | R3 | Media |
| CP-11 | Negativo | Usuario sin parte local | `@empresa.com` · `Clave2026*` | Mensaje de formato de correo inválido. | R3 | Media |
| CP-12 | Negativo | Usuario con espacio interno | `qa activo@empresa.com` · `Clave2026*` | Mensaje de formato de correo inválido. | R3 | Baja |
| CP-13 | Negativo | Contraseña incorrecta (1.er intento) | `qa.activo@empresa.com` · `Incorrecta1` | Muestra un mensaje genérico, "Usuario o contraseña inválidos". Contador en 1. La cuenta sigue activa. | R5 | Alta |
| CP-14 | Negativo / Seguridad | Usuario no registrado con formato válido | `no.existe@empresa.com` · `Clave2026*` | Muestra el mismo mensaje genérico que CP-13, sin revelar que el usuario no existe. | R3, R5 | Alta |
| CP-15 | Frontera (bloqueo) | **2** intentos fallidos y luego ingreso correcto | 2 × `Incorrecta1` y después `Clave2026*` | El 3.er intento, que es correcto, ingresa porque no se alcanzó el límite. Muestra "Bienvenido al sistema" y el contador vuelve a 0. | R5, R6 | Alta |
| CP-16 | Bloqueo | **3** intentos fallidos consecutivos | 3 × `Incorrecta1` | Al 3.er fallo la cuenta queda **bloqueada** y se muestra "Cuenta bloqueada...". Queda registro del evento. | R5 | Crítica |
| CP-17 | Bloqueo / Seguridad | Ingreso con credenciales **correctas** sobre cuenta bloqueada | Cuenta de CP-16 · `Clave2026*` | **No** permite el ingreso y sigue mostrando el mensaje de cuenta bloqueada. No aparece "Bienvenido al sistema". | R5 | Crítica |
| CP-18 | Bloqueo | El contador se reinicia tras un ingreso exitoso | 2 fallos → éxito → logout → 2 fallos | La cuenta **no** se bloquea, porque los fallos no son consecutivos. | R5 | Media |
| CP-19 | Bloqueo (supuesto 2) | Errores de formato no suman al bloqueo | 3 × clave de 7 caracteres y luego `Clave2026*` | Se muestra 3 veces la validación de longitud. Después el ingreso es exitoso y la cuenta no se bloquea. | R4, R5 | Media |
| CP-20 | Bloqueo | El bloqueo aplica solo a la cuenta afectada | Cuenta A bloqueada · Cuenta B válida | La cuenta B ingresa normalmente. | R5 | Media |
| CP-21 | Negativo | La contraseña distingue mayúsculas y minúsculas | `qa.activo@empresa.com` · `clave2026*` | Credenciales inválidas y el contador suma 1. | R5 | Media |
| CP-22 | Positivo | Usuario con mayúsculas (correo *case-insensitive*) | `QA.Activo@Empresa.com` · `Clave2026*` | Ingreso exitoso, porque el correo no distingue mayúsculas (hay que confirmarlo con negocio). | R3, R6 | Baja |
| CP-23 | Seguridad | Inyección en el campo usuario | `' OR '1'='1'--@x.com` · `Clave2026*` | Se rechaza por formato o credenciales inválidas, sin error del servidor y sin acceso. | R3 | Alta |
| CP-24 | Frontera | Contraseña larga | Clave de 64 caracteres válida registrada | Ingreso exitoso sin truncar la contraseña. | R4 | Baja |

## Trazabilidad regla → casos

| Regla | Casos | Cobertura |
|-------|-------|-----------|
| R1 Usuario obligatorio | CP-05, CP-07, CP-08 | Vacío, vacío + otro campo, solo espacios |
| R2 Contraseña obligatoria | CP-06, CP-07 | Vacío, ambos vacíos |
| R3 Formato de correo | CP-09 a CP-12, CP-14, CP-22, CP-23 | Particiones inválidas y válida, seguridad |
| R4 Mínimo 8 caracteres | CP-02, CP-03, CP-04, CP-19, CP-24 | Análisis de valores límite: 7 / 8 / 9 y valor largo |
| R5 Bloqueo a 3 intentos | CP-13, CP-15 a CP-21 | Límite 2 / 3, bloqueo con clave correcta, reinicio, alcance |
| R6 Mensaje de bienvenida | CP-01, CP-02, CP-15, CP-22 | Texto exacto en cada ingreso exitoso |

**Resumen:** 24 casos, clasificados así:

- 5 de ingreso exitoso esperado.
- 13 negativos de validación, credenciales o seguridad.
- 6 del ciclo de bloqueo (CP-15 a CP-20).

Entre ellos hay 6 casos de frontera: CP-02, CP-03, CP-04, CP-15, CP-16 y CP-24. Por prioridad: 3 Crítica, 9 Alta, 9 Media y 3 Baja.

**Técnicas aplicadas:** partición de equivalencia (formatos de correo), análisis de valores límite (longitud 7/8/9 e intentos 2/3), transición de estados (Activa → Bloqueada) y pruebas negativas de seguridad.

**Candidatos a automatizar primero (smoke):** CP-01, CP-04, CP-13, CP-16 y CP-17.
