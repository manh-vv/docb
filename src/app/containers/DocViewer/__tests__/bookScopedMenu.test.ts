import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { MenuItem } from 'types/MenuItem';

import { docViewerSaga } from '../saga';
import { docViewerActions as actions, reducer } from '../slice';

// An in-memory stand-in for the Dexie table, shared by every book like the real one
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

const trees: Record<string, string[]> = {
  docb: ['README.md', 'CLAUDE.md', 'a/docs/x.md', 'b/docs/y.md'],
  other: ['README.md', 'CHANGELOG.md'],
};
vi.mock('utils/githubApi', () => ({
  default: async (path: string) => {
    const repo = path.split('/')[3];
    return { tree: trees[repo].map(p => ({ path: p, type: 'blob', url: `blob:${repo}/${p}` })) };
  },
}));

function setup() {
  table.clear();
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { docViewer: reducer },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
  });
  sagaMiddleware.run(docViewerSaga);

  const settle = () => new Promise(resolve => setTimeout(resolve, 50));
  const visible = () => store.getState().docViewer.menuItems.map(({ text }) => text);
  const open = async (repository: string) => {
    store.dispatch(actions.openBook({ provider: 'github', username: 'u', repository }));
    await settle();
  };
  const expand = async (text: string) => {
    const item = store.getState().docViewer.menuItems.find(i => i.text === text)!;
    store.dispatch(actions.handleClickOnMenuItem(item));
    await settle();
  };
  return { store, open, expand, visible };
}

describe('book scoped menu items', () => {
  it('lists only the open book after switching books', async () => {
    const { store, open, expand, visible } = setup();

    await open('docb');
    store.dispatch(actions.closeBook());
    await open('other');
    await expand('Introduction');

    expect(visible()).toEqual(['Introduction', 'README.md', 'CHANGELOG.md']);
  });

  it('reloads the sidebar when going straight to another book', async () => {
    const { open, visible } = setup();

    await open('docb');
    await open('other');

    expect(visible()).toEqual(['Introduction']);
  });

  it('keeps folders with the same name apart', async () => {
    const { open, expand, visible } = setup();

    await open('docb');
    await expand('a');
    await expand('docs');

    expect(visible()).toEqual(['Introduction', 'a', 'docs', 'x.md', 'b']);
  });
});
