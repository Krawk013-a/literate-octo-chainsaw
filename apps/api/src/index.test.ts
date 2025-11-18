import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './index';

describe('API Server', () => {
  describe('GET /health', () => {
    it('returns health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/hello', () => {
    it('returns hello message', async () => {
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Hello');
    });
  });
});
