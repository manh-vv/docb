import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

const selectDomain = (state: RootState) => state.bookCollection || initialState;

export const selectBookCollection = createSelector(
  [selectDomain],
  bookCollectionState => bookCollectionState,
);
export const selectCurPage = createSelector(selectBookCollection, state => state.curPage);
export const selectHasNext = createSelector(selectBookCollection, state => state.hasNext);
export const selectHasBack = createSelector(selectBookCollection, state => state.hasBack);
