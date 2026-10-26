import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

export const selectHomePage = (state: RootState) => state.homePage || initialState;
export const selectGithubUsers = createSelector(selectHomePage, state => state.githubUsers);
export const selectLoading = createSelector(selectHomePage, state => state.loading);
export const selectMyAccounts = createSelector(selectHomePage, state => state.myAccounts);
export const selectMyAccountsLoading = createSelector(
  selectHomePage,
  state => state.myAccountsLoading,
);
