import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env';
import { disconnectDatabase } from './config/database';
import healthRoutes from './routes/health.routes';
import publicContentRoutes from './routes/public-content.routes';
import contentRoutes from './routes/content.routes';
import learnerRoutes from './routes/learner.routes';
import { globalRateLimiter } from './middleware/rate-limiter';
import { requestLogger, traceIdMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/error-handler';
import setupWebSocket from './websocket/socket';

export function createApp(): Express {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
    }),
  );

  // Compression
  app.use(compression());

  // Trace ID middleware
  app.use(traceIdMiddleware);

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use(globalRateLimiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Routes
  app.use('/', healthRoutes);
  app.use('/api/content', publicContentRoutes);
  app.use('/api/admin/content', contentRoutes);
  app.use('/api/learner', learnerRoutes);

  // API routes placeholder
  app.get('/api/hello', (_req: Request, res: Response) => {
    res.json({ message: 'Hello from Express + TypeScript!' });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Not Found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

export function createServer(): { app: Express; httpServer: http.Server } {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Setup WebSocket
  setupWebSocket(httpServer);

  return { app, httpServer };
}

let server: http.Server | null = null;

export async function startServer(): Promise<http.Server> {
  const { httpServer } = createServer();

  return new Promise((resolve, reject) => {
    server = httpServer.listen(env.PORT, () => {
      console.log(`🚀 API server running on http://localhost:${env.PORT}`);
      console.log(`   Health check: http://localhost:${env.PORT}/health`);
      console.log(`   WebSocket: ws://localhost:${env.PORT}`);
      resolve(server!);
    });

    server!.on('error', reject);
  });
}

export async function gracefulShutdown(): Promise<void> {
  if (!server) return;

  return new Promise((resolve, reject) => {
    console.log('🛑 Shutting down gracefully...');

    server!.close(async (err) => {
      if (err) {
        console.error('Error closing server:', err);
        reject(err);
        return;
      }

      try {
        await disconnectDatabase();
        console.log('✅ Database disconnected');
        console.log('✅ Server shut down successfully');
        resolve();
      } catch (error) {
        console.error('Error disconnecting database:', error);
        reject(error);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after 30 seconds');
      process.exit(1);
    }, 30000);
  });
}
