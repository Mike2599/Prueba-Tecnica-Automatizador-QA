import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../config/environments';

export type TimedResponse = { response: APIResponse; elapsedMs: number };

/**
 * Cliente de servicio (Service Object) para ReqRes.
 * Centraliza headers, autenticacion opcional y medicion del tiempo de respuesta.
 */
export class ReqresClient {
  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    // La API key solo se envia si existe en el entorno; nunca se versiona.
    if (config.api.key) headers['x-api-key'] = config.api.key;
    return headers;
  }

  async getUser(id: number): Promise<TimedResponse> {
    const start = performance.now();
    const response = await this.request.get(`/api/users/${id}`, { headers: this.headers() });
    const elapsedMs = Math.round(performance.now() - start);
    return { response, elapsedMs };
  }
}
