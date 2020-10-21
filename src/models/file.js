import { Model } from '@vuex-orm/core';
import { v4 as uuid } from 'uuid';

class File extends Model {
	static entity = 'files'

	static primaryKey = 'id'

	static fields() {
	  return {
	    id: this.uid(() => uuid()),
	    folderId: this.attr(null),
	    name: this.string('my code'),
	    language: this.string('javascript'),
	    code: this.string(''),
	    starred: this.boolean(false),
	    isShared: this.boolean(false),
	  };
	}
}

export default File;
