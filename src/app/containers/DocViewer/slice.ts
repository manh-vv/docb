import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem } from 'types/MenuItem';
import { LoadError } from 'utils/loadError';

import {
  ContainerState,
  FetchBigChapter,
  FetchMdContent,
  HideChildItems,
  Readme,
  SelectedBook,
  ShowChildItems,
} from './types';

// The initial state of the DocViewer container
export const initialState: ContainerState = {
  htmlContent: '',
  menuItems: [],
  menuLoading: false,
  contentLoading: false,
  noMarkdown: false,
};

const docViewerSlice = createSlice({
  name: 'docViewer',
  initialState,
  reducers: {
    closeBook() {},
    openBook(state, action: PayloadAction<SelectedBook>) {},
    updateSelectedBook(state, action: PayloadAction<any>) {
      state.selectedBook = action.payload;
    },
    fetchBigChapter(state, action: PayloadAction<FetchBigChapter>) {
      state.menuLoading = true;
      state.menuError = undefined;
      state.noMarkdown = false;
      state.readme = undefined;
    },
    menuFailed(state, action: PayloadAction<LoadError>) {
      state.menuLoading = false;
      state.menuError = action.payload;
    },
    setNoMarkdown(state, action: PayloadAction<boolean>) {
      state.noMarkdown = action.payload;
    },
    setReadme(state, action: PayloadAction<Readme | undefined>) {
      state.readme = action.payload;
    },
    fetchMdContent(state, action: PayloadAction<FetchMdContent>) {
      state.contentLoading = true;
      state.contentError = undefined;
    },
    contentFailed(state, action: PayloadAction<LoadError>) {
      state.contentLoading = false;
      state.htmlContent = '';
      state.contentError = action.payload;
    },
    convertMdToHtml(state, action: PayloadAction<string>) {},
    buildMenuItemsFromHtml() {},
    handleClickOnMenuItem(state, action: PayloadAction<MenuItem>) {},
    showChildItems(state, action: PayloadAction<ShowChildItems>) {
      const {
        payload: { menuItems, menuItem },
      } = action;

      const index = state.menuItems.findIndex(item => item.id === menuItem.id);
      if (index === -1 || !state.menuItems[index].active) {
        return;
      }

      // Children are already shown, e.g. the chapter's headings were attached twice
      if (state.menuItems[index + 1]?.parentId === menuItem.id) {
        return;
      }

      state.menuItems = [
        ...state.menuItems.slice(0, index + 1),
        ...menuItems,
        ...state.menuItems.slice(index + 1),
      ];
    },
    hideChildItems(state, action: PayloadAction<HideChildItems>) {
      const {
        payload: { menuItem },
      } = action;

      const set: Set<string> = new Set();
      set.add(menuItem.id);

      state.menuItems = state.menuItems.filter(item => {
        const flag = item.parentId && set.has(item.parentId);
        if (flag) {
          set.add(item.id);
        }
        return !flag;
      });
    },
    updateMenuItem(state, action: PayloadAction<MenuItem>) {
      const { payload: menuItem } = action;
      const index = state.menuItems.findIndex(item => item.id === menuItem.id);
      if (index === -1) return;

      if (menuItem.active) {
        const lastActiveMenuItem = state.lastActiveMenuItem;

        if (lastActiveMenuItem) {
          const lastActiveIndex = state.menuItems.findIndex(
            item => item.id === lastActiveMenuItem.id,
          );

          if (lastActiveIndex !== -1 && lastActiveIndex !== index) {
            if (!lastActiveMenuItem.childIds || !lastActiveMenuItem.childIds.length) {
              state.menuItems = [
                ...state.menuItems.slice(0, lastActiveIndex),
                { ...lastActiveMenuItem, active: false },
                ...state.menuItems.slice(lastActiveIndex + 1),
              ];
            }
          }
        }

        state.lastActiveMenuItem = menuItem;
      }

      state.menuItems = [
        ...state.menuItems.slice(0, index),
        menuItem,
        ...state.menuItems.slice(index + 1),
      ];
    },
    updateHtmlContent(state, action: PayloadAction<string>) {
      state.htmlContent = action.payload;
      state.contentLoading = false;
      state.contentError = undefined;
    },
    updateMenuItems(state, action: PayloadAction<MenuItem[]>) {
      state.menuItems = action.payload;
      state.menuLoading = false;
    },
  },
});

export const { actions: docViewerActions, reducer, name: sliceKey } = docViewerSlice;
