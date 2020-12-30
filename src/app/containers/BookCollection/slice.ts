import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { PER_PAGE } from 'utils/constants';

import { ContainerState } from './types';

export const initialState: ContainerState = {
  perPage: PER_PAGE,
  curPage: 0,
  hasNext: false,
  hasBack: false,
  total: 0,
  items: [],
};

const bookCollectionSlice = createSlice({
  name: 'bookCollection',
  initialState,
  reducers: {
    fetchBookCollection(_, action: PayloadAction<any>) {},
    success(state, action: PayloadAction<{ curPage: number; perPage: number; items: any[] }>) {
      const { items, curPage, perPage } = action.payload;

      state.total = items.length;
      state.items = items;
      state.hasNext = state.total >= state.perPage;
      state.curPage = curPage;
      state.perPage = perPage;
      state.hasBack = state.curPage > 1;
    },
  },
});

export const { actions: bookCollectionActions, reducer, name: sliceKey } = bookCollectionSlice;
