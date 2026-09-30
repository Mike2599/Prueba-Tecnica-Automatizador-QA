import { test, expect } from '@playwright/test';
import { ReqresClient } from '../../api/ReqresClient';
import { expectUserResponseStructure } from '../../api/schemas';
import { config } from '../../config/environments';
import { apiData } from '../../data/testData';

test.describe('Parte 4 - API ReqRes GET /api/users/{id}', { tag: ['@api'] }, () => {
  test('API-01 Consultar usuario 2 retorna datos correctos, headers y tiempo valido', async ({ request }) => {
    const client = new ReqresClient(request);
    const expected = apiData.user;

    const { response, elapsedMs } = await client.getUser(expected.id);
    test.info().annotations.push({
      type: 'tiempo-respuesta',
      description: `${elapsedMs} ms (umbral ${config.api.maxResponseMs} ms)`,
    });

    await test.step('Codigo de estado HTTP', async () => {
      if ([401, 403].includes(response.status())) {
        // Comportamiento documentado en el README: el servicio puede exigir x-api-key
        throw new Error(
          `ReqRes respondio ${response.status()}: el servicio exige autenticacion. ` +
            'Defina REQRES_API_KEY en .env o en las variables del pipeline.',
        );
      }
      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();
    });

    const body = await response.json();
    await test.info().attach('response-body.json', {
      body: JSON.stringify(body, null, 2),
      contentType: 'application/json',
    });

    await test.step('Estructura principal de la respuesta', async () => {
      expectUserResponseStructure(body);
    });

    await test.step('Identificador, nombre y correo del usuario', async () => {
      expect(body.data.id).toBe(expected.id);
      expect(body.data.first_name).toBe(expected.first_name);
      expect(body.data.last_name).toBe(expected.last_name);
      expect(body.data.email).toBe(expected.email);
      expect(body.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    await test.step('Headers relevantes', async () => {
      const headers = response.headers();
      expect(headers['content-type']).toContain('application/json');
      expect(headers['content-type']).toContain('charset=utf-8');
      // Headers de seguridad
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['strict-transport-security']).toContain('max-age=');
    });

    await test.step(`Tiempo de respuesta menor a ${config.api.maxResponseMs} ms`, async () => {
      expect(elapsedMs, `Tiempo medido: ${elapsedMs} ms`).toBeLessThan(config.api.maxResponseMs);
    });
  });

  test('API-02 Consultar un usuario inexistente retorna 404 y cuerpo vacio', async ({ request }) => {
    const { response } = await new ReqresClient(request).getUser(23);
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({});
  });
});
