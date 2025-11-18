import { Router, Response, NextFunction } from 'express';
import { getHealthStatus } from '../services/health.service';

const router = Router();

router.get('/health', async (_req, res: Response, next: NextFunction) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    next(error);
  }
});

export default router;
