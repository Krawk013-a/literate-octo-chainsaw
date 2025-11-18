# Backend API Architecture

## Overview

The backend API is built on Express.js with TypeScript, featuring a modular, layered architecture designed for scalability, maintainability, and testability.

## Project Structure

```
apps/api/
├── src/
│   ├── config/                 # Configuration management
│   │   ├── env.ts             # Environment variables with zod validation
│   │   └── database.ts        # Prisma client initialization
│   ├── middleware/            # Express middleware
│   │   ├── error-handler.ts   # Centralized error handling
│   │   ├── logger.ts          # Request logging and trace IDs
│   │   └── rate-limiter.ts    # Rate limiting strategies
│   ├── routes/                # API route handlers
│   │   └── health.routes.ts   # Health check endpoint
│   ├── services/              # Business logic layer
│   │   └── health.service.ts  # Health check service
│   ├── utils/                 # Utility functions
│   │   └── error.ts           # Error classes and helpers
│   ├── websocket/             # WebSocket setup
│   │   └── socket.ts          # Socket.IO configuration
│   ├── index.ts               # Entry point
│   └── server.ts              # Express app & HTTP server setup
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Core Components

### 1. Configuration (`src/config/`)

**`env.ts`**: Environment variable management with Zod validation
- Validates all required environment variables at startup
- Supports development, test, and production environments
- Type-safe environment access throughout the application

**`database.ts`**: Prisma ORM client setup
- Singleton pattern for Prisma client in production
- Global instance caching for development to prevent connection leaks
- Database health check functionality
- Graceful disconnection

### 2. Middleware Stack (`src/middleware/`)

Applied in order for `createApp()`:

1. **Helmet** - Security headers (CSP, X-Frame-Options, etc.)
2. **CORS** - Cross-origin request handling with configured origin
3. **Compression** - Response compression (gzip)
4. **Trace ID** - Request tracking with UUID or propagated trace IDs
5. **Request Logger** - Structured JSON request/response logging
6. **Rate Limiting** - Global, API, and auth-specific rate limits
7. **JSON Parser** - Express built-in JSON body parsing (10MB limit)
8. **Error Handler** - Centralized error handling (last middleware)

**Rate Limiting Strategies**:
- Global: 100 requests per 15 minutes per IP (excludes `/health`)
- API: 30 requests per minute for general API endpoints
- Auth: 5 failed requests per 15 minutes for auth endpoints

### 3. Error Handling (`src/utils/error.ts`)

**AppError Class**: Custom error with status code and trace ID
```typescript
throw new AppError(400, 'Invalid request');
// or with explicit trace ID
throw new AppError(400, 'Invalid request', traceId);
```

**Error Response Envelope**:
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "traceId": "uuid-v4",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

All errors are logged with trace IDs for debugging and monitoring.

### 4. Routes (`src/routes/`)

Route files should export Express Router instances and be imported in `server.ts` via `createApp()`.

**Health Route** (`health.routes.ts`):
- `GET /health` - Returns health status with database connectivity
- Used for container orchestration, load balancers, and monitoring
- Returns `200 OK` if healthy, `503 Service Unavailable` if degraded

### 5. Services (`src/services/`)

Business logic layer separate from routes. Services handle:
- Database queries
- External API calls
- Complex computations
- Data transformations

**Health Service** (`health.service.ts`):
- Database connectivity check
- System uptime calculation
- Environment and version info

### 6. WebSocket (`src/websocket/`)

Socket.IO integration for real-time features:

**Namespaces** (Placeholders for future implementation):
- `/notifications` - User notifications
- `/live-exercises` - Real-time exercise feedback
- `/leaderboards` - Live leaderboard updates

**Authentication Placeholder**: `io.use()` middleware for JWT validation (TODO)

## Server Setup (`src/server.ts`)

### Functions

**`createApp(): Express`**
- Creates and configures Express application
- Applies middleware stack
- Registers routes
- Returns configured app (not listening)

**`createServer()`**
- Creates HTTP server with Express app
- Initializes WebSocket layer
- Returns `{ app, httpServer }`

**`startServer(): Promise<http.Server>`**
- Starts listening on configured port
- Logs server startup info
- Returns promise resolving to HTTP server

**`gracefulShutdown(): Promise<void>`**
- Closes HTTP server connections
- Disconnects database
- 30-second force shutdown timeout
- Logs shutdown steps

## Entry Point (`src/index.ts`)

- Loads environment configuration
- Exports `createApp`, `createServer`, `startServer`, `gracefulShutdown`
- Starts server if not in test environment
- Handles graceful shutdown on SIGTERM/SIGINT
- Handles uncaught exceptions and unhandled rejections

## Environment Variables

Required variables (validated with Zod):

```env
# Application
NODE_ENV=development|test|production (default: development)
PORT=5000 (default: 5000)
LOG_LEVEL=error|warn|info|debug (default: info)

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# CORS
CORS_ORIGIN=http://localhost:3000 (default: http://localhost:3000)

