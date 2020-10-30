import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';
import File from './file';

class Folder extends Model {
	static entity = 'folders'
	
	static primaryKey = 'id';

	static fields() {
	  return {
	    id: this.uid(() => nanoid()),
	    name: this.string(''),
	    createdAt: this.number(Date.now()),
	    files: this.hasMany(File, 'folderId'),
	  };
	}
}

export default Folder;
