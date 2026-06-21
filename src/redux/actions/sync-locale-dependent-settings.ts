import { AnyAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { getTafsirsInitialState, getTranslationsInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';

type Params = {
  prevLocale: string;
  nextLocale: string;
};

const syncTranslationsIfUsingDefaults = (
  state: RootState,
  dispatch: Dispatch<AnyAction>,
  nextLocale: string,
) => {
  if (!state.translations?.isUsingDefaultTranslations) return;

  const defaultTranslations = getTranslationsInitialState(nextLocale).selectedTranslations;
  const currentTranslations = state.translations?.selectedTranslations || [];
  // Avoid redundant dispatches when next-locale defaults are already selected.
  if (areArraysEqual(currentTranslations, defaultTranslations)) return;

  dispatch({
    ...setSelectedTranslations({ translations: defaultTranslations, locale: nextLocale }),
    meta: { skipDefaultSettings: true },
  });
};

const syncTafsirsIfUsingDefaults = (
  state: RootState,
  dispatch: Dispatch<AnyAction>,
  nextLocale: string,
) => {
  if (!state.tafsirs?.isUsingDefaultTafsirs) return;

  const defaultTafsirs = getTafsirsInitialState(nextLocale).selectedTafsirs;
  const currentTafsirs = state.tafsirs?.selectedTafsirs || [];
  // Avoid redundant dispatches when next-locale defaults are already selected.
  if (areArraysEqual(currentTafsirs, defaultTafsirs)) return;

  dispatch({
    ...setSelectedTafsirs({ tafsirs: defaultTafsirs, locale: nextLocale }),
    meta: { skipDefaultSettings: true },
  });
};

/**
 * Keep locale-dependent content preferences (e.g. default tafsir/translation)
 * aligned with the site locale when the user hasn't customized those specific
 * preferences.
 *
 * This is intentionally more granular than `resetSettings` so that customized
 * settings are preserved while "default-follow-locale" preferences still update.
 * @returns {void}
 */
const syncLocaleDependentSettings =
  ({ nextLocale }: Params) =>
  (dispatch: Dispatch<AnyAction>, getState: () => RootState) => {
    const state = getState();

    syncTranslationsIfUsingDefaults(state, dispatch, nextLocale);
    syncTafsirsIfUsingDefaults(state, dispatch, nextLocale);
  };

export default syncLocaleDependentSettings;
