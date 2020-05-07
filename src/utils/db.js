import Dexie from 'dexie';

const db = new Dexie('snapcode');
db.version(1).stores({
  folders: 'id, name',
  files: 'folderId, data',
  tags: 'id, name',
});

export default db;
