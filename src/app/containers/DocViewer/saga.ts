import sha256 from 'crypto-js/sha256';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import db from 'store/db';
import createBranch, { ROOT_ID } from 'types/createBranch';
import createLeaf from 'types/createLeaf';
import { MenuItem } from 'types/MenuItem';
import fetchMdContentHelper from 'utils/fetchMdContent';
import getStorage from 'utils/getStorage';
import githubApi from 'utils/githubApi';

import { selectLastActiveMenuItem, selectMenuItems, selectSelectedBook } from './selectors';
import { docViewerActions as actions } from './slice';

export function findMenuItemById(id: string): Promise<MenuItem> {
  return db.menuItems.get(id).then(rs => {
    return rs as MenuItem;
  });
}

export function* fetchMdContent(action) {
  const {
    payload: { base64FilePath },
  } = action;

  if (!base64FilePath) {
    return;
  }

  const path = atob(decodeURIComponent(base64FilePath));
  const menuItem = yield call(findMenuItemById, path);

  if (!menuItem) {
    return;
  }

  const { content } = yield call(fetchMdContentHelper, menuItem.url);

  yield put(actions.convertMdToHtml(atob(content)));
}

function githupConverter(mdContent: string): Promise<string> {
  const url = 'https://api.github.com/markdown';

  const options: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      text: mdContent,
    }),
  };

  const key = `fetch:${url}:${sha256(JSON.stringify(options))}`;

  const data = getStorage(true).getItem(key);
  if (data) {
    return Promise.resolve(data);
  }

  return fetch(url, options)
    .then(res => res.text())
    .then(res => {
      getStorage(true).setItem(key, res);
      return res;
    });
}

export function* convertMdToHtml(action) {
  const { payload } = action;
  const htmlContent = yield call(githupConverter, payload);

  yield put(actions.updateHtmlContent(htmlContent));
}

/**
 *
 * @param items interface Item {
 *    name: string;
 *    path: string;
 *    git_url: string;
 *  }
 * @param prefixHref
 * @returns return the list of item level 0 (top level)
 */
export function createMenuItemFromFilePath(items: any[], prefixHref: string): Promise<MenuItem[]> {
  // TODO: prefix href can be used as a uniq id so that we can cache this value using this key

  const listOfLevel0Items: MenuItem[] = [];
  const map: Map<string, MenuItem> = new Map(); // cache created item so that we dont' need to receate it

  items.forEach(item => {
    const { name, path, git_url } = item;
    const keys = path.split('/');

    if (keys.length === 1 && !map.has(ROOT_ID)) {
      // create introduction level item
      const mi = createBranch(ROOT_ID, 'Introduction');
      map.set(mi.id, mi);
      listOfLevel0Items.unshift(mi);
    }

    keys.forEach((k, i) => {
      // if it is the last item then it is a leaf
      if (i === keys.length - 1) {
        const parentId = keys.length > 1 ? keys[i - 1] : ROOT_ID;

        const mi = createLeaf(path, name);
        mi.url = git_url;
        mi.href = `${prefixHref}/${encodeURIComponent(btoa(path))}`;

        const parent = map.get(parentId) as MenuItem;
        parent.childIds?.push(mi.id);
        mi.parentId = parent.id;
        mi.level = parent.level + 1;

        map.set(mi.id, mi);
      } else if (!map.has(k)) {
        const mi = createBranch(k);
        if (i > 0) {
          const parent = map.get(keys[i - 1]) as MenuItem;
          parent.childIds?.push(mi.id);
          mi.parentId = parent.id;
          mi.level = parent.level + 1;
        } else {
          listOfLevel0Items.push(mi);
        }

        map.set(mi.id, mi);
      }
    });
  });

  // store in database
  return db.menuItems.bulkPut(Array.from(map.values())).then(() => listOfLevel0Items);
}

/**
 * - a repository is a book
 * - chapter is path of md file
 */
