import { call, put, takeLatest } from 'redux-saga/effects';
import githubApi from 'utils/githubApi';

import { bookCollectionActions } from './slice';

/**
 * Each repository is abook
 * An user may have may book in a collection
 * @param action
 */
export function* fetchBookCollection(action) {
  const {
    payload: { username },
  } = action;
  const res = yield call(githubApi, `/users/${username}/repos`);

  yield put({
    type: bookCollectionActions.update.type,
    payload: res,
  });
}

export function* bookCollectionSaga() {
  yield takeLatest('FETCH_BOOK_COLLECTION', fetchBookCollection);
}
