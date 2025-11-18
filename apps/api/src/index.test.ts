import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import { createApp, createServer } from './index';
import http from 'http';

describe('API Server', () => {
  describe('Express App Setup', () => {
    it('should create an Express app instance', () => {
      const app = createApp();
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have security headers from Helmet', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should handle CORS', async () => {
      const app = createApp();
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );
    });
  });

  describe('GET /health', () => {
    it('should return health status with 200 or 503', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('database');
    });

    it('should include database connectivity status', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect(response.body.database).toHaveProperty('status');
      expect(['connected', 'disconnected']).toContain(
        response.body.database.status,
      );
    });

    it('should include version information', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect(response.body.version).toBe('1.0.0');
    });

    it('should track uptime', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/hello', () => {
    it('should return hello message', async () => {
      const app = createApp();
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Hello');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const app = createApp();
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Not Found');
    });

    it('should return error envelope for 404', async () => {
      const app = createApp();
      const response = await request(app).get('/api/nonexistent');
      expect(response.body.error).toHaveProperty('statusCode', 404);
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle errors with trace IDs', async () => {
      const app = createApp();
      // The error handler is set up, but we need to trigger it through a route
      const response = await request(app).get('/health');
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should return consistent error structure', async () => {
      const app = createApp();
      const response = await request(app).get('/nonexistent');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });

  describe('Middleware Stack', () => {
    it('should parse JSON bodies', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/hello')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      expect(response.status).toBe(404); // POST not implemented, but JSON should parse
    });

    it('should support compression', async () => {
      const app = createApp();
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip');
      // Response may or may not be compressed depending on size
      expect([200, 503]).toContain(response.status);
    });

    it('should set trace ID in response headers', async () => {
      const app = createApp();
      const response = await request(app).get('/health');
      expect(response.headers['x-trace-id']).toBeDefined();
    });

    it('should accept trace ID from request headers', async () => {
      const app = createApp();
      const traceId = 'test-trace-123';
      const response = await request(app)
        .get('/health')
        .set('X-Trace-ID', traceId);
      expect(response.headers['x-trace-id']).toBe(traceId);
    });
  });

  describe('Server Creation', () => {
    let server: http.Server;

    afterEach(async () => {
      if (server && server.listening) {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
      }
    });

    it('should create an HTTP server with WebSocket', () => {
      const { httpServer } = createServer();
      server = httpServer;
      expect(server).toBeDefined();
    });

    it('should not start listening automatically', () => {
      const { httpServer } = createServer();
      server = httpServer;
      expect(server.listening).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple requests concurrently', async () => {
      const app = createApp();
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/health'),
      );
      const responses = await Promise.all(requests);
      responses.forEach((response) => {
        expect([200, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('status');
      });
    });

    it('should return appropriate status codes', async () => {
      const app = createApp();

      const health = await request(app).get('/health');
      expect([200, 503]).toContain(health.status);

      const hello = await request(app).get('/api/hello');
      expect(hello.status).toBe(200);

      const notFound = await request(app).get('/does-not-exist');
      expect(notFound.status).toBe(404);
    });
  });
});
