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
	    lastUpdated: this.number(Date.now()),
	    isShared: this.boolean(false),
	    isEdited: this.boolean(false),
	  };
	}

	static beforeUpdate(model) {
	  /* eslint-disable no-param-reassign */
	  model.isEdited = true;
	  model.lastUpdated = Date.now();
	}

	static afterDelete(model) {
	  const deletedFileIds = JSON.parse(localStorage.getItem('deletedFiles')) || [];

	  deletedFileIds.push(model.id);
	
	  localStorage.setItem('deletedFiles', JSON.stringify(deletedFileIds));
	}
}

export default File;
