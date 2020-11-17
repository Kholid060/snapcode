import { auth, apiFetch } from './firebase';
import store from '~/store';
import { getTimestamp } from './helper';

function mergeData(modelName, newData) {
  const model = store.$db().model(modelName);
  const data = model.all();

  data.forEach((item) => {
  	const itemIndex = newData.findIndex(({ id }) => id === item.id);

  	if (itemIndex === -1 && !item.isNew) {
  		model.$delete(item.id);
  	} else if (itemIndex !== -1) {
		  model.$update({
		    where: item.id,
		    data: {
		    	...newData[itemIndex],
		    	createdAt: getTimestamp(newData[itemIndex].createdAt),
		    },
		  });
    
    	newData.splice(itemIndex, 1);
  	}
  });

  model.$update({
  	data: newData.map((item) => ({
  		...item,
  		createdAt: getTimestamp(item.createdAt),
  	})),
  });
}

export default async function () {
  if (!auth.user) return;

  const lastBackup = +localStorage.getItem('lastBackup');
  const data = await apiFetch(`/sync?timestamp=${lastBackup}`);

  if (data.empty) return;

  mergeData('folders', data.folders);
  mergeData('files', data.files);

  localStorage.setItem(
  	'lastBackup', data.lastBackup ? getTimestamp(data.lastBackup) : Date.now(),
  );
}
