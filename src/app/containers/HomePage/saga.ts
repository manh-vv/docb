import { call, put, takeLatest } from 'redux-saga/effects';
import githubApi from 'utils/githubApi';

import { homePageActions as actions } from './slice';

export function* init() {
  // get users
  const users = ['google', 'microsoft', 'facebook', 'aws'];
  try {
    const gUsers = yield call(
      [Promise, 'all'],
      users.map(user => githubApi(`/users/${user}`)),
    );
    // a failed lookup (e.g. rate limited) comes back as an error object without an id
    yield put(actions.githubUsers(gUsers.filter(u => u && u.id)));
  } catch {
    yield put(actions.githubUsers([]));
  }
}

export function* homePageSaga() {
  yield takeLatest(actions.initHomePage.type, init);
}
