import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { PER_PAGE } from 'utils/constants';

import { ContainerState, FetchBookPayload } from './types';

export const initialState: ContainerState = {
  perPage: PER_PAGE,
  curPage: 1,
  totalPage: 1,
  hasNext: false,
  hasBack: false,
  total: 0,
  items: [],
  loading: false,
};

const bookCollectionSlice = createSlice({
  name: 'bookCollection',
  initialState,
  reducers: {
    fetchBookCollection(state, action: PayloadAction<FetchBookPayload>) {
      state.loading = true;
    },
    failure(state) {
      state.loading = false;
    },
    success(state, action: PayloadAction<{ curPage: number; perPage: number; items: any[] }>) {
      const { items, curPage, perPage } = action.payload;

      state.total = items.length;
      state.items = items;
      state.loading = false;
      state.perPage = perPage;
      state.curPage = curPage;
      state.hasNext = state.total >= state.perPage;
      state.hasBack = state.curPage > 1;

      if (curPage > state.totalPage) {
        state.totalPage = curPage;
      }
    },
  },
});

export const { actions: bookCollectionActions, reducer, name: sliceKey } = bookCollectionSlice;
