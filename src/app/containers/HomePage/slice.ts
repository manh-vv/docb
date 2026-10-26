import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';

import { ContainerState } from './types';

// The initial state of the HomePage container
export const initialState: ContainerState = {
  githubUsers: [],
  loading: false,
  myAccounts: [],
  myAccountsLoading: false,
};

const homePageSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    initHomePage(state) {
      state.githubUsers = [];
      state.loading = true;
    },
    githubUsers(state, action: PayloadAction<any>) {
      state.githubUsers = action.payload;
      state.loading = false;
    },
    fetchMyAccounts(state) {
      state.myAccounts = [];
      state.myAccountsLoading = true;
    },
    myAccounts(state, action: PayloadAction<any[]>) {
      state.myAccounts = action.payload;
      state.myAccountsLoading = false;
    },
  },
});

export const { actions: homePageActions, reducer, name: sliceKey } = homePageSlice;
