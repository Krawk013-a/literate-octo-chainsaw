import { Request, Response, NextFunction } from 'express';
import { AppError, sendErrorResponse, logError, generateTraceId } from '../utils/error';

export class ErrorHandler {
  static handle(
    err: Error | AppError,
    req: Request,
    res: Response,
  ): void {
    const traceId = err instanceof AppError ? err.traceId : generateTraceId();

    if (!res.headersSent) {
      logError(err, traceId);

      const appError = err instanceof AppError
        ? err
        : new AppError(500, 'Internal Server Error', traceId);

      sendErrorResponse(res, appError, req.path);
    }
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  ErrorHandler.handle(err, req, res);
}
