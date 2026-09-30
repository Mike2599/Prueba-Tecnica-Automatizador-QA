# Parte 5 - Registro de defecto

| Campo | Detalle |
|-------|---------|
| **ID** | BUG-001 |
| **Título** | [Registro de usuario] Al guardar un usuario válido se muestra una pantalla en blanco en lugar del mensaje "Usuario creado exitosamente" |
| **Módulo / Funcionalidad** | Gestión de usuarios > Registrar usuario |
| **Caso de prueba asociado** | Registrar usuario (flujo exitoso) |
| **Reportado por / Fecha** | Michael Garzón, QA Automation / 2026-09-30 |
| **Estado** | Nuevo |

## Descripción
Al completar el formulario de registro con datos válidos y presionar **Guardar**, la aplicación no muestra la confirmación "Usuario creado exitosamente". En su lugar aparece una pantalla completamente en blanco, sin mensaje ni controles de navegación. El usuario no sabe si el registro se hizo y no puede seguir en la aplicación sin recargar la página.

## Precondiciones
1. Ambiente de QA disponible y desplegado en la versión bajo prueba.
2. Usuario administrador con permiso para crear usuarios, con la sesión iniciada.
3. El correo que se va a registrar no existe en el sistema.

## Pasos para reproducir
1. Iniciar sesión con el usuario administrador.
2. Ir al menú **Usuarios > Registrar usuario**.
3. Diligenciar los campos obligatorios con los datos de la sección "Datos usados".
4. Presionar **Guardar**.
5. Observar la pantalla resultante.

## Datos usados
| Campo | Valor |
|-------|-------|
| Nombre | Laura QA |
| Correo | `laura.qa+20260930@empresa-test.com` |
| Contraseña | `Prueba2026*` (dato ficticio de prueba) |
| Rol | Usuario estándar |

## Resultado esperado
El sistema registra al usuario y muestra el mensaje **"Usuario creado exitosamente"**. El nuevo usuario aparece en el listado.

## Resultado obtenido
La aplicación muestra una **pantalla en blanco**. No aparece ningún mensaje de éxito ni de error.

*Verificación complementaria sugerida:* consultar en el listado o la base de datos si el usuario quedó creado. Si fue creado, el problema está en la respuesta o renderizado del frontend. Si no fue creado, el problema está en el backend. Esto ayuda a acotar la causa.

## Ambiente
| Ítem | Valor |
|------|-------|
| Ambiente | QA (URL del ambiente) |
| Versión / build | Número de build desplegado |
| Navegador | Google Chrome 1xx (64 bits) |
| Sistema operativo | Windows 11 |
| Reproducibilidad | 3 de 3 intentos (100 %) |

## Clasificación
| Campo | Valor | Justificación |
|-------|-------|---------------|
| **Severidad** | **Alta (Mayor)** | Bloquea la confirmación de una funcionalidad principal y deja la aplicación en un estado sin salida. Si además el usuario no se crea, pasaría a **Crítica**. |
| **Prioridad** | **Alta** | Afecta el alta de usuarios, que es un flujo de negocio frecuente y necesario para usar el sistema. Debe corregirse en el sprint actual. |

## Evidencias sugeridas
- Video o GIF de los pasos 1 a 5.
- Captura de la pantalla en blanco.
- Consola del navegador (F12 > Console) con los errores JavaScript.
- Pestaña **Network** con la petición de guardado: método, URL, *status code*, *payload* y respuesta, exportada como archivo HAR.
- Logs del backend filtrados por la hora del evento o el *correlation id*.
- Resultado de la verificación en BD o en el listado sobre si el usuario fue creado.
