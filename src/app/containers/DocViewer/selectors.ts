import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

const selectDomain = (state: RootState) => state.docViewer || initialState;
export const selectDocViewer = createSelector([selectDomain], docViewerState => docViewerState);
export const selectMenuItems = createSelector(selectDocViewer, state => state.menuItems);
export const selectSelectedBook = createSelector(selectDocViewer, state => state.selectedBook);
export const selectLastActiveMenuItem = createSelector(
  selectDocViewer,
  state => state.lastActiveMenuItem,
);
