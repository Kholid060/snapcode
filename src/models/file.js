import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';

class File extends Model {
  static entity = 'files';

  static primaryKey = 'id';

  static fields() {
    return {
      id: this.uid(() => nanoid()),
      folderId: this.attr(null),
      name: this.string(''),
      language: this.string('text/javascript'),
      code: this.string(''),
      starred: this.boolean(false),
      createdAt: this.number(Date.now()),
      isShared: this.boolean(false),
      isEdited: this.boolean(false),
      isProtected: this.boolean(false),
      isNew: this.boolean(false),
    };
  }

  static afterWhere(files) {
    const validFiles = [];

    files.forEach((file) => {
      const isValidFile = file.name !== '' && file.folderId !== null;

      if (isValidFile) {
        delete file.$id;
        delete file.isEdited;

        validFiles.push(file);
      }
    });

    return validFiles;
  }
}

export default File;
