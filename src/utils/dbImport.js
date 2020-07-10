import { importDB } from 'dexie-export-import';
import db from '~/utils/db';

export default async function importdb() {
  await db.delete();
  const url = 'http://localhost:8081/data-export.json';
  const blob = await fetch(url).then((r) => r.blob());
  await importDB(blob);
  document.location.reload(true);
  return 'ok';
}
