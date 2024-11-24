// https://github.com/tdwesten/tauri-drizzle-sqlite-proxy-demo/blob/main/src/db/database.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import Database from '@tauri-apps/plugin-sql';
import * as schema from './schema';

export const sqlite = await Database.load('sqlite:app.db');
export const db = drizzle(async (sql, params, method) => {
  console.log('==db', { sql, params, method });
  if (!isSelectQuery(sql)) {
    await sqlite.select(sql, params);
    return { rows: [] };
  }

  let rows: any[] = await sqlite.select(sql, params);
  rows = rows.map((item) => Object.values(item));

  return { rows: method === 'all' ? rows : rows[0] };
}, {
  schema,
});

function isSelectQuery(sql: string): boolean {
  return /^\s*SELECT|RETURNING\b/i.test(sql);
}
