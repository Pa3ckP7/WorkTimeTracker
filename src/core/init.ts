import { initializeDatabase, runMigrations} from './data/db';

/**
 * Initialize the core module
 * - Sets up the Capacitor SQLite connection
 * - Runs database migrations
 */
export async function initializeCore(): Promise<void> {
  console.log('[Core] Initializing...');

  const connection = await initializeDatabase();
  await runMigrations(connection);

  console.log('[Core] Initialization complete');
}
