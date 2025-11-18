import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public traceId: string = uuidv4(),
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
    traceId: string;
    timestamp: string;
    path?: string;
  };
}

export function generateTraceId(): string {
  return uuidv4();
}

export function sendErrorResponse(
  res: Response,
  error: AppError | Error,
  path?: string,
): void {
  const traceId = error instanceof AppError ? error.traceId : generateTraceId();
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError
      ? error.message
      : 'Internal Server Error';

  const response: ErrorResponse = {
    error: {
      message,
      statusCode,
      traceId,
      timestamp: new Date().toISOString(),
      ...(path && { path }),
    },
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    const statusRes = res.status(statusCode);
    if (statusRes && typeof statusRes.json === 'function') {
      statusRes.json(response);
    } else {
      res.json(response);
    }
  } else if (typeof res.json === 'function') {
    res.json(response);
  }
}

export function logError(error: Error, traceId: string): void {
  const timestamp = new Date().toISOString();
  console.error(
    JSON.stringify(
      {
        level: 'error',
        timestamp,
        traceId,
        message: error.message,
        stack: error.stack,
      },
      null,
      2,
    ),
  );
}
