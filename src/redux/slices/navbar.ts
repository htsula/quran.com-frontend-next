import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export enum SettingsView {
  Body = 'body',
  Translation = 'translation',
  Reciter = 'reciter',
  Tafsir = 'tafsir',
  RepeatSettings = 'repeatSettings',
}

export enum SettingsTab {
  Arabic = 'arabic',
  Translation = 'translation',
  WBW = 'wbw',
}

export type Navbar = {
  isVisible: boolean;
  isSettingsDrawerOpen: boolean;
  isLanguageDrawerOpen: boolean;
  settingsView: SettingsView;
  lastSettingsView: SettingsView;
  lastSettingsTab: SettingsTab;
  lockVisibilityState: boolean;
};

const initialState: Navbar = {
  isVisible: true,
  isSettingsDrawerOpen: false,
  isLanguageDrawerOpen: false,
  settingsView: SettingsView.Body,
  lastSettingsView: SettingsView.Body,
  lastSettingsTab: SettingsTab.Arabic,
  lockVisibilityState: false,
};

export const navbarSlice = createSlice({
  name: SliceName.NAVBAR,
  initialState,
  reducers: {
    setIsVisible: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      // Only update visibility if the lock is not active
      isVisible: state.lockVisibilityState ? state.isVisible : action.payload,
    }),
    setLockVisibilityState: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      lockVisibilityState: action.payload,
    }),
    setIsSettingsDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isSettingsDrawerOpen: action.payload,
      // Reset views when drawer is closed
      ...(action.payload === false && {
        settingsView: SettingsView.Body,
        lastSettingsView: SettingsView.Body,
      }),
    }),
    setIsLanguageDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isLanguageDrawerOpen: action.payload,
    }),
    setSettingsView: (state: Navbar, action: PayloadAction<SettingsView>) => ({
      ...state,
      settingsView: action.payload,
      // Track the last non-Body view for navigation context
      lastSettingsView:
        action.payload !== SettingsView.Body ? action.payload : state.lastSettingsView,
    }),
    setLastSettingsTab: (state: Navbar, action: PayloadAction<SettingsTab>) => ({
      ...state,
      lastSettingsTab: action.payload,
    }),
  },
});

export const {
  setIsVisible,
  setLockVisibilityState,
  setIsSettingsDrawerOpen,
  setIsLanguageDrawerOpen,
  setSettingsView,
  setLastSettingsTab,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;
export const selectIsSettingsDrawerOpen = (state: RootState) => state.navbar.isSettingsDrawerOpen;
export const selectIsLanguageDrawerOpen = (state: RootState) => state.navbar.isLanguageDrawerOpen;

export default navbarSlice.reducer;
