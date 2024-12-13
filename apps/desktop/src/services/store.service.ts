import LazyStore from '@/lib/LazyStore';

interface AppStore {
  autoUpdate: boolean;
}

export const store = new LazyStore<AppStore>('settings.json');
