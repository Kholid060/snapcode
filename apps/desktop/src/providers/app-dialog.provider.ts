import { FolderId } from '@/interface/folder.interface';
import { ButtonVariants } from '@snippy/ui';

export const APP_SELECT_FOLDER_PROVIDER_KEY = Symbol('app-select-folder');

export interface AppDialogSelectFolderOptions {
  title?: string;
}
export interface AppDialogSelectFolderResult {
  canceled: boolean;
  folderId: FolderId | null;
}
export interface AppDialogSelectFolder {
  type: 'select-folder';
  options?: AppDialogSelectFolderOptions;
}

export interface AppDialogConfirm {
  type: 'confirm';
  options: AppDialogConfirmOptions;
}
export interface AppDialogConfirmOptions {
  title: string;
  body?: string;
  okBtnLabel?: string;
  showDontAsk?: boolean;
  cancelBtnLabel?: string;
  okBtnVariant?: ButtonVariants['variant'];
}
export type AppDialogConfirmResult = {
  isConfirmed: boolean;
  dontAskValue: boolean;
};

export interface AppDialogPrompt {
  type: 'prompt';
  options: AppDialogPromptOptions;
}
export interface AppDialogPromptOptions {
  title?: string;
  label?: string;
  okBtnLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  cancelBtnLabel?: string;
  okBtnVariant?: ButtonVariants['variant'];
}
export interface AppDialogPromptResult {
  value: string;
  canceled: boolean;
}

export interface AppDialogProvider {
  selectFolder(
    options?: AppDialogSelectFolderOptions,
  ): Promise<AppDialogSelectFolderResult>;
  confirm(options: AppDialogConfirmOptions): Promise<AppDialogConfirmResult>;
  prompt(options: AppDialogPromptOptions): Promise<AppDialogPromptResult>;
}

export type AppDialogItems =
  | AppDialogPrompt
  | AppDialogConfirm
  | AppDialogSelectFolder;

export function useAppDialog() {
  const value = inject(APP_SELECT_FOLDER_PROVIDER_KEY) as AppDialogProvider;

  return value;
}
