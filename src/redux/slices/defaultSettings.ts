import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type DefaultSettings = {
  isUsingDefaultSettings: boolean;
};

const initialState: DefaultSettings = { isUsingDefaultSettings: true };

export const defaultSettingsSlice = createSlice({
  name: SliceName.DEFAULT_SETTINGS,
  initialState,
  reducers: {
    setIsUsingDefaultSettings: (state: DefaultSettings, action: PayloadAction<boolean>) => ({
      ...state,
      isUsingDefaultSettings: action.payload,
    }),
  },
});

export const { setIsUsingDefaultSettings } = defaultSettingsSlice.actions;

export default defaultSettingsSlice.reducer;

export const selectIsUsingDefaultSettings = (state: RootState) =>
  state.defaultSettings.isUsingDefaultSettings;
