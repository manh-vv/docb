import { all, call, put, takeLatest } from 'redux-saga/effects';
import githubApi from 'utils/githubApi';
import { readGithubAuth } from 'utils/githubAuth';

import { homePageActions as actions } from './slice';

export function* init() {
  // get users
  const users = ['google', 'microsoft', 'facebook', 'aws'];
  // keep the accounts that loaded when others fail, e.g. on the rate limit
  const results: PromiseSettledResult<any>[] = yield call(
    [Promise, 'allSettled'],
    users.map(user => githubApi(`/users/${user}`)),
  );
  yield put(actions.githubUsers(results.filter(r => r.status === 'fulfilled').map(r => r.value)));
}

/** The signed in user's own library, then one per organization they belong to */
export function* fetchMyAccounts() {
  const auth = readGithubAuth();
  if (!auth) {
    yield put(actions.myAccounts([]));
    return;
  }

  // each request falls back on its own, so a failure never hides the other
  const [user, orgs] = yield all([
    call(() => githubApi('/user').catch(() => undefined)),
    call(() => githubApi('/user/orgs?per_page=100').catch(() => [])),
  ]);

  // the stored sign in is enough for a card when /user did not load
  const me = user || { id: auth.login, login: auth.login, avatar_url: auth.avatarUrl };
  yield put(actions.myAccounts([me, ...(Array.isArray(orgs) ? orgs : [])]));
}

export function* homePageSaga() {
  yield takeLatest(actions.initHomePage.type, init);
  yield takeLatest(actions.fetchMyAccounts.type, fetchMyAccounts);
}
