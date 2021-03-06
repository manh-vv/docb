import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the HomePage container
export const initialState: ContainerState = {
  githubUsers: [],
};

const homePageSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    initHomePage(state) {
      state.githubUsers = [];
    },
    githubUsers(state, action: PayloadAction<any>) {
      state.githubUsers = action.payload;
    },
  },
});

export const { actions: homePageActions, reducer, name: sliceKey } = homePageSlice;
