import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';
import { updateDataChange } from '~/utils/helper';
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
	    isEdited: this.boolean(false),
	    isNew: this.boolean(false),
	  };
	}

	static afterUpdate(model) {
	  updateDataChange(model);
	}

	static afterWhere(folders) {
	  /* eslint-disable no-param-reassign */
	  return folders.map((folder) => {
	    delete folder.$id;
	    delete folder.isEdited;

	    return folder;
	  });
	}

	static afterDelete(model) {
	  if (model.isNew) return;
		
	  updateDataChange(model);

	  const deletedFolderIds = JSON.parse(localStorage.getItem('deletedFolders')) || [];

	  deletedFolderIds.push(model.id);
	
	  localStorage.setItem('deletedFolders', JSON.stringify(deletedFolderIds));
	}
}

export default Folder;
