import Codemirror from 'codemirror';
import { getLangInfo } from '~/utils/languages';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/mode/loadmode';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';
import '~/assets/css/themes/one-dark.css';
import '~/assets/css/themes/one-light.css';

function loadMode(instance) {
  const languageMime = instance.getOption('mode');
  const currentMode = getLangInfo(languageMime);

  if (!currentMode) return;

  injectCodemirrorScript(`/mode/${currentMode}/${currentMode}.js`)
    .then(() => {
      setTimeout(() => {
        instance.setOption('mode', currentMode);
        CodeMirror.autoLoadMode(instance, currentMode);
      }, 100);
    })
    .catch(() => {});
}

export function injectCodemirrorScript(path) {
  return new Promise((resolve, reject) => {
    const url = import.meta.env.VITE_CODEMIRROR_CDN + path;
    const scriptId = `cm-${path.replace(/\//g, '-')}`;
    const isScriptExist = document.getElementById(scriptId);

    if (isScriptExist || !path) return reject(scriptId);

    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const requiredModules = (text.match(/require\((.*?)\)/g) || []).reduce((modules, key) => {
          if (key.includes('lib') || key.includes('codemirror')) return modules;

          let modulePath = key.replace(/["()]|require|\.\.\//g, '');
          const folder = key.match(/\.\.\//g);

          if (folder.length === 1 && !modulePath.startsWith('addon')) {
            modulePath = `mode/${modulePath}`;
          }

          modules.push(injectCodemirrorScript(`/${modulePath}.js`));

          return modules;
        }, []);

        const scriptTag = document.createElement('script');

        scriptTag.setAttribute('id', scriptId);
        scriptTag.setAttribute('type', 'text/javascript');

        scriptTag.innerHTML = text;

        if (requiredModules.length !== 0) {
          Promise.allSettled(requiredModules).then(() => {
            document.body.appendChild(scriptTag);
            resolve();
          });

          return;
        }

        document.body.appendChild(scriptTag);
        resolve();
      });
  });
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
