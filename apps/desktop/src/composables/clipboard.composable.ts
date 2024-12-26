import { useToast } from '@snippy/ui';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

export function useCopyText() {
  const { toast } = useToast();

  const copied = shallowRef(false);

  async function copyText(text: string, showToast = false) {
    if (copied.value) return;

    await writeText(text);
    copied.value = true;

    if (showToast) {
      toast({ title: 'Copied to clipboard' });
    } else {
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  }

  return {
    copied,
    copyText,
  };
}
