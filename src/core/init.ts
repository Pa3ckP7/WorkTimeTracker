import { container } from 'tsyringe';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { initializeDatabase, runMigrations, getConnection, DB_CONNECTION_TOKEN } from './data/db';
import { ProfileRepository } from './data/repositories/ProfileRepository';
import { TimerRepository } from './data/repositories/TimerRepository';
import { TimerManagerService } from './services/TimeManager';

let isCoreInitialized = false;
let initializePromise: Promise<void> | null = null;

/**
 * Initialize the core module
 * - Sets up the Capacitor SQLite connection
 * - Runs database migrations
 * - Configures dependency injection container
 */
export async function initializeCore(): Promise<void> {
  if (isCoreInitialized) {
    return;
  }

  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    console.log('[Core] Initializing...');

    const connection = await initializeDatabase();
    await runMigrations(connection);

    // Register services in DI container (similar to C# ConfigureServices)
    container.register<SQLiteDBConnection>(DB_CONNECTION_TOKEN, {
      useFactory: () => getConnection()
    });
    container.registerSingleton(ProfileRepository);
    container.registerSingleton(TimerRepository);
    container.registerSingleton(TimerManagerService);

    isCoreInitialized = true;
    console.log('[Core] Initialization complete');
  })();

  try {
    await initializePromise;
  } finally {
    initializePromise = null;
  }
}

export async function ensureCoreInitialized(): Promise<void> {
  await initializeCore();
}
