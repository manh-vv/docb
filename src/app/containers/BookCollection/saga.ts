import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PER_PAGE } from 'utils/constants';
import githubApi from 'utils/githubApi';
import { readGithubAuth } from 'utils/githubAuth';
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

  // signed in users see private repositories too: their own, and those of organizations they
  // belong to. /users/:name/repos only ever lists public ones, even with a token.
  const auth = readGithubAuth();
  const own = auth?.login.toLowerCase() === username.toLowerCase();

  try {
    // the account's repo count gives the number of pages; it is cached for the session
    let account = yield call(() =>
      githubApi(own ? '/user' : `/users/${username}`).catch(() => undefined),
    );
    const org = !!auth && !own && account?.type === 'Organization';

    let path = `/users/${username}/repos`;
    if (own) {
      path = '/user/repos';
      usp.append('type', 'owner');
    } else if (org) {
      path = `/orgs/${username}/repos`;
      usp.append('type', 'all');
      // only the organization endpoint tells members how many private repositories there are
      account = yield call(() => githubApi(`/orgs/${username}`).catch(() => account));
    }

    const res = yield call(githubApi, `${path}?${usp.toString()}`);
    const privateRepos = own ? account?.owned_private_repos : account?.total_private_repos;

    let repoCount: number | undefined;
    if (typeof account?.public_repos === 'number') {
      repoCount = account.public_repos + (privateRepos || 0);
    }
    if ((own || org) && typeof privateRepos !== 'number') {
      // an unknown private count would cut the pages short; page by "full page means more"
      repoCount = undefined;
    }

    yield put(
      actions.success({
        curPage: nextPage,
        perPage: per_page,
        items: Array.isArray(res) ? res : [],
        repoCount,
      }),
    );
  } catch (error) {
    yield put(actions.failure(toLoadError(error)));
  }
}

export function* bookCollectionSaga() {
  yield takeLatest(actions.fetchBookCollection.type, fetchBookCollection);
}
