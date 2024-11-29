export const APP_SELECT_FOLDER_PROVIDER_KEY = Symbol('app-select-folder');

export interface AppSelectFolderOptions {
  title?: string;
}

export interface AppSelectFolderResult {
  canceled: boolean;
  folderId: string | null;
}

export interface AppSelectFolderProvider {
  selectFolder(
    options?: AppSelectFolderOptions,
  ): Promise<AppSelectFolderResult>;
}

export function useSelectFolder() {
  const value = inject(
    APP_SELECT_FOLDER_PROVIDER_KEY,
  ) as AppSelectFolderProvider;

  return {
    open: value.selectFolder,
  };
}
