export function getTimestamp(date) {
  return (new Date(date)).getTime();
}

export function updateDataChange(model) {
  const store = model.$store();

  store.commit('updateState', {
    key: 'isDataChanged',
    value: true,
  });
  
  localStorage.setItem('isDataChanged', 'true');
}
