import { test, expect, APIRequestContext } from '@playwright/test';
import { ReqresClient, TimedResponse } from '../../api/ReqresClient';
import { expectUserResponseStructure } from '../../api/schemas';
import { config } from '../../config/environments';
import { apiData } from '../../data/testData';

const expected = apiData.user;

/**
 * Consulta el usuario esperado. Cada prueba hace su propia solicitud para ser independiente.
 * Si el servicio exige autenticacion (401/403) falla con un mensaje que indica como configurarla.
 */
async function getExpectedUser(request: APIRequestContext): Promise<TimedResponse> {
  const result = await new ReqresClient(request).getUser(expected.id);
  if ([401, 403].includes(result.response.status())) {
    throw new Error(
      `ReqRes respondio ${result.response.status()}: el servicio exige autenticacion. ` +
        'Defina REQRES_API_KEY en .env o en las variables del pipeline.',
    );
  }
  return result;
}

test.describe('Parte 4 - API ReqRes GET /api/users/{id}', { tag: ['@api'] }, () => {
  test('API-01 Codigo de estado HTTP 200', async ({ request }) => {
    const { response } = await getExpectedUser(request);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test('API-02 Estructura principal de la respuesta', async ({ request }) => {
    const { response } = await getExpectedUser(request);
    const body = await response.json();
    await test.info().attach('response-body.json', {
      body: JSON.stringify(body, null, 2),
      contentType: 'application/json',
    });

    expectUserResponseStructure(body);
  });

  test('API-03 Identificador, nombre y correo del usuario', async ({ request }) => {
    const { response } = await getExpectedUser(request);
    const { data } = await response.json();

    expect(data.id).toBe(expected.id);
    expect(data.first_name).toBe(expected.first_name);
    expect(data.last_name).toBe(expected.last_name);
    expect(data.email).toBe(expected.email);
    expect(data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('API-04 Headers relevantes', async ({ request }) => {
    const { response } = await getExpectedUser(request);
    const headers = response.headers();

    expect(headers['content-type']).toContain('application/json');
    expect(headers['content-type']).toContain('charset=utf-8');
    // Headers de seguridad
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=');
  });

  test(`API-05 Tiempo de respuesta menor a ${config.api.maxResponseMs} ms`, async ({ request }) => {
    const { elapsedMs } = await getExpectedUser(request);
    test.info().annotations.push({
      type: 'tiempo-respuesta',
      description: `${elapsedMs} ms (umbral ${config.api.maxResponseMs} ms)`,
    });

    expect(elapsedMs, `Tiempo medido: ${elapsedMs} ms`).toBeLessThan(config.api.maxResponseMs);
  });

  test('API-06 Usuario inexistente retorna 404 y cuerpo vacio', async ({ request }) => {
    const { response } = await new ReqresClient(request).getUser(apiData.nonExistentUserId);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({});
  });
});
