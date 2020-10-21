import { Model } from '@vuex-orm/core';
import { v4 as uuid } from 'uuid';
import File from './file';

class Folder extends Model {
	static entity = 'folders'
	
	static primaryKey = 'id';

	static fields() {
	  return {
	    id: this.uid(() => uuid()),
	    name: this.string(''),
	    description: this.string(''),
	    createdAt: this.number(Date.now()),
	    files: this.hasMany(File, 'folderId'),
	  };
	}
}

export default Folder;
