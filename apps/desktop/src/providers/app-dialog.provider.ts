import { ButtonVariants } from '@snippy/ui';

export const APP_DIALOG_PROVIDER_KEY = Symbol('app-dialog');

export interface AppDialogSelectDataOptions {
  type: 'folder' | 'snippet';
  title?: string;
}

export type AppDialogSelectDataResult =
  | {
      data: null;
      canceled: true;
    }
  | {
      canceled: false;
      data: { id: string; path: string };
    };
export interface AppDialogSelectData {
  type: 'select-data';
  options?: AppDialogSelectDataOptions;
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
  selectData(
    options?: AppDialogSelectDataOptions,
  ): Promise<AppDialogSelectDataResult>;
  confirm(options: AppDialogConfirmOptions): Promise<AppDialogConfirmResult>;
  prompt(options: AppDialogPromptOptions): Promise<AppDialogPromptResult>;
}

export type AppDialogItems =
  | AppDialogPrompt
  | AppDialogConfirm
  | AppDialogSelectData;

export function useAppDialog() {
  const value = inject(APP_DIALOG_PROVIDER_KEY) as AppDialogProvider;

  return value;
}
