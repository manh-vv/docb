import sha256 from 'crypto-js/sha256';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import db from 'store/db';
import createBranch, { ROOT_ID } from 'types/createBranch';
import createLeaf from 'types/createLeaf';
import { MenuItem } from 'types/MenuItem';
import fetchMdContent from 'utils/fetchMdContent';
import getStorage from 'utils/getStorage';
import githubApi from 'utils/githubApi';

import { selectLastActiveMenuItem, selectMenuItems, selectSelectedBook } from './selectors';
import { docViewerActions } from './slice';

export function findMenuItemById(id: string): Promise<MenuItem> {
  return db.menuItems.get(id).then(rs => {
    return rs as MenuItem;
  });
}

export function* loadMdContent(action) {
  const {
    payload: { base64FilePath },
  } = action;

  const path = atob(decodeURIComponent(base64FilePath));
  const menuItem = yield call(findMenuItemById, path);

  const { content } = yield call(fetchMdContent, menuItem.url);

  yield put({
    type: docViewerActions.content.type,
    payload: atob(content),
  });

  yield put({
    type: 'CONVERT_MD_TO_HTML',
    payload: atob(content),
  });
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

  yield put({
    type: docViewerActions.htmlContent.type,
    payload: htmlContent,
  });
}

export function* clearMdContent() {
  yield put({
    type: docViewerActions.content.type,
    payload: null,
  });
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
export function* searchMdFileInGithubRepo(action) {
  // if the menu items had been already filled then we can pass this action
  const menuItems = yield select(selectMenuItems);
  if (menuItems && menuItems.length) {
    return;
  }

  const {
    payload: { provider, username, repository },
  } = action;
  const usp = new URLSearchParams();
  usp.append('q', `extension:md repo:${username}/${repository}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const res = yield call(githubApi, `/search/code?${usp.toString()}`);

  // create menu items from file path and update local database
  const payload = yield call(
    createMenuItemFromFilePath,
    res.items,
    `/viewer/${provider}/${username}/${repository}`,
  );

  // UPDATE_BIG_CHAPTER
  yield put({
    type: docViewerActions.menuItems.type,
    payload,
  });
}

export function* openBook(action) {
  const { payload } = action;

  yield put(docViewerActions.selectedBook(payload));

  // if the menu items had been already filled then we don't have to reload big chapters
  const menuItems = yield select(selectMenuItems);
  if (!menuItems || !menuItems.length) {
    yield put({
      type: 'FETCH_BIG_CHAPTER',
      payload,
    });
  }

  if (action.payload.base64FilePath) {
    yield put({
      type: 'FETCH_MD_CONTENT',
      payload: action.payload,
    });
    yield put({
      type: 'RESTORE_LAST_ACTIVE_MENU_ITEMS',
      payload: action.payload,
    });
  } else {
    yield put({
      type: 'CLEAR_MD_CONTENT',
    });
  }
}

export function* closeBook() {
  // reset menu items
  yield put({
    type: docViewerActions.menuItems.type,
    payload: [],
  });
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

export function* buildMenuFromMdContent() {
  const elMd = document.getElementById('id-md-viewer');
  const hTags = elMd?.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const rs: MenuItem[] = [];
  const levelStack: MenuItem[] = [];
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
  });

  // update db
  const { base64FilePath } = yield select(selectSelectedBook);
  const caMenuItem: MenuItem = yield call(
    findMenuItemById,
    atob(decodeURIComponent(base64FilePath)),
  );

  rs.filter(({ level }) => level === 1).forEach(item => {
    item.parentId = caMenuItem.id;
    if (!caMenuItem.childIds) {
      caMenuItem.childIds = [];
    }
    caMenuItem.childIds.push(item.id);
  });

  rs.forEach(item => {
    item.level += caMenuItem.level;
  });

  yield call([db.menuItems, 'bulkPut'], rs.concat(caMenuItem));
}

export function findChildItems(parentId: string): Promise<MenuItem[]> {
  return db.menuItems.where('parentId').equals(parentId).toArray();
}

export function* handleSelectMenuItem(action) {
  const menuItem: MenuItem = action.payload.menuItem;
  const lastActiveMenuItem = yield select(selectLastActiveMenuItem);
  const menuItems: MenuItem[] = yield select(selectMenuItems);
  const index: number = action.payload.index || menuItems.findIndex(({ id }) => id === menuItem.id);
  const hasChildren = menuItem.childIds && menuItem.childIds.length;
  const active = hasChildren ? !menuItem.active : true;

  yield put(
    docViewerActions.lastActiveMenuItem({
      menuItem,
      index,
    }),
  );

  const newMenuItems = menuItems.map(m => {
    let rs = m;
    if (m.id === menuItem.id) {
      rs = { ...m, active };
    } else if (
      lastActiveMenuItem &&
      m.id === lastActiveMenuItem.menuItem.id &&
      !lastActiveMenuItem.menuItem.childIds
    ) {
      rs = { ...m, active: false };
    }

    return rs;
  });

  if (!hasChildren) {
    // active item only
    yield put(docViewerActions.menuItems(newMenuItems));
  } else if (active) {
    if (hasChildren) {
      const childItems = yield call(findChildItems, menuItem.id);

      yield put(
        docViewerActions.menuItems([
          ...newMenuItems.slice(0, index + 1),
          ...childItems,
          ...newMenuItems.slice(index + 1),
        ]),
      );
    } else {
      yield put(docViewerActions.menuItems(newMenuItems));
    }
  } else {
    const set = new Set();
    set.add(menuItem.id);

    yield put(
      docViewerActions.menuItems(
        newMenuItems.filter(item => {
          const flag = set.has(item.parentId);
          if (flag) {
            set.add(item.id);
          }

          return !flag;
        }),
      ),
    );
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
  yield takeLatest('OPEN_BOOK', openBook);
  yield takeLatest('CLOSE_BOOK', closeBook);

  yield takeLatest('FETCH_BIG_CHAPTER', searchMdFileInGithubRepo);

  yield takeLatest('FETCH_MD_CONTENT', loadMdContent);
  yield takeLatest('CLEAR_MD_CONTENT', clearMdContent);

  yield takeLatest('CONVERT_MD_TO_HTML', convertMdToHtml);

  yield takeLatest('BUILD_MENU_FROM_MD_CONTENT', buildMenuFromMdContent);
  yield takeEvery('HANDLE_SELECT_MENU_ITEM', handleSelectMenuItem);

  yield takeLatest('RESTORE_LAST_ACTIVE_MENU_ITEMS', restoreLastActiveMenuItems);
}
