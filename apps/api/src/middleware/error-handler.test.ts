import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppError } from '../utils/error';
import { errorHandler } from './error-handler';

describe('Error Handler Middleware', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('should handle AppError without errors', () => {
    const error = new AppError(400, 'Bad Request');
    const req = { path: '/test' } as any;
    const capturedResponse: any = {};
    const res = {
      status: vi.fn((code) => {
        capturedResponse.statusCode = code;
        return {
          json: vi.fn((data) => {
            capturedResponse.data = data;
          }),
        };
      }),
      headersSent: false,
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should not send response if headers already sent', () => {
    const error = new AppError(400, 'Bad Request');
    const req = { path: '/test' } as any;
    const statusMock = vi.fn();
    const res = {
      status: statusMock,
      headersSent: true,
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should handle generic Error', () => {
    const error = new Error('Generic error');
    const req = { path: '/test' } as any;
    const res = {
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
      headersSent: false,
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should log errors with trace ID', () => {
    const error = new AppError(500, 'Internal error', 'test-trace-123');
    const req = { path: '/api/test' } as any;
    const res = {
      status: vi.fn().mockReturnValue({ json: vi.fn() }),
      headersSent: false,
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    // Verify error was logged (error handler should log)
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
