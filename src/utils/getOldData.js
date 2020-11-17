import Dexie from 'dexie';
import { nanoid } from 'nanoid';
import languages from './languages';
import { Folder } from '~/models';

const db = new Dexie('snapcode');
db.version(1).stores({
  folders: 'id, name',
  files: 'folderId, data',
  tags: 'id, name',
});

function getLanguageByMode(mode) {
  const languagesArr = Object.keys(languages);
  const findLanguage = languagesArr.find((language) => languages[language].mode === mode);

  return findLanguage;
}

function convertFiles(files) {
  const fileIds = Object.keys(files);

  if (fileIds.length === 0) return null;

  const convertedFiles = fileIds.map((id) => {
  	const {
      content, star, title, createDate, mode, 
    } = files[id];
  	const language = getLanguageByMode(mode);
  	
  	/* eslint-disable-next-line */
  	delete files[id].folderId;

  	return {
	  	id: nanoid(),
	  	language,
	  	code: content,
	  	starred: star,
	  	name: title,
	  	createdAt: createDate,
	  	isEdited: true,
	  	isNew: true,
  	};
  });

  return convertedFiles;
}

function getFolderById(folders, id) {
  return folders.find((folder) => folder.id === id) || { name: '' };
}

function convertData(files, folders) {
  const convertedData = files.reduce((data, file) => {
  	const { name } = getFolderById(folders, file.folderId);
  	const convertedFiles = convertFiles(file.data);

  	data.push({
  		name,
  		id: nanoid(),
  		isNew: true,
  		isEdited: true,
  		files: convertedFiles,
  	});

  	db.folders.delete(file.folderId);

  	return data;
  }, []);

  return convertedData;
}

export default async function () {
  try {
	  const files = await db.files.toArray();
	  const folders = await db.folders.toArray();

	  if (files.length === 0 && folders.length === 0) return;

	  const convertedData = convertData(files, folders);

	  await Folder.$update({
	  	data: convertedData,
	  });
	  await db.delete();
  } catch (error) {
    console.error(error);
  }
}
