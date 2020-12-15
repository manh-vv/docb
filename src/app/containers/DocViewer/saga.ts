import { call, put, select, takeLatest } from 'redux-saga/effects';
import fetchMdContent from 'utils/fetchMdContent';
import githubApi from 'utils/githubApi';
import { selectMenuItems } from './selectors';

import { docViewerActions } from './slice';

function findHelper(a: any[] = [], itemId) {
  let menuItem = a.find(item => item.id === itemId);
  if (!menuItem) {
    for (const { children } of a) {
      menuItem = findHelper(children, itemId);
      if (menuItem) {
        break;
      }
    }
  }

  return menuItem;
}

export function* loadMdContent(action) {
  const {
    payload: { base64FilePath },
  } = action;

  const id = atob(decodeURIComponent(base64FilePath));
  const menuItems = yield select(selectMenuItems);

  const item = findHelper(menuItems, id);
  const { content } = yield call(fetchMdContent, item.url);

  yield put({
    type: docViewerActions.content.type,
    payload: atob(content),
  });
}

export function* clearMdContent() {
  yield put({
    type: docViewerActions.content.type,
    payload: null,
  });
}

/**
 * - book is repoName
 * - chapter is path of md file
 */
export function* searchMdFileInGithubRepo(action) {
  const {
    payload: { provider, username, repository },
  } = action;
  const usp = new URLSearchParams();
  usp.append('q', `extension:md repo:${username}/${repository}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const res = yield call(githubApi, `/search/code?${usp.toString()}`);

  function createLeafMenuItem(item) {
    return {
      id: item.path,
      text: item.name,
      url: item.git_url,
      type: 'file',
      href: `/viewer/${provider}/${username}/${repository}/${encodeURIComponent(btoa(item.path))}`,
    };
  }

  function createBranchMenuItem(id, text = id) {
    return {
      id,
      text,
      type: 'branch',
      children: [],
    };
  }
  const payload: any[] = [];

  res.items.reduce((a, c) => {
    const keys = c.path.split('/');

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === 0) {
        if (!a.has(k)) {
          let text = k;
          if (k === '') {
            text = 'Introduction';
          }

          const item = createBranchMenuItem(k, text);

          a.set(k, item);

          if (k === '') {
            payload.unshift(item);
          } else {
            payload.push(item);
          }
        }
      } else if (i < keys.length - 1) {
        if (!a.has(k)) {
          const item = createBranchMenuItem(k);
          a.set(k, item);
          a.get(keys[i - 1]).children.push(item);
        }
      } else {
        a.get(keys[i - 1]).children.push(createLeafMenuItem(c));
      }
    }

    return a;
  }, new Map<string, any>());

  // UPDATE_BIG_CHAPTER
  yield put({
    type: docViewerActions.menuItems.type,
    payload,
  });

  if (action.payload.base64FilePath) {
    yield put({
      type: 'FETCH_MD_CONTENT',
      payload: action.payload,
    });
  } else {
    yield put({
      type: 'CLEAR_MD_CONTENT',
    });
  }
}

export function* openBook(action) {
  const { payload } = action;
  yield put({
    type: docViewerActions.selectBook.type,
    payload,
  });

  yield put({
    type: 'FETCH_BIG_CHAPTER',
    payload,
  });
}

export function* closeBook(action) {
  const { payload } = action;
  yield put({
    type: docViewerActions.selectBook.type,
    payload,
  });
}

export function* docViewerSaga() {
  yield takeLatest('FETCH_BIG_CHAPTER', searchMdFileInGithubRepo);

  yield takeLatest('OPEN_BOOK', openBook);
  yield takeLatest('CLOSE_BOOK', closeBook);

  yield takeLatest('FETCH_MD_CONTENT', loadMdContent);
  yield takeLatest('CLEAR_MD_CONTENT', clearMdContent);
}
