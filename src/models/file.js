import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';

class File extends Model {
	static entity = 'files'

	static primaryKey = 'id'

	static fields() {
	  return {
	    id: this.uid(() => nanoid()),
	    folderId: this.attr(null),
	    name: this.string(''),
	    language: this.string('javascript'),
	    code: this.string(''),
	    starred: this.boolean(false),
	    createdAt: this.number(Date.now()),
	    isShared: this.boolean(false),
	    isEdited: this.boolean(false),
	    isNew: this.boolean(false),
	  };
	}

	static afterWhere(files) {
	  /* eslint-disable no-param-reassign */
	  return files.map((file) => {
	    delete file.$id;
	    delete file.isEdited;

	    return file;
	  });
	}

	static afterUpdate(model) {
	  model.$store().commit('updateState', {
	    key: 'isDataChanged',
	    value: true,
	  });
	}

	static afterDelete(model) {
	  const deletedFiles = JSON.parse(localStorage.getItem('deletedFiles')) || [];

	  deletedFiles.push(model.id);
	
	  localStorage.setItem('deletedFiles', JSON.stringify(deletedFiles));
	}
}

export default File;
