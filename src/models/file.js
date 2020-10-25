import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';

class File extends Model {
	static entity = 'files'

	static primaryKey = 'id'

	static fields() {
	  return {
	    id: this.uid(() => nanoid()),
	    folderId: this.attr(null),
	    name: this.string('my code'),
	    language: this.string('javascript'),
	    code: this.string(''),
	    starred: this.boolean(false),
	    createdAt: this.number(Date.now()),
	    isShared: this.boolean(false),
	  };
	}
}

export default File;
