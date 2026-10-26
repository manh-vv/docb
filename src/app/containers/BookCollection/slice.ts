import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { PER_PAGE } from 'utils/constants';

import { ContainerState, FetchBookPayload, FetchBookSuccess } from './types';

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
    success(state, action: PayloadAction<FetchBookSuccess>) {
      const { items, curPage, perPage, repoCount } = action.payload;

      state.total = items.length;
      state.items = items;
      state.loading = false;
      state.perPage = perPage;
      state.curPage = curPage;
      state.hasBack = state.curPage > 1;

      if (repoCount !== undefined) {
        state.totalPage = Math.max(1, Math.ceil(repoCount / perPage));
        state.hasNext = curPage < state.totalPage;
      } else {
        // without the repo count, a full page means there may be another one
        state.hasNext = state.total >= state.perPage;
        state.totalPage = curPage + (state.hasNext ? 1 : 0);
      }
    },
  },
});

export const { actions: bookCollectionActions, reducer, name: sliceKey } = bookCollectionSlice;
