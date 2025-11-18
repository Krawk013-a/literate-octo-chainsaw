import { checkDatabaseHealth } from '../config/database';
import { env } from '../config/env';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency?: number;
  };
}

const startTime = Date.now();

export async function getHealthStatus(): Promise<HealthStatus> {
  const now = Date.now();
  const startDbCheck = now;
  const dbHealthy = await checkDatabaseHealth();
  const dbLatency = Date.now() - startDbCheck;

  const databaseStatus = dbHealthy ? 'connected' : 'disconnected';
  const overallStatus = dbHealthy ? 'ok' : 'degraded';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptime: Math.floor((now - startTime) / 1000),
    database: {
      status: databaseStatus,
      ...(dbHealthy && { latency: dbLatency }),
    },
  };
}
