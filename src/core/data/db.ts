import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { migrations } from './migrations';

const DB_NAME = 'worktimetracker.db';
export const DB_VERSION = 1;

let connection: SQLiteDBConnection | null = null;
let sqliteConnection: SQLiteConnection | null = null;

export async function initializeDatabase(): Promise<SQLiteDBConnection> {
  if (connection) {
    return connection;
  }

  try {
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    const platform = Capacitor.getPlatform();

    // Web-specific initialization
    if (platform === 'web') {
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.querySelector('jeep-sqlite');
      if (jeepSqliteEl) {
        await sqliteConnection.initWebStore();
      }
    }

    // Create connection
    connection = await sqliteConnection.createConnection(
      DB_NAME,
      false,
      'no-encryption',
      DB_VERSION,
      false
    );

    await connection.open();

    // Save to store for web
    if (platform === 'web') {
      await sqliteConnection.saveToStore(DB_NAME);
    }

    console.log('[Database] Initialized successfully');
    return connection;
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    throw error;
  }
}

export function getConnection(): SQLiteDBConnection {
  if (!connection) {
    throw new Error('[Database] Not initialized. Call initializeDatabase() first.');
  }
  return connection;
}

export async function closeDatabase(): Promise<void> {
  if (connection) {
    await connection.close();
    connection = null;
  }
  if (sqliteConnection) {
    await sqliteConnection.closeConnection(DB_NAME, false);
    sqliteConnection = null;
  }
  console.log('[Database] Closed');
}

export async function runMigrations(connection: SQLiteDBConnection): Promise<void> {
  try {
    // Get current database version
    const result = await connection.query('PRAGMA user_version', []);
    const currentVersion = result.values?.[0]?.user_version || 0;

    console.log(`[Migrations] Current version: ${currentVersion}, Target: ${DB_VERSION}`);

    // Apply migrations for versions we haven't reached yet
    for (const migration of migrations) {
      if (migration.id > currentVersion && migration.id <= DB_VERSION) {
        console.log(`[Migrations] Applying: ${migration.name}`);
        await connection.execute(migration.sql);
        console.log(`[Migrations] Applied: ${migration.name}`);
      }
    }

    // Update database version
    if (currentVersion < DB_VERSION) {
      await connection.execute(`PRAGMA user_version = ${DB_VERSION}`);
      console.log(`[Migrations] Updated version to ${DB_VERSION}`);
    }

    console.log('[Migrations] All migrations applied');
  } catch (error) {
    console.error('[Migrations] Error:', error);
    throw error;
  }
}
