import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

export const selectHomePage = (state: RootState) => state.homePage || initialState;
export const selectGithubUsers = createSelector(selectHomePage, state => state.githubUsers);
