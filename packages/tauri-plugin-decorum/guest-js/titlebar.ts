import { core as tauriCore, window as tauriWindow } from '@tauri-apps/api';

function createTitleBarContainer() {
	let tbEl = document.querySelector<HTMLDivElement>("[data-tauri-decorum-tb]");
	if (tbEl) return null;

	console.log(
		"DECORUM: Element with data-tauri-decorum-tb not found. Creating one.",
	);

	// Create titlebar element
	tbEl = document.createElement("div");
	tbEl.setAttribute("data-tauri-decorum-tb", "");
	tbEl.style.top = '0px';
	tbEl.style.left = '0px';
	tbEl.style.zIndex = '100';
	tbEl.style.width = "100%";
	tbEl.style.height = "32px";
	tbEl.style.display = "flex";
	tbEl.style.position = "fixed";
	tbEl.style.alignItems = "end";
	tbEl.style.justifyContent = "end";
	tbEl.style.backgroundColor = "transparent";

	// Create draggable area
	const drag = document.createElement("div");
	drag.style.width = "100%";
	drag.style.height = "100%";
	drag.style.background = "transparent";
	drag.setAttribute("data-tauri-drag-region", "");
	tbEl.appendChild(drag);

	// add tbEl to the body
	document.body.appendChild(tbEl);

	return tbEl;
}

function createTitleBarControls(container: HTMLElement,  win: tauriWindow.Window) {
  const createControlButton = (id: string) => {
    const btn = document.createElement("button");
    btn.id = "decorum-tb-" + id;
    btn.classList.add("decorum-tb-btn");
  
    let timer: ReturnType<typeof setTimeout>;
    const show_snap_overlay = () => {
      win.setFocus().then(() => tauriCore.invoke("plugin:decorum|show_snap_overlay"));
    };
  
    switch (id) {
      case "minimize":
        btn.innerHTML = "\uE921";
  
        btn.addEventListener("click", () => {
          clearTimeout(timer);
          win.minimize();
        });
  
        break;
      case "maximize":
        btn.innerHTML = "\uE922";
        win.onResized(() => {
          win.isMaximized().then((maximized) => {
            if (maximized) {
              btn.innerHTML = "\uE923";
            } else {
              btn.innerHTML = "\uE922";
            }
          });
        });
  
        btn.addEventListener("click", () => {
          clearTimeout(timer);
          win.toggleMaximize();
        });
        btn.addEventListener("mouseleave", () => clearTimeout(timer));
        btn.addEventListener("mouseenter", () => {
          timer = setTimeout(show_snap_overlay, 620);
        });
        break;
      case "close":
        btn.innerHTML = "\uE8BB";
        btn.addEventListener("click", () => win.close());
        break;
    }
  
    return btn;
  }

  ["minimize", "maximize", "close"].forEach((id) => {
    container.appendChild(createControlButton(id));
  });
}
function createTitleBar() {
	const container = createTitleBarContainer();
  if (!container) return;

	const win = tauriWindow.getCurrentWindow();
  createTitleBarControls(container, win);
  
  const style = document.createElement("style");
  document.head.appendChild(style);

  style.innerHTML = `
    .decorum-tb-btn {
      cursor: default;
      width: 58px;
      height: 32px;
      border: none;
      padding: 0px;
      outline: none;
      display: flex;
      font-size: 10px;
      font-weight: 300;
      box-shadow: none;
      border-radius: 0;
      align-items: center;
      justify-content: center;
      transition: background 0.1s;
      background-color: transparent;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-family: 'Segoe Fluent Icons', 'Segoe MDL2 Assets';
    }

    .decorum-tb-btn:hover {
      background-color: rgba(0,0,0,0.2);
    }

    #decorum-tb-close:hover {
      background-color: rgba(255,0,0,0.7) !important;
    }
  `;
}


document.addEventListener("DOMContentLoaded", () => {
  createTitleBar();
});