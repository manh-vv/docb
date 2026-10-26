import sha256 from 'crypto-js/sha256';
import { actionChannel, call, fork, put, select, take, takeLatest } from 'redux-saga/effects';
import db from 'store/db';
import createBranch, { ROOT_ID } from 'types/createBranch';
import createLeaf from 'types/createLeaf';
import { MenuItem } from 'types/MenuItem';
import { decodeBase64Utf8, encodeBase64Utf8 } from 'utils/base64';
import { withRef } from 'utils/bookUrls';
import fetchMdContentHelper from 'utils/fetchMdContent';
import getStorage from 'utils/getStorage';
import { authHeaders } from 'utils/githubAuth';
import githubApi from 'utils/githubApi';
import { HttpError, toLoadError } from 'utils/loadError';
import { rewriteMarkdownLinks } from 'utils/rewriteMarkdownLinks';

import { selectLastActiveMenuItem, selectMenuItems, selectSelectedBook } from './selectors';
import { docViewerActions as actions } from './slice';

interface Book {
  provider: string;
  username: string;
  repository?: string;
  /** the branch, when it is not the default one */
  ref?: string;
}

/**
 * Menu items of every book share one IndexedDB table, so ids are scoped by book:
 * `github/user/repo:docs/intro.md` for files and folders, `<chapter id>#<anchor>` for headings.
 * A branch other than the default one is a book of its own: `github/user/repo@branch`.
 */
export function bookId({ provider, username, repository, ref }: Book): string {
  return `${provider}/${username}/${repository}${ref ? `@${ref}` : ''}`;
}

export function chapterId(book: Book, path: string): string {
  return `${bookId(book)}:${path}`;
}

/**
 * The file path from the URL segment, or undefined when it is not valid base64,
 * e.g. after following a relative link inside a markdown file
 */
export function decodeFilePath(base64FilePath?: string): string | undefined {
  if (!base64FilePath) {
    return undefined;
  }
  try {
    return decodeBase64Utf8(decodeURIComponent(base64FilePath));
  } catch {
    return undefined;
  }
}

export function findMenuItemById(id: string): Promise<MenuItem> {
  return db.menuItems.get(id).then(rs => {
    return rs as MenuItem;
  });
}

export function* fetchMdContent(action) {
  const { payload } = action;

  const path = decodeFilePath(payload.base64FilePath);
  const menuItem = path && (yield call(findMenuItemById, chapterId(payload, path)));

  if (!menuItem) {
    yield put(actions.contentFailed({ kind: 'not-found' }));
    return;
  }

  yield call(revealChapter, menuItem);

  try {
    const { content } = yield call(fetchMdContentHelper, menuItem.url);
    yield put(actions.convertMdToHtml(decodeBase64Utf8(content)));
  } catch (error) {
    yield put(actions.contentFailed(toLoadError(error)));
  }
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

  // the HTML does not depend on who asks, so the token stays out of the cache key
  const headers = { ...options.headers, ...authHeaders() };
  return fetch(url, { ...options, headers }).then(async res => {
    if (!res.ok) {
      throw await HttpError.from(res);
    }
    const html = await res.text();
    getStorage(true).setItem(key, html);
    return html;
  });
}

export function* convertMdToHtml(action) {
  const { payload } = action;
  let htmlContent: string;
  try {
    htmlContent = yield call(githupConverter, payload);
  } catch (error) {
    yield put(actions.contentFailed(toLoadError(error)));
    return;
  }

  const book = yield select(selectSelectedBook);
  const path = decodeFilePath(book?.base64FilePath);
  if (htmlContent && book?.repository && path) {
    htmlContent = rewriteMarkdownLinks(htmlContent, { ...book, path });
  }

  yield put(actions.updateHtmlContent(htmlContent));
}

/**
 *
 * @param items interface Item {
 *    name: string;
 *    path: string;
 *    git_url: string;
 *  }
 * @param book the book the files belong to, which scopes the menu item ids
 * @returns return the list of item level 0 (top level)
 */
export function createMenuItemFromFilePath(items: any[], book: Book): Promise<MenuItem[]> {
  const prefixHref = `/viewer/${book.provider}/${book.username}/${book.repository}`;
  const rootId = chapterId(book, ROOT_ID);

  const listOfLevel0Items: MenuItem[] = [];
  const map: Map<string, MenuItem> = new Map(); // cache created item so that we dont' need to receate it

  items.forEach(item => {
    const { name, path, git_url } = item;
    const keys = path.split('/');
    // folders are identified by their full path, so `a/docs` and `b/docs` stay apart
    const folderId = (i: number) => chapterId(book, keys.slice(0, i + 1).join('/'));

    if (keys.length === 1 && !map.has(rootId)) {
      // create introduction level item
      const mi = createBranch(rootId, 'Introduction');
      map.set(mi.id, mi);
      listOfLevel0Items.unshift(mi);
    }

    keys.forEach((k, i) => {
      // if it is the last item then it is a leaf
      if (i === keys.length - 1) {
        const parentId = keys.length > 1 ? folderId(i - 1) : rootId;

        const mi = createLeaf(chapterId(book, path), name);
        mi.url = git_url;
        mi.href = withRef(`${prefixHref}/${encodeURIComponent(encodeBase64Utf8(path))}`, book.ref);

        const parent = map.get(parentId) as MenuItem;
        parent.childIds?.push(mi.id);
        mi.parentId = parent.id;
        mi.level = parent.level + 1;

        map.set(mi.id, mi);
      } else if (!map.has(folderId(i))) {
        const mi = createBranch(folderId(i), k);
        if (i > 0) {
          const parent = map.get(folderId(i - 1)) as MenuItem;
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
  const {
    payload: { provider, username, repository, ref, base64FilePath },
    payload,
  } = action;

  // List files with the git trees API: unlike code search, it works without authentication
  let res;
  try {
    const treeish = ref ? encodeURIComponent(ref) : 'HEAD';
    res = yield call(
      githubApi,
      `/repos/${username}/${repository}/git/trees/${treeish}?recursive=1`,
    );
  } catch (error) {
    // GitHub answers 409 for a repository without commits: an empty book, not a failure
    if (!(error instanceof HttpError && error.status === 409)) {
      yield put(actions.menuFailed(toLoadError(error)));
      return;
    }
    res = {};
  }
  const mdFiles = (res.tree || [])
    .filter(({ type, path }) => type === 'blob' && /\.md$/i.test(path))
    .map(({ path, url }) => ({ name: path.split('/').pop(), path, git_url: url }));

  // create menu items from file path and update local database
  const level0MenuItems: MenuItem[] = yield call(createMenuItemFromFilePath, mdFiles, {
    provider,
    username,
    repository,
    ref,
  });

  // a book opened without a chapter starts at its README, as on GitHub. Set before the menu,
  // which ends the loading state, so the empty book page does not flash first.
  const readme = mdFiles.find(({ path }) => /^readme\.md$/i.test(path));
  if (readme) {
    yield put(
      actions.setReadme({
        bookId: bookId({ provider, username, repository, ref }),
        base64FilePath: encodeURIComponent(encodeBase64Utf8(readme.path)),
      }),
    );
  }

  yield put(actions.updateMenuItems(level0MenuItems));
  yield put(actions.setNoMarkdown(mdFiles.length === 0));

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

  const previousBook = yield select(selectSelectedBook);
  yield put(actions.updateSelectedBook(payload));

  // the menu only needs loading when it is empty or shows another book
  const menuItems = yield select(selectMenuItems);
  const sameBook = previousBook && bookId(previousBook) === bookId(payload);
  if (!sameBook || !(menuItems && menuItems.length)) {
    yield put(actions.updateMenuItems([]));
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

export function createMenuItemFromHTag(
  hTag: HTMLHeadingElement,
  index: number,
  parentChapterId: string,
): MenuItem {
  // GitHub's markdown API used to put the permalink anchor inside the heading. It now renders
  // <div class="markdown-heading"><hN>text</hN><a class="anchor" id="..." href="..."></a></div>
  const aTag =
    hTag.getElementsByTagName('a')[0] ||
    hTag.closest('.markdown-heading')?.querySelector(':scope > a.anchor');

  // the anchor's id is what the page can scroll to; its href points at an id GitHub sets with JS
  const anchorId = aTag?.getAttribute('id');

  return {
    id: (anchorId && `${parentChapterId}#${anchorId}`) as string,
    active: false,
    level: +hTag.tagName.substr(1),
    order: index,
    text: hTag.innerText,
    type: 'hash',
    href: (anchorId && `#${anchorId}`) as string,
  };
}

export function* buildMenuItemsFromHtml() {
  // find current big chapter
  const selectedBook = yield select(selectSelectedBook);
  const path = decodeFilePath(selectedBook.base64FilePath);
  const activeChapter: MenuItem = path && (yield findMenuItemById(chapterId(selectedBook, path)));
  if (!activeChapter) {
    return; // menu items are not ready
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
    const menuItem = createMenuItemFromHTag(hTag as HTMLHeadingElement, key, activeChapter.id);
    if (!menuItem.id) {
      return; // no anchor to link to, and Dexie needs an id
    }
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

/**
 * Expand the folders above a chapter and mark it active, as clicking it in the sidebar would,
 * so a chapter opened from a link, a deep link or history is visible in the sidebar
 */
export function* revealChapter(chapter: MenuItem) {
  const ancestors: MenuItem[] = [];
  for (let id = chapter.parentId; id;) {
    const parent: MenuItem | undefined = yield call(findMenuItemById, id);
    if (!parent) {
      break;
    }
    ancestors.unshift(parent);
    id = parent.parentId;
  }

  for (const item of [...ancestors, chapter]) {
    const menuItems: MenuItem[] = yield select(selectMenuItems);
    const shown = menuItems.find(({ id }) => id === item.id);
    if (!shown) {
      return; // the menu is not ready for this book
    }
    if (shown.active) {
      continue;
    }
    const expanded = { ...shown, active: true };
    yield put(actions.updateMenuItem(expanded));
    if (expanded.type === 'branch') {
      const children = yield call(findChildItems, expanded.id);
      yield put(actions.showChildItems({ menuItem: expanded, menuItems: children }));
    }
  }
}

export function findChildItems(parentId: string): Promise<MenuItem[]> {
  return db.menuItems.where('parentId').equals(parentId).toArray();
}

export function* handleClickOnMenuItem(action) {
  const menuItems: MenuItem[] = yield select(selectMenuItems);
  // The payload is the item as it was rendered when clicked, which can be stale by the time
  // earlier clicks have been handled, so toggle from the item currently in the store
  const menuItem = menuItems.find(({ id }) => id === action.payload.id);

  if (!menuItem) {
    return;
  }

  const hasChildren = menuItem.childIds && menuItem.childIds.length;
  if (!hasChildren && menuItem.active) {
    return; // do nothing since click on the same item
  }

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

/**
 * Clicks are handled one at a time: expanding a branch waits on IndexedDB, and a click handled
 * in the meantime would toggle the branch back while its children are still on their way.
 */
export function* watchClickOnMenuItem() {
  const clicks = yield actionChannel(actions.handleClickOnMenuItem.type);
  while (true) {
    const action = yield take(clicks);
    yield call(handleClickOnMenuItem, action);
  }
}

export function* docViewerSaga() {
  yield takeLatest(actions.openBook.type, openBook);
  yield takeLatest(actions.closeBook.type, closeBook);

  yield takeLatest(actions.fetchBigChapter.type, fetchBigChapter);

  yield takeLatest(actions.fetchMdContent.type, fetchMdContent);

  yield takeLatest(actions.convertMdToHtml.type, convertMdToHtml);

  yield takeLatest(actions.buildMenuItemsFromHtml.type, buildMenuItemsFromHtml);
  yield fork(watchClickOnMenuItem);
}
