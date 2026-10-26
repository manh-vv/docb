import { call, put, takeLatest } from 'redux-saga/effects';
import githubApi from 'utils/githubApi';

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

export function* homePageSaga() {
  yield takeLatest(actions.initHomePage.type, init);
}
