import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { MenuItem } from 'types/MenuItem';

import { docViewerSaga } from '../saga';
import { docViewerActions as actions, reducer } from '../slice';

const table = new Map<string, MenuItem>();
vi.mock('store/db', () => ({
  default: {
    menuItems: {
      get: async (id: string) => table.get(id),
      bulkPut: async (items: MenuItem[]) => items.forEach(item => table.set(item.id, item)),
      where: () => ({
        equals: (parentId: string) => ({
          toArray: async () => [...table.values()].filter(item => item.parentId === parentId),
        }),
      }),
    },
  },
}));
vi.mock('utils/githubApi', () => ({
  default: async () => ({
    tree: ['README.md', 'guide/setup/install.md', 'guide/intro.md'].map(path => ({
      path,
      type: 'blob',
      url: `blob:${path}`,
    })),
  }),
}));
// the chapter content itself is not under test
vi.mock('utils/fetchMdContent', () => ({ default: () => new Promise(() => {}) }));

describe('opening a chapter', () => {
  it('expands its folders and marks it active', async () => {
    table.clear();
    const sagaMiddleware = createSagaMiddleware();
    const store = configureStore({
      reducer: { docViewer: reducer },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
    });
    sagaMiddleware.run(docViewerSaga);

    store.dispatch(
      actions.openBook({
        provider: 'github',
        username: 'u',
        repository: 'r',
        base64FilePath: encodeURIComponent(btoa('guide/setup/install.md')),
      }),
    );
    await new Promise(resolve => setTimeout(resolve, 50));

    const { menuItems, lastActiveMenuItem } = store.getState().docViewer;
    expect(menuItems.map(({ text }) => text)).toEqual([
      'Introduction',
      'guide',
      'setup',
      'install.md',
      'intro.md',
    ]);
    expect(lastActiveMenuItem?.text).toBe('install.md');
  });
});
