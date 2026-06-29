import { useMemo } from 'react';

import { Action, AsyncThunkAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import PreferenceGroup from 'types/auth/PreferenceGroup';

type ActionOrThunkAction = Action | AsyncThunkAction<any, any, any>;
type Value = string | number | boolean | Record<string, any>;

type Actions = {
  onSettingsChangeWithoutDispatch: (
    key: string,
    value: Value,
    preferenceGroup: PreferenceGroup,
    callback: () => void,
  ) => void;
  onSettingsChange: (
    key: string,
    value: Value,
    action: ActionOrThunkAction,
    undoAction: ActionOrThunkAction,
    preferenceGroup: PreferenceGroup,
    successCallback?: () => void,
  ) => void;
  onXstateSettingsChange: (
    key: string,
    value: string | number | boolean | Record<string, any>,
    action: () => void,
    undoAction: () => void,
    preferenceGroup: PreferenceGroup,
    successCallback?: () => void,
  ) => void;
};

type PersistPreferences = { actions: Actions; isLoading: boolean };

/**
 * A hook to apply a settings change locally. Settings are persisted to
 * localStorage via redux-persist (depending on the slice). There is no
 * server-side account sync in this build, so the change is applied directly.
 *
 * The `preferenceGroup`/`undoAction` parameters are kept for call-site
 * compatibility but are no longer used now that there is no remote persistence.
 *
 * @returns {PersistPreferences}
 */
const usePersistPreferenceGroup = (): PersistPreferences => {
  const dispatch = useDispatch();

  const actions = useMemo<Actions>(
    () => ({
      onSettingsChangeWithoutDispatch: (key, value, preferenceGroup, callback) => {
        callback();
      },
      onXstateSettingsChange: (
        key,
        value,
        action,
        undoAction,
        preferenceGroup,
        successCallback,
      ) => {
        action();
        if (successCallback) {
          successCallback();
        }
      },
      onSettingsChange: (key, value, action, undoAction, preferenceGroup, successCallback) => {
        dispatch(action);
        if (successCallback) {
          successCallback();
        }
      },
    }),
    [dispatch],
  );

  return { actions, isLoading: false };
};

export default usePersistPreferenceGroup;
