import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state.bookCollection || initialState;

export const selectBookCollection = createSelector(
  [selectDomain],
  bookCollectionState => bookCollectionState,
);