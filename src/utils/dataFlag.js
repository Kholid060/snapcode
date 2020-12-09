import store from '~/store';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default {
  getAllUpdated(model) {
    return store.$db().model(model)
		  .query()
		  .where(({ isEdited, isNew }) => isEdited || isNew)
		  .get();
  },
  getAllDeleted(model) {
    return JSON.parse(localStorage.getItem(`deleted${capitalize(model)}`)) || [];
  },
  cleanAllFlag(model, ids) {
    return new Promise((resolve) => {
      ids.forEach((item) => {
		    store.$db().model(model).$update({
		      where: typeof item === 'string' ? item : item.id,
		      data: {
		        isEdited: false,
		        isNew: false,
		      },
		    });
		  });

		  localStorage.setItem(`deleted${capitalize(model)}`, JSON.stringify([]));

		  resolve();
    });
  },
};
