import { exportDB } from 'dexie-export-import';
import download from 'downloadjs';

export default async function dldb(db) {
  const options = { prettyJson: true };
  const temp = await exportDB(db, options);
  download(temp, 'dexie-export.json', 'application/json');
  return 'ok';
}
