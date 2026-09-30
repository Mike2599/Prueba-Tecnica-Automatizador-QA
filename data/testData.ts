/**
 * Datos de prueba centralizados. Las pruebas no tienen valores "quemados".
 */
export const webData = {
  dashboard: {
    title: 'Dashboard',
    // Widgets que confirman que el Dashboard cargo contenido real (no solo el titulo)
    expectedWidgets: ['Time at Work', 'My Actions', 'Quick Launch'],
  },
  pim: {
    noResultsMessage: 'No Records Found',
    /**
     * Nombre unico por ejecucion: garantiza que el empleado NO exista aunque otros
     * usuarios del demo publico creen registros, y hace la prueba repetible.
     */
    nonExistentEmployee: () => `QA-NoExiste-${Date.now()}`,
  },
};

export const apiData = {
  user: {
    id: 2,
    first_name: 'Janet',
    last_name: 'Weaver',
    email: 'janet.weaver@reqres.in',
  },
};
