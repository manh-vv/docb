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
    githubUsers(state, action: PayloadAction<any>) {
      return {
        ...state,
        githubUsers: action.payload,
      };
    },
  },
});

export const { actions: homePageActions, reducer, name: sliceKey } = homePageSlice;
