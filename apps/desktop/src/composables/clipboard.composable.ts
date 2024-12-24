import { writeText } from '@tauri-apps/plugin-clipboard-manager';

export function useCopyText() {
  const copied = shallowRef(false);

  async function copyText(text: string) {
    await writeText(text);
    copied.value = true;

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }

  return {
    copied,
    copyText,
  };
}
