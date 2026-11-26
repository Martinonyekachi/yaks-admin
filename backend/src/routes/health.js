import { Router } from 'express';
import { checkDatabaseConnection } from '../prisma/db.ts';

const router = Router();

router.get('/health', async (_request, response) => {
  try {
    await checkDatabaseConnection();
    response.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    console.error('PostgreSQL health check failed.');
    response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

export default router;
