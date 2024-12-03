// https://github.com/tdwesten/tauri-drizzle-sqlite-proxy-demo/blob/main/src/db/migrate.ts
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { resourceDir } from '@tauri-apps/api/path';
import { sqlite } from './db';
import { path } from '@tauri-apps/api';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { DB_VIRTUAL_TABLE_NAME } from '@/utils/const/db.const';

export type ProxyMigrator = (migrationQueries: string[]) => Promise<void>;

async function getMigrationFiles(migrationPath: string) {
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

  return migrations;
}
async function createMigrationTable() {
  const migrationTableCreate = `
   CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hash text NOT NULL UNIQUE,
    created_at numeric
  )`;

  await sqlite.execute(migrationTableCreate, []);
}

const virtualTable = `
CREATE VIRTUAL TABLE IF NOT EXISTS ${DB_VIRTUAL_TABLE_NAME.snippets} USING fts5(
  id UNINDEXED,
  name,
  content,
	keyword,
	content='snippets',
	content_rowid='_id',
  tokenize="trigram"
);

-- Triggers to keep the FTS index up to date.
CREATE TRIGGER IF NOT EXISTS snippets_ai AFTER INSERT ON snippets BEGIN
  INSERT INTO ${DB_VIRTUAL_TABLE_NAME.snippets}(rowid, id, name, content, keyword) VALUES (new._id, new.id, new.name, new.content, new.keyword);
END;
CREATE TRIGGER IF NOT EXISTS snippets_ad AFTER DELETE ON snippets BEGIN
  INSERT INTO ${DB_VIRTUAL_TABLE_NAME.snippets}(${DB_VIRTUAL_TABLE_NAME.snippets}, rowid, id, name, content, keyword) VALUES('delete', old._id, old.id, old.name, old.content, old.keyword);
END;
CREATE TRIGGER IF NOT EXISTS snippets_au AFTER UPDATE ON snippets
WHEN OLD.name IS NOT NEW.name
   OR OLD.content IS NOT NEW.content
   OR OLD.keyword IS NOT NEW.keyword
BEGIN
  INSERT INTO ${DB_VIRTUAL_TABLE_NAME.snippets}(${DB_VIRTUAL_TABLE_NAME.snippets}, rowid, id, name, content, keyword) VALUES('delete', old._id, old.id, old.name, old.content, old.keyword);
  INSERT INTO ${DB_VIRTUAL_TABLE_NAME.snippets}(rowid, id, name, content, keyword) VALUES (new._id, new.id, new.name, new.content, new.keyword);
END;
  `;

async function migrateDatabase() {
  const migrationPath = await path.join(
    await resourceDir(),
    'db',
    'migrations',
  );
  const migrations = await getMigrationFiles(migrationPath);

  const dbMigrations = await sqlite.select<{ hash: string }[]>(
    `SELECT hash FROM "__drizzle_migrations" ORDER BY created_at DESC`,
  );
  const dbMigrationsSet = new Set(dbMigrations.map((item) => item.hash));

  try {
    await sqlite.execute('BEGIN');

    for (const migration of migrations) {
      const hash = migration.name.replace('.sql', '');
      if (!hash || dbMigrationsSet.has(hash)) continue;

      let sql = await readTextFile(
        await path.join(migrationPath, migration.name),
      );
      if (sql.includes('CREATE TABLE `snippets`')) {
        sql += `\n${virtualTable}`;
      }
      console.log(sql);

      await sqlite.execute(sql, []);
      await sqlite.execute(
        `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, Date.now()],
      );
    }

    await sqlite.execute('COMMIT');
    console.info('Migrations complete');
  } catch (error) {
    await sqlite.execute('ROLLBACK');
    logger.error(getLogMessage('db-migration', error));
    throw error;
  }
}

export async function migrate() {
  await createMigrationTable();
  await migrateDatabase();
}
