import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

export const selectDocViewer = (state: RootState) => state.docViewer || initialState;
export const selectMenuItems = createSelector(selectDocViewer, state => state.menuItems);
export const selectHtmlContent = createSelector(selectDocViewer, state => state.htmlContent);
export const selectSelectedBook = createSelector(selectDocViewer, state => state.selectedBook);
export const selectLastActiveMenuItem = createSelector(
  selectDocViewer,
  state => state.lastActiveMenuItem,
);
