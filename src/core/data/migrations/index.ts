// Import SQL files as raw strings
import migration_0001 from './0001_initial.sql?raw';

export const migrations = [
  { id: 1, name: '0001_initial', sql: migration_0001 },
];
