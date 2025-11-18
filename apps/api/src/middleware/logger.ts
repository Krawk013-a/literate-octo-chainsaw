import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface LogContext {
  timestamp: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  traceId?: string;
}

function log(level: string, context: LogContext): void {
  const output = {
    level,
    ...context,
  };
  console.log(JSON.stringify(output));
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const traceId = (req as any).traceId || '';

  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const context: LogContext = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      traceId,
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    log(level, context);

    return originalSend.call(this, data);
  };

  if (env.LOG_LEVEL === 'debug') {
    log('debug', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      traceId,
    });
  }

  next();
}

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || '';
  (req as any).traceId = traceId;
  res.setHeader('X-Trace-ID', traceId);
  next();
}
