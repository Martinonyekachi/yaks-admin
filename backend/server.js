import cors from 'cors';
import express from 'express';
import { closeDatabaseConnection } from './src/prisma/db.ts';
import healthRouter from './src/routes/health.js';

const clientUrl = process.env['CLIENT_URL'];
if (!clientUrl) {
  throw new Error('CLIENT_URL is required in backend/.env.');
}

let clientOrigin;
try {
  clientOrigin = new URL(clientUrl).origin;
} catch {
  throw new Error('CLIENT_URL must be a valid URL in backend/.env.');
}

const allowedOrigins = new Set([clientOrigin]);
const localOrigin = new URL(clientOrigin);
if (localOrigin.hostname === 'localhost' || localOrigin.hostname === '127.0.0.1') {
  localOrigin.hostname = localOrigin.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  allowedOrigins.add(localOrigin.origin);
}

const port = Number(process.env['PORT'] || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: [...allowedOrigins] }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', healthRouter);
app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});
app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error);
  console.error('Unhandled API request error.');
  response.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`Yaks API listening on port ${port}.`);
});

let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  server.close(async () => {
    try {
      await closeDatabaseConnection();
    } catch {
      console.error('Failed to close PostgreSQL resources cleanly.');
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
