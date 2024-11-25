// https://github.com/tdwesten/tauri-drizzle-sqlite-proxy-demo/blob/main/src/db/migrate.ts
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { resourceDir } from '@tauri-apps/api/path';
import { sqlite } from './db';
import { path } from '@tauri-apps/api';

export type ProxyMigrator = (migrationQueries: string[]) => Promise<void>;

export async function migrate() {
  const migrationPath = await path.join(
    await resourceDir(),
    'db',
    'migrations',
  );
  const files = await readDir(migrationPath);
  let migrations = files.filter(
    (file) => file.isFile && file.name.endsWith('.sql'),
  );

  // sort migrations by the first 4 characters of the file name
  migrations = migrations.sort((a, b) => {
    const aHash = a.name.replace('.sql', '').slice(0, 4);
    const bHash = b.name.replace('.sql', '').slice(0, 4);

    if (aHash && bHash) {
      return aHash.localeCompare(bHash);
    }

    return 0;
  });

  const migrationTableCreate = `
   CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hash text NOT NULL UNIQUE,
    created_at numeric
  )`;

  await sqlite.execute(migrationTableCreate, []);

  const dbMigrations = await sqlite.select<{ hash: string }[]>(
    `SELECT hash FROM "__drizzle_migrations" ORDER BY created_at DESC`,
  );
  const dbMigrationsSet = new Set(dbMigrations.map((item) => item.hash));

  await sqlite.execute('BEGIN');
  try {
    for (const migration of migrations) {
      const hash = migration.name.replace('.sql', '');
      if (!hash || dbMigrationsSet.has(hash)) continue;

      const sql = await readTextFile(
        await path.join(migrationPath, migration.name),
      );

      await sqlite.execute(sql, []);
      await sqlite.execute(
        `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, Date.now()],
      );
    }
    await sqlite.execute('COMMIT');
    console.info('Migrations complete');
  } catch (error) {
    console.error(error);
    await sqlite.execute('ROLLBACK');
  }
}
