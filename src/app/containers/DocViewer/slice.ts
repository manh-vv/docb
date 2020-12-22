import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the DocViewer container
export const initialState: ContainerState = {
  content: '',
  htmlContent: '',
  menuItems: [],
  selectedBook: null,
  lastActiveMenuItem: null,
};

const docViewerSlice = createSlice({
  name: 'docViewer',
  initialState,
  reducers: {
    selectedBook(state, action: PayloadAction<any>) {
      return {
        ...state,
        selectedBook: action.payload,
      };
    },
    content(state, action: PayloadAction<any>) {
      return {
        ...state,
        content: action.payload,
      };
    },
    htmlContent(state, action: PayloadAction<any>) {
      return {
        ...state,
        htmlContent: action.payload,
      };
    },
    menuItems(state, action: PayloadAction<any>) {
      return {
        ...state,
        menuItems: action.payload || initialState.menuItems,
      };
    },
    lastActiveMenuItem(state, action: PayloadAction<any>) {
      return {
        ...state,
        lastActiveMenuItem: action.payload,
      };
    },
  },
});

export const { actions: docViewerActions, reducer, name: sliceKey } = docViewerSlice;
