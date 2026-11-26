import { config } from 'dotenv';
import pg from 'pg';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d.js';
import contractJson from './contract.json' with { type: 'json' };

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required in backend/.env.');
}

export const contract = contractFromJson<Contract>(contractJson);

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,
});

pool.on('error', () => {
  console.error('A PostgreSQL pooled connection reported an error.');
});

export const db = postgres({
  contract,
  pg: pool,
});

export async function checkDatabaseConnection() {
  await db.connect();
  await pool.query('SELECT 1');
}

export async function closeDatabaseConnection() {
  try {
    await db.close();
  } finally {
    await pool.end();
  }
}
