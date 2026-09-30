import { expect } from '@playwright/test';

/**
 * Validacion de la estructura principal de GET /api/users/{id}.
 * Se valida presencia y tipo de cada campo contractual (sin dependencias extra).
 */
export function expectUserResponseStructure(body: unknown): void {
  expect(body).toEqual(
    expect.objectContaining({
      data: expect.objectContaining({
        id: expect.any(Number),
        email: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
        avatar: expect.any(String),
      }),
      support: expect.objectContaining({
        url: expect.any(String),
        text: expect.any(String),
      }),
    }),
  );
}
