import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

export const selectBookCollection = (state: RootState) => state.bookCollection || initialState;
export const selectCurPage = createSelector(selectBookCollection, state => state.curPage);
export const selectTotalPage = createSelector(selectBookCollection, state => state.totalPage);
export const selectHasNext = createSelector(selectBookCollection, state => state.hasNext);
export const selectLoading = createSelector(selectBookCollection, state => state.loading);
export const selectHasBack = createSelector(selectBookCollection, state => state.hasBack);
