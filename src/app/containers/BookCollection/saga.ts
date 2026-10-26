import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { PER_PAGE } from 'utils/constants';
import githubApi from 'utils/githubApi';
import { toLoadError } from 'utils/loadError';

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
  try {
    // the account's repo count gives the number of pages; it is cached for the session
    const [res, account] = yield all([
      call(githubApi, `/users/${username}/repos${queryStr}`),
      call(() => githubApi(`/users/${username}`).catch(() => undefined)),
    ]);

    yield put(
      actions.success({
        curPage: nextPage,
        perPage: per_page,
        items: Array.isArray(res) ? res : [],
        repoCount: typeof account?.public_repos === 'number' ? account.public_repos : undefined,
      }),
    );
  } catch (error) {
    yield put(actions.failure(toLoadError(error)));
  }
}

export function* bookCollectionSaga() {
  yield takeLatest(actions.fetchBookCollection.type, fetchBookCollection);
}
