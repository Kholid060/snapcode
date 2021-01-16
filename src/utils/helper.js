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

export function debounce(callback, time = 200) {
  let interval;

  return (...args) => {
    clearTimeout(interval);

    return new Promise((resolve) => {
      interval = setTimeout(() => {
        interval = null;

        callback(...args);
        resolve();
      }, time);
    });
  };
}

export function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;

  document.body.appendChild(textarea);

  textarea.select();

  document.execCommand('copy');
  document.body.removeChild(textarea);
}
