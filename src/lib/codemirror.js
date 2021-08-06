import Codemirror from 'codemirror';
import { getLangInfo } from '~/utils/languages';
import 'codemirror/mode/meta';
import 'codemirror/addon/mode/loadmode';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';
import '~/assets/css/themes/one-dark.css';
import '~/assets/css/themes/one-light.css';

function injectCodemirrorScript(path) {
  return new Promise((resolve, reject) => {
    const url = import.meta.env.VITE_CODEMIRROR_CDN + path;
    const scriptId = `cm-${path.replace(/\//g, '-')}`;
    const isScriptExist = document.getElementById(scriptId);

    if (isScriptExist || !path) return reject();

    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const requiredModules = (text.match(/require\((.*?)\)/g) || []).reduce((modules, key) => {
          if (key.includes('lib') || key.includes('codemirror')) return modules;

          let modulePath = key.replace(/["()]|require|\.\.\//g, '');
          const folder = key.match(/\.\.\//g);

          if (folder.length === 1) {
            modulePath = `mode/${modulePath}`;
          }

          modules.push(injectCodemirrorScript(`/${modulePath}.js`));

          return modules;
        }, []);

        const scriptTag = document.createElement('script');

        scriptTag.setAttribute('id', scriptId);
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('src', url);

        scriptTag.onload = resolve;

        if (requiredModules.length !== 0) {
          Promise.allSettled(requiredModules).then(() => {
            document.body.appendChild(scriptTag);
          });

          return;
        }

        document.body.appendChild(scriptTag);
      });
  });
}

function loadMode(instance) {
  const languageMime = instance.getOption('mode');
  const currentMode = getLangInfo(languageMime);

  if (!currentMode) return;

  injectCodemirrorScript(`/mode/${currentMode}/${currentMode}.js`)
    .then(() => {
      instance.setOption('mode', currentMode);
      CodeMirror.autoLoadMode(instance, currentMode);
    })
    .catch(() => {});
}

export function initCodemirror(element, options) {
  window.CodeMirror = Codemirror;

  const instance = new Codemirror(element, {
    mode: 'text/javascript',
    theme: 'one-dark',
    keymap: 'sublime',
    tabSize: 2,
    closeBrackets: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    lineNumbers: true,
    line: true,
    ...options,
  });

  instance.loadMode = loadMode;
  instance.destroy = function () {
    const els = document.querySelectorAll('script[id*="cm-"]');

    els.forEach((el) => {
      el.remove();
    });

    element.remove();

    window.CodeMirror = null;
  };

  loadMode(instance);

  return instance;
}

export default Codemirror;
