import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHealthStatus } from './health.service';
import * as databaseModule from '../config/database';

describe('Health Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return healthy status when database is connected', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.status).toBe('ok');
    expect(health.database.status).toBe('connected');
  });

  it('should return degraded status when database is disconnected', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(false);

    const health = await getHealthStatus();

    expect(health.status).toBe('degraded');
    expect(health.database.status).toBe('disconnected');
  });

  it('should include version information', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.version).toBe('1.0.0');
  });

  it('should include environment', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.environment).toBeDefined();
  });

  it('should include timestamp', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.timestamp).toBeDefined();
    expect(new Date(health.timestamp)).toBeInstanceOf(Date);
  });

  it('should include uptime', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.uptime).toBeDefined();
    expect(typeof health.uptime).toBe('number');
    expect(health.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should include database latency when connected', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const health = await getHealthStatus();

    expect(health.database.latency).toBeDefined();
    expect(typeof health.database.latency).toBe('number');
    expect(health.database.latency).toBeGreaterThanOrEqual(0);
  });

  it('should not include database latency when disconnected', async () => {
    vi.spyOn(databaseModule, 'checkDatabaseHealth').mockResolvedValue(false);

    const health = await getHealthStatus();

    expect(health.database.latency).toBeUndefined();
  });
});
