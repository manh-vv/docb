import { call, put, takeLatest } from 'redux-saga/effects';
import githubApi from 'utils/githubApi';

import { homePageActions as actions } from './slice';

export function* init() {
  // get users
  const users = ['google', 'microsoft', 'facebook', 'aws'];
  const gUsers = yield call(
    [Promise, 'all'],
    users.map(user => githubApi(`/users/${user}`)),
  );

  yield put(actions.githubUsers(gUsers));
}

export function* homePageSaga() {
  yield takeLatest(actions.initHomePage.type, init);
}
