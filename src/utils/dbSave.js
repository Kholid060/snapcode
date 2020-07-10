import { exportDB } from 'dexie-export-import';
import download from 'downloadjs';
import db from '~/utils/db';

export default async function dldb() {
  const options = { prettyJson: true };
  const temp = await exportDB(db, options);
  download(temp, 'data.json', 'application/json');
  return 'ok';
}
