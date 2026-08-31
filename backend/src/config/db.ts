import Database from 'better-sqlite3';
import { join } from 'node:path';

const dbName = process.env.DB_NAME || 'tickets.db';
const db = new Database(join(import.meta.dirname, '../..', dbName));

export default db;