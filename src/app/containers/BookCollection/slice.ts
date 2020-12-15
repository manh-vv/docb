import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the BookCollection container
export const initialState: ContainerState = {
  total: 0,
  items: [],
};

const bookCollectionSlice = createSlice({
  name: 'bookCollection',
  initialState,
  reducers: {
    update(state, action: PayloadAction<any>) {
      return {
        ...state,
        total: action.payload.length,
        items: action.payload,
      };
    },
  },
});

export const { actions: bookCollectionActions, reducer, name: sliceKey } = bookCollectionSlice;