export function* fetchBigChapter(action) {
  // if the menu items had been already filled then we can pass this action
  const menuItems = yield select(selectMenuItems);
  if (menuItems && menuItems.length) {
    return;
  }

  const {
    payload: { provider, username, repository, base64FilePath },
    payload,
  } = action;

  const usp = new URLSearchParams();
  usp.append('q', `extension:md repo:${username}/${repository}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const res = yield call(githubApi, `/search/code?${usp.toString()}`);

  // create menu items from file path and update local database
  const level0MenuItems: MenuItem[] = yield call(
    createMenuItemFromFilePath,
    res.items,
    `/viewer/${provider}/${username}/${repository}`,
  );

  yield put(actions.updateMenuItems(level0MenuItems));

  if (base64FilePath) {
    yield put(actions.fetchMdContent(payload));
  } else {
    yield put(actions.updateHtmlContent(''));
  }
}

export function* openBook(action) {
  const {
    payload,
    payload: { base64FilePath },
  } = action;

  yield put(actions.updateSelectedBook(payload));

  // if the menu items had been already filled then we don't have to reload big chapters
  const menuItems = yield select(selectMenuItems);
  if (!(menuItems && menuItems.length)) {
    yield put(actions.fetchBigChapter(payload));
  } else {
    if (base64FilePath) {
      yield put(actions.fetchMdContent(payload));
    } else {
      yield put(actions.updateHtmlContent(''));
    }
  }
}

export function* closeBook() {
  yield put(actions.updateMenuItems([]));
}

export function createMenuItemFromHTag(hTag: HTMLHeadingElement, index: number): MenuItem {
  const aTag = hTag.getElementsByTagName('a')[0];

  return {
    id: aTag?.getAttribute('id') as string,
    active: false,
    level: +hTag.tagName.substr(1),
    order: index,
    text: hTag.innerText,
    type: 'hash',
    href: aTag?.getAttribute('href') as string,
  };
}

export function* buildMenuItemsFromHtml() {
  // find current big chapter
  const selectedBook = yield select(selectSelectedBook);
  const path = atob(decodeURIComponent(selectedBook.base64FilePath));
  const activeChapter: MenuItem = yield findMenuItemById(path);
  if (!activeChapter) {
    throw new Error('menu items are not ready');
  }

  if (activeChapter.childIds && activeChapter.childIds.length) {
    // don't need to rebuild menu items
    return;
  }

  const elMd = document.getElementById('id-md-viewer');
  const hTags = elMd?.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const rs: MenuItem[] = [];
  const levelStack: MenuItem[] = [];
  let smallestLevel = 6;

  hTags?.forEach((hTag, key) => {
    const menuItem = createMenuItemFromHTag(hTag as HTMLHeadingElement, key);
    rs.push(menuItem);

    let lastLowerLevelItem;
    do {
      lastLowerLevelItem = levelStack.pop();
    } while (lastLowerLevelItem && lastLowerLevelItem.level >= menuItem.level);

    if (lastLowerLevelItem) {
      levelStack.push(lastLowerLevelItem);
      if (!lastLowerLevelItem.childIds) {
        lastLowerLevelItem.childIds = [];
      }
      lastLowerLevelItem.childIds.push(menuItem.id);
      menuItem.parentId = lastLowerLevelItem.id;
    }

    levelStack.push(menuItem);

    if (smallestLevel > menuItem.level) {
      smallestLevel = menuItem.level;
    }
  });

  if (activeChapter) {
    rs.filter(({ level }) => level === smallestLevel).forEach(item => {
      if (!activeChapter.childIds) {
        activeChapter.childIds = [];
      } else {
        activeChapter.childIds = [...activeChapter.childIds];
      }

      activeChapter.childIds.push(item.id);
      item.parentId = activeChapter.id;
    });

    rs.forEach(item => {
      item.level += activeChapter.level;
    });

    yield call([db.menuItems, 'bulkPut'], rs.concat(activeChapter));

    const lastActiveMenuItem = yield select(selectLastActiveMenuItem);
    if (
      lastActiveMenuItem &&
      lastActiveMenuItem.id === activeChapter.id &&
      (!lastActiveMenuItem.childIds || !lastActiveMenuItem.childIds.length)
    ) {
      const updateMenuItem = { ...lastActiveMenuItem, childIds: activeChapter.childIds };
      yield put(actions.updateMenuItem(updateMenuItem));

      const childMenuItems = yield call(findChildItems, updateMenuItem.id);
      yield put(
        actions.showChildItems({
          menuItem: updateMenuItem,
          menuItems: childMenuItems,
        }),
      );
    }
  }
}

export function findChildItems(parentId: string): Promise<MenuItem[]> {
  return db.menuItems.where('parentId').equals(parentId).toArray();
}

export function* handleClickOnMenuItem(action) {
  let { payload: menuItem } = action;
  const menuItems: MenuItem[] = yield select(selectMenuItems);
  const index = menuItems.findIndex(({ id }) => id === menuItem.id);

  if (index === -1) {
    return;
  }

  const lastActiveMenuItem = yield select(selectLastActiveMenuItem);
  if (lastActiveMenuItem && lastActiveMenuItem.index === index) {
    return; // do nothing since click on the same item
  }

  const hasChildren = menuItem.childIds && menuItem.childIds.length;
  const active = hasChildren ? !menuItem.active : true;

  const updateMenuItem = { ...menuItem, active };

  yield put(actions.updateMenuItem(updateMenuItem));

  if (hasChildren) {
    if (active) {
      const childItems = yield call(findChildItems, menuItem.id);

      yield put(
        actions.showChildItems({
          menuItem: updateMenuItem,
          menuItems: childItems,
        }),
      );
    } else {
      yield put(
        actions.hideChildItems({
          menuItem: updateMenuItem,
        }),
      );
    }
  }
}

export function* restoreLastActiveMenuItems(action) {
  const {
    payload: { base64FilePath },
  } = action;

  const menuItemId = atob(decodeURIComponent(base64FilePath));
  let cur = yield call(findMenuItemById, menuItemId);
  // its parent and ancestors also active too
  const stack: MenuItem[] = [cur];
  while (cur.parentId) {
    cur = yield call(findMenuItemById, cur.parentId);
    stack.push(cur);
  }
}

export function* docViewerSaga() {
  yield takeLatest(actions.openBook.type, openBook);
  yield takeLatest(actions.closeBook.type, closeBook);

  yield takeLatest(actions.fetchBigChapter.type, fetchBigChapter);

  yield takeLatest(actions.fetchMdContent.type, fetchMdContent);

  yield takeLatest(actions.convertMdToHtml.type, convertMdToHtml);

  yield takeLatest(actions.buildMenuItemsFromHtml.type, buildMenuItemsFromHtml);
  yield takeEvery(actions.handleClickOnMenuItem.type, handleClickOnMenuItem);

  yield takeLatest(actions.restoreLastActiveMenuItems.type, restoreLastActiveMenuItems);
}
