import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { MenuItem } from 'types/MenuItem';

import { docViewerSaga } from '../saga';
import { docViewerActions as actions, reducer } from '../slice';

const branch: MenuItem = {
  id: 'docs',
  text: 'docs',
  type: 'branch',
  order: 0,
  level: 0,
  active: false,
  childIds: ['docs/a.md', 'docs/b.md'],
};
const children: MenuItem[] = ['docs/a.md', 'docs/b.md'].map(id => ({
  id,
  text: id,
  type: 'file',
  order: 0,
  level: 1,
  active: false,
  parentId: 'docs',
}));

// IndexedDB lookups resolve asynchronously, which is what lets clicks overlap
vi.mock('store/db', () => ({
  default: {
    menuItems: {
      where: () => ({
        equals: () => ({
          toArray: () => new Promise(resolve => setTimeout(() => resolve(children), 10)),
        }),
      }),
    },
  },
}));

function setup() {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { docViewer: reducer },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
  });
  sagaMiddleware.run(docViewerSaga);
  store.dispatch(actions.updateMenuItems([branch]));

  // Like the sidebar does: each click sends the item as currently rendered
  const click = () => {
    const item = store.getState().docViewer.menuItems.find(({ id }) => id === branch.id)!;
    store.dispatch(actions.handleClickOnMenuItem(item));
  };
  const settle = () => new Promise(resolve => setTimeout(resolve, 100));
  const ids = () => store.getState().docViewer.menuItems.map(({ id }) => id);
  const isExpanded = () => store.getState().docViewer.menuItems[0].active;

  return { click, settle, ids, isExpanded };
}

describe('handleClickOnMenuItem', () => {
  it('expands and collapses a branch on single clicks', async () => {
    const { click, settle, ids, isExpanded } = setup();

    click();
    await settle();
    expect(isExpanded()).toBe(true);
    expect(ids()).toEqual(['docs', 'docs/a.md', 'docs/b.md']);

    click();
    await settle();
    expect(isExpanded()).toBe(false);
    expect(ids()).toEqual(['docs']);
  });

  it('ends collapsed with no children shown after a double click', async () => {
    const { click, settle, ids, isExpanded } = setup();

    click();
    click();
    await settle();

    expect(isExpanded()).toBe(false);
    expect(ids()).toEqual(['docs']);
  });

  it('shows children only once after rapid repeated clicks', async () => {
    const { click, settle, ids, isExpanded } = setup();

    click();
    click();
    click();
    await settle();

    expect(isExpanded()).toBe(true);
    expect(ids()).toEqual(['docs', 'docs/a.md', 'docs/b.md']);
  });
});
