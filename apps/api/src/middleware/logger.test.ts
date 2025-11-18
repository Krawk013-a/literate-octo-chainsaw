import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requestLogger, traceIdMiddleware } from './logger';

describe('Logger Middleware', () => {
  describe('traceIdMiddleware', () => {
    it('should add trace ID to request from header', () => {
      const req = {
        headers: { 'x-trace-id': 'test-123' },
      } as any;
      const res = {
        setHeader: vi.fn(),
      } as any;
      const next = vi.fn();

      traceIdMiddleware(req, res, next);

      expect(req.traceId).toBe('test-123');
      expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', 'test-123');
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing trace ID header', () => {
      const req = {
        headers: {},
      } as any;
      const res = {
        setHeader: vi.fn(),
      } as any;
      const next = vi.fn();

      traceIdMiddleware(req, res, next);

      expect(req.traceId).toBe('');
      expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', '');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call next', () => {
      const req = {
        method: 'GET',
        path: '/test',
      } as any;
      const res = {
        statusCode: 200,
        send: vi.fn(() => res),
      } as any;
      const next = vi.fn();

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should wrap send method', () => {
      const req = {
        method: 'GET',
        path: '/test',
      } as any;
      const res = {
        statusCode: 200,
        send: vi.fn(() => res),
      } as any;
      const next = vi.fn();

      const originalSend = res.send;
      requestLogger(req, res, next);

      expect(res.send).not.toBe(originalSend);
    });
  });
});
