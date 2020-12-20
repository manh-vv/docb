import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the DocViewer container
export const initialState: ContainerState = {
  content: '',
  htmlContent: '',
  menuItems: [],
  selectBook: null,
};

const docViewerSlice = createSlice({
  name: 'docViewer',
  initialState,
  reducers: {
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
    selectBook(state, action: PayloadAction<any>) {
      return {
        ...state,
        selectBook: action.payload,
      };
    },
  },
});

export const { actions: docViewerActions, reducer, name: sliceKey } = docViewerSlice;
