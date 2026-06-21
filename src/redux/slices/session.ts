import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';
import { isLoggedIn } from '@/utils/auth/login';

export type SessionState = {
  count: number;
};

const initialState: SessionState = {
  count: 0,
};

export const sessionSlice = createSlice({
  name: SliceName.SESSION,
  initialState,
  reducers: {
    incrementSessionCount: (state: SessionState) => ({
      ...state,
      count: state.count + 1,
    }),
  },
});

export const { incrementSessionCount } = sessionSlice.actions;

export const selectSessionCount = (state: RootState) => state.session.count;
export const selectUserState = (state: RootState) => {
  const isGuest = !isLoggedIn();
  return {
    isGuest,
    isFirstTimeGuest: isGuest && state.session.count === 2,
  };
};

export default sessionSlice.reducer;
