/**
 * Datos de prueba centralizados. Las pruebas no tienen valores "quemados".
 */
export const webData = {
  login: {
    wrongPassword: 'ClaveErrada123',
    invalidCredentialsMessage: 'Invalid credentials',
    requiredMessage: 'Required',
  },
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
    /** Employee Id unico de 10 caracteres (el servidor rechaza Ids de mas de 10 con error 422). */
    nonExistentEmployeeId: () => `QA${String(Date.now()).slice(-8)}`,
  },
};

export const apiData = {
  user: {
    id: 2,
    first_name: 'Janet',
    last_name: 'Weaver',
    email: 'janet.weaver@reqres.in',
  },
  nonExistentUserId: 23,
};
