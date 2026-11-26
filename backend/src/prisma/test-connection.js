import { checkDatabaseConnection, closeDatabaseConnection } from './db.ts';

try {
  await checkDatabaseConnection();
  console.log('PostgreSQL connection test succeeded.');
} catch {
  console.error('PostgreSQL connection test failed. Check backend/.env and ensure PostgreSQL is reachable.');
  process.exitCode = 1;
} finally {
  try {
    await closeDatabaseConnection();
  } catch {
    console.error('Failed to close PostgreSQL resources cleanly.');
    process.exitCode = 1;
  }
}
