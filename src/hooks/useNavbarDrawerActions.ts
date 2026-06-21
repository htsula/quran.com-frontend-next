import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { setIsLanguageDrawerOpen } from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

/**
 * Shared hook for navbar drawer actions.
 *
 * @returns {object} Object containing the openLanguageDrawer function
 */
const useNavbarDrawerActions = () => {
  const dispatch = useDispatch();

  const openLanguageDrawer = useCallback(() => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent('drawer_language_open');
    dispatch(setIsLanguageDrawerOpen(true));
  }, [dispatch]);

  return { openLanguageDrawer };
};

export default useNavbarDrawerActions;
