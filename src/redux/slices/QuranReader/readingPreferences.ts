/* eslint-disable max-lines */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from '@/redux/actions/reset-settings';
import { getReadingPreferencesInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import {
  ReadingPreference,
  WordByWordDisplay,
  WordByWordType,
  WordClickFunctionality,
} from '@/types/QuranReader';

export const readingPreferencesSlice = createSlice({
  name: SliceName.READING_PREFERENCES,
  initialState: getReadingPreferencesInitialState(),
  reducers: {
    setReadingPreference: (state, action: PayloadAction<ReadingPreference>) => {
      const newState = {
        ...state,
        readingPreference: action.payload,
      };
      // Update lastUsedReadingMode when switching to a reading mode
      if (
        action.payload === ReadingPreference.Reading ||
        action.payload === ReadingPreference.ReadingTranslation
      ) {
        newState.lastUsedReadingMode = action.payload;
      }
      return newState;
    },
    setSelectedWordByWordLocale: (
      state,
      action: PayloadAction<{ value: string; locale: string }>,
    ) => ({
      ...state,
      selectedWordByWordLocale: action.payload.value,
      isUsingDefaultWordByWordLocale:
        action.payload.value ===
        getReadingPreferencesInitialState(action.payload.locale).selectedWordByWordLocale,
    }),
    setWordClickFunctionality: (state, action: PayloadAction<WordClickFunctionality>) => ({
      ...state,
      wordClickFunctionality: action.payload,
    }),
    setWordByWordContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordContentType: action.payload,
    }),
    setWordByWordTooltipContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordTooltipContentType: action.payload,
    }),
    setWordByWordInlineContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordInlineContentType: action.payload,
    }),
    setWordByWordDisplay: (state, action: PayloadAction<WordByWordDisplay[]>) => ({
      ...state,
      wordByWordDisplay: action.payload,
    }),
    setSelectedReadingTranslation: (state, action: PayloadAction<string | null>) => ({
      ...state,
      selectedReadingTranslation: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (unusedState, action) =>
      getReadingPreferencesInitialState(action.payload.locale),
    );
  },
});

export const {
  setReadingPreference,
  setSelectedWordByWordLocale,
  setWordClickFunctionality,
  setWordByWordContentType,
  setWordByWordTooltipContentType,
  setWordByWordInlineContentType,
  setWordByWordDisplay,
  setSelectedReadingTranslation,
} = readingPreferencesSlice.actions;

export const selectInlineDisplayWordByWordPreferences = (state: RootState) => {
  const { wordByWordDisplay, wordByWordInlineContentType } = state.readingPreferences;
  const inline = wordByWordDisplay.includes(WordByWordDisplay.INLINE);
  return {
    showWordByWordTranslation:
      inline && wordByWordInlineContentType.includes(WordByWordType.Translation),
    showWordByWordTransliteration:
      inline && wordByWordInlineContentType.includes(WordByWordType.Transliteration),
  };
};
export const selectIsTooltipContentEnabled = (state: RootState): boolean => {
  const { wordByWordTooltipContentType, wordByWordDisplay } = state.readingPreferences;
  if (!wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP)) return false;
  return (
    wordByWordTooltipContentType.includes(WordByWordType.Translation) ||
    wordByWordTooltipContentType.includes(WordByWordType.Transliteration)
  );
};

export const selectReadingPreferences = (state: RootState) => state.readingPreferences;
export const selectTooltipContentType = (state: RootState): WordByWordType[] => {
  const { wordByWordDisplay: d, wordByWordTooltipContentType: t } = state.readingPreferences;
  return d?.includes(WordByWordDisplay.TOOLTIP) && t?.length ? t : [];
};
export const selectReadingPreference = (state: RootState) =>
  state.readingPreferences.readingPreference;
export const selectWordClickFunctionality = (state: RootState) =>
  state.readingPreferences.wordClickFunctionality;
export const selectWordByWordLocale = (state: RootState) =>
  state.readingPreferences.selectedWordByWordLocale;
export const selectIsUsingDefaultWordByWordLocale = (state: RootState) =>
  state.readingPreferences.isUsingDefaultWordByWordLocale;
export const selectSelectedReadingTranslation = (state: RootState) =>
  state.readingPreferences.selectedReadingTranslation;

/**
 * Validated selector that ensures selectedReadingTranslation is always valid.
 * Returns the stored value only if it exists in selectedTranslations,
 * otherwise falls back to the first selected translation or null.
 *
 * This prevents bugs where selectedReadingTranslation becomes "orphaned"
 * (e.g., when user deselects that translation or switches locales).
 *
 * @param {RootState} state - The Redux root state
 * @returns {number | null} A valid translation ID from selectedTranslations, or null if none are selected
 */
export const selectValidatedReadingTranslation = (state: RootState): number | null => {
  const { selectedReadingTranslation } = state.readingPreferences;
  const { selectedTranslations } = state.translations;

  // If stored value exists AND is in selectedTranslations, use it
  if (selectedReadingTranslation) {
    const numericId = Number(selectedReadingTranslation);
    if (selectedTranslations.includes(numericId)) {
      return numericId;
    }
  }
  // Otherwise, fall back to first translation or null
  return selectedTranslations.length > 0 ? selectedTranslations[0] : null;
};

export const selectLastUsedReadingMode = (state: RootState) =>
  state.readingPreferences.lastUsedReadingMode;

export default readingPreferencesSlice.reducer;
