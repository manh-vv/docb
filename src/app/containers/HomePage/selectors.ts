import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

const selectDomain = (state: RootState) => state.homePage || initialState;

export const selectHomePage = createSelector([selectDomain], state => state);
export const selectGithubUsers = createSelector(selectHomePage, state => state.githubUsers);
