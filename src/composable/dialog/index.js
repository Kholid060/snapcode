import { createApp } from 'vue';
import DialogContainer from './components/DialogContainer.vue';

function mountDialog(type, options) {
  const dialog = createApp(DialogContainer, {
    type,
    options,
  });
  const component = dialog.mount(document.createElement('div'));

  document.body.appendChild(component.$el);

  return dialog;
}

export default function () {
  const confirm = (options = {}) => {
    mountDialog('confirm', options);
  };
  const prompt = (options) => {
    mountDialog('prompt', options);
  };

  return {
    prompt,
    confirm,
  };
}
