import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PER_PAGE } from 'utils/constants';
import githubApi from 'utils/githubApi';

import { bookCollectionActions as actions } from './slice';
import { FetchBookPayload } from './types';

/**
 * Each repository is abook
 * An user may have may book in a collection
 * @param action
 */
export function* fetchBookCollection(action: PayloadAction<FetchBookPayload>) {
  const {
    payload: { username, nextPage, perPage },
  } = action;

  const usp = new URLSearchParams();
  const per_page = perPage || PER_PAGE;
  usp.append('page', `${nextPage}`);
  usp.append('per_page', `${per_page}`);

  const queryStr = `?${usp.toString()}`;
  const res = yield call(githubApi, `/users/${username}/repos${queryStr}`);
  window.history.replaceState(null, '', queryStr);

  yield put(
    actions.success({
      curPage: nextPage,
      perPage: per_page,
      items: res,
    }),
  );
}

export function* bookCollectionSaga() {
  yield takeLatest(actions.fetchBookCollection, fetchBookCollection);
}
