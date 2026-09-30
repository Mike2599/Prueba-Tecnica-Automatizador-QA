import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuracion por ambiente. Se selecciona con la variable TEST_ENV (qa por defecto).
 * Los secretos nunca se escriben aqui: se leen de variables de entorno (.env local o variables del pipeline).
 */
type EnvironmentConfig = {
  webBaseUrl: string;
  apiBaseUrl: string;
};

const environments: Record<string, EnvironmentConfig> = {
  qa: {
    webBaseUrl: 'https://opensource-demo.orangehrmlive.com',
    apiBaseUrl: 'https://reqres.in',
  },
  // Ejemplo de como se agregaria otro ambiente sin tocar las pruebas
  staging: {
    webBaseUrl: process.env.STAGING_WEB_URL ?? 'https://opensource-demo.orangehrmlive.com',
    apiBaseUrl: process.env.STAGING_API_URL ?? 'https://reqres.in',
  },
};

const envName = process.env.TEST_ENV ?? 'qa';
const selected = environments[envName];
if (!selected) {
  throw new Error(`Ambiente "${envName}" no definido. Opciones: ${Object.keys(environments).join(', ')}`);
}

export const config = {
  envName,
  ...selected,
  credentials: {
    // Valores por defecto = credenciales PUBLICAS publicadas en el portal demo (no son secretos reales)
    username: process.env.ORANGE_USER ?? 'Admin',
    password: process.env.ORANGE_PASSWORD ?? 'admin123',
  },
  api: {
    key: process.env.REQRES_API_KEY || undefined,
    maxResponseMs: Number(process.env.API_MAX_RESPONSE_MS ?? 2000),
  },
  headless: (process.env.HEADLESS ?? 'true') !== 'false',
};
