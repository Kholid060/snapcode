import { EditorSettings } from '@/interface/editor.interface';
import { APP_EDITOR_FONTS, AppEditorFonts } from './const/app.const';
import { fontLoader } from './helper';

const loadedFonts: Set<AppEditorFonts> = new Set(['jetbrains-mono']);
export async function loadEditorFontSettings(
  editorContainer: HTMLElement,
  settings: EditorSettings,
) {
  if (
    settings.fontFamily !== 'custom' &&
    !loadedFonts.has(settings.fontFamily)
  ) {
    const fontData = APP_EDITOR_FONTS[settings.fontFamily];
    fontLoader(
      fontData.name,
      fontData.fonts.map((font) => ({
        url: `url("/fonts/${fontData.id}/${font.name}")`,
        descriptors: {
          display: 'swap',
          style: 'normal',
          weight: font.weight.toString(),
        },
      })),
    ).then(() => {
      loadedFonts.add(settings.fontFamily as AppEditorFonts);
    });
  }

  editorContainer.style.setProperty(
    '--editor-font-family',
    settings.fontFamily === 'custom'
      ? settings.customFont
      : APP_EDITOR_FONTS[settings.fontFamily].name,
  );
  editorContainer.style.setProperty(
    '--editor-font-size',
    `${settings.fontSize}px`,
  );

  if (settings.fontLigatures) {
    editorContainer.style.fontVariantLigatures = '"liga", "calt"';
    editorContainer.style.removeProperty('font-variant-ligatures');
  } else {
    editorContainer.style.setProperty('font-feature-settings', 'normal');
    editorContainer.style.setProperty('font-variant-ligatures', 'none');
  }
}