# JWT
JWT_SECRET=your-secret-key (min 8 characters)
JWT_EXPIRES_IN=7d (default: 7d)
```

## Testing

Comprehensive test coverage using Vitest and Supertest:

### Test Categories

1. **Server Setup Tests** - App creation, middleware configuration
2. **Route Tests** - Endpoint functionality and status codes
3. **Middleware Tests** - Error handling, logging, rate limiting
4. **Integration Tests** - Multiple concurrent requests, proper error responses
5. **Service Tests** - Business logic with mocked dependencies

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Coverage Requirements

- Bootstrap files (`index.ts`, `server.ts`): >80% line coverage
- Middleware stack: >80% line coverage
- Error handling: >90% line coverage

## Adding New Routes

1. Create route file in `src/routes/` (e.g., `users.routes.ts`)
2. Define router with endpoints:
```typescript
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Route logic
    res.json({ data: [] });
  } catch (error) {
    next(error);
  }
});

export default router;
```
3. Import and register in `src/server.ts`:
```typescript
import usersRoutes from './routes/users.routes';
app.use('/api/users', usersRoutes);
```

## Adding New Middleware

1. Create middleware file in `src/middleware/`
2. Export middleware function:
```typescript
import { Request, Response, NextFunction } from 'express';

export function customMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Middleware logic
  next();
}
```
3. Register in `src/server.ts` at appropriate position in middleware stack

## Adding WebSocket Namespaces

1. Define namespace handler in `src/websocket/socket.ts`:
```typescript
const customNS = io.of('/custom');

customNS.on('connection', (socket) => {
  console.log(`[WebSocket] Custom namespace: ${socket.id}`);
  
  socket.on('message', (data) => {
    customNS.emit('broadcast', data);
  });
});
```

2. Implement authentication and message handling
3. Document namespace events and contracts

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests passing with >80% coverage
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers verified
- [ ] Rate limiting tuned for expected traffic
- [ ] Error logging configured
- [ ] Graceful shutdown tested

### Environment Configuration

Production should use:
- Secure JWT secret (minimum 32 characters)
- PostgreSQL with connection pooling
- CORS origin set to frontend domain
- LOG_LEVEL set to `warn` or `error`

### Monitoring

Key metrics to monitor:
- Health check response times
- Error rates by status code
- Trace ID correlation in logs
- Database connection pool usage
- WebSocket active connections
- Memory and CPU usage

## Performance Considerations

1. **Database**: Use Prisma query optimization, add indexes for frequently queried fields
2. **Caching**: Consider Redis for session management and frequently accessed data
3. **Compression**: Enabled for responses >1KB
4. **Rate Limiting**: Adjust limits based on expected traffic
5. **WebSocket**: Monitor concurrent connections and message throughput

## Security Best Practices

1. Always validate and sanitize user input
2. Use Helmet for security headers
3. Enable HTTPS in production (via reverse proxy)
4. Implement proper authentication with JWT
5. Use environment variables for secrets
6. Enable CORS only for trusted origins
7. Implement rate limiting per endpoint
8. Log security-relevant events with trace IDs
9. Keep dependencies updated
10. Use type safety with TypeScript strict mode
