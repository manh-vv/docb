import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'types';

import { initialState } from './slice';

export const selectDocViewer = (state: RootState) => state.docViewer || initialState;
export const selectMenuItems = createSelector(selectDocViewer, state => state.menuItems);
export const selectHtmlContent = createSelector(selectDocViewer, state => state.htmlContent);
export const selectMenuLoading = createSelector(selectDocViewer, state => state.menuLoading);
export const selectContentLoading = createSelector(selectDocViewer, state => state.contentLoading);
export const selectMenuError = createSelector(selectDocViewer, state => state.menuError);
export const selectContentError = createSelector(selectDocViewer, state => state.contentError);
export const selectNoMarkdown = createSelector(selectDocViewer, state => state.noMarkdown);
export const selectSelectedBook = createSelector(selectDocViewer, state => state.selectedBook);
export const selectLastActiveMenuItem = createSelector(
  selectDocViewer,
  state => state.lastActiveMenuItem,
);
