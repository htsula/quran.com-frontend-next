import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import Verse from '@/types/Verse';

/**
 * Modal types for verse actions opened from Study Mode or reading views.
 */
export enum VerseActionModalType {
  ADVANCED_COPY = 'advancedCopy',
}

/**
 * State for Study Mode restoration when returning from a modal.
 */
export type StudyModeRestoreState = {
  verseKey: string;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
  isSsrMode?: boolean;
};

/**
 * State for the verse action modal system.
 * This unified state manages all modals that can be opened from verse actions
 * (Advanced Copy).
 */
export type VerseActionModalState = {
  isOpen: boolean;
  modalType: VerseActionModalType | null;
  verseKey: string | null;
  verse: Verse | null;
  isTranslationView: boolean;
  wasOpenedFromStudyMode: boolean;
  studyModeRestoreState: StudyModeRestoreState | null;
};

export const initialState: VerseActionModalState = {
  isOpen: false,
  modalType: null,
  verseKey: null,
  verse: null,
  isTranslationView: false,
  wasOpenedFromStudyMode: false,
  studyModeRestoreState: null,
};

/**
 * Payload for opening Advanced Copy modal.
 */
export type OpenAdvancedCopyModalPayload = {
  verseKey: string;
  verse: Verse;
  isTranslationView?: boolean;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

const verseActionModal = createSlice({
  name: SliceName.VERSE_ACTION_MODAL,
  initialState,
  reducers: {
    openAdvancedCopyModal: (
      unusedState,
      { payload }: PayloadAction<OpenAdvancedCopyModalPayload>,
    ) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.ADVANCED_COPY,
      verseKey: payload.verseKey,
      verse: payload.verse,
      isTranslationView: payload.isTranslationView ?? false,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    closeVerseActionModal: () => initialState,
  },
});

// Selectors
export const selectVerseActionModalIsOpen = (state: RootState) => state.verseActionModal.isOpen;
export const selectVerseActionModalType = (state: RootState) => state.verseActionModal.modalType;
export const selectVerseActionModalVerseKey = (state: RootState) => state.verseActionModal.verseKey;
export const selectVerseActionModalVerse = (state: RootState) => state.verseActionModal.verse;
export const selectVerseActionModalIsTranslationView = (state: RootState) =>
  state.verseActionModal.isTranslationView;
export const selectVerseActionModalWasOpenedFromStudyMode = (state: RootState) =>
  state.verseActionModal.wasOpenedFromStudyMode;
export const selectVerseActionModalStudyModeRestoreState = (state: RootState) =>
  state.verseActionModal.studyModeRestoreState;

export const { openAdvancedCopyModal, closeVerseActionModal } = verseActionModal.actions;

export default verseActionModal.reducer;
