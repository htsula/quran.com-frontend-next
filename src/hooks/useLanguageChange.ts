import { useState } from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import resetSettings from '@/redux/actions/reset-settings';
import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import { selectIsUsingDefaultSettings } from '@/redux/slices/defaultSettings';
import { setLocaleCookie } from '@/utils/cookies';
import { logValueChange } from '@/utils/eventLogger';

interface UseLanguageChangeReturn {
  isChangingLanguage: boolean;
  changingLocale: string | null;
  onLanguageChange: (newLocale: string, onComplete?: () => void) => Promise<void>;
}

const useLanguageChange = (): UseLanguageChangeReturn => {
  const { lang } = useTranslation('common');
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
  const dispatch = useDispatch();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [changingLocale, setChangingLocale] = useState<string | null>(null);

  const onLanguageChange = async (newLocale: string, onComplete?: () => void) => {
    if (newLocale === lang) {
      onComplete?.();
      return;
    }
    if (isChangingLanguage) return;

    setIsChangingLanguage(true);
    setChangingLocale(newLocale);

    try {
      // Keep locale-dependent content tabs (tafsir, etc.) following defaults
      // unless the user has customized those preferences.
      if (!isUsingDefaultSettings) {
        dispatch(syncLocaleDependentSettings({ prevLocale: lang, nextLocale: newLocale }));
      }

      // Apply default settings of the new locale if user hasn't customized settings
      if (isUsingDefaultSettings) {
        dispatch(resetSettings(newLocale));
      }

      logValueChange('locale', lang, newLocale);
      await setLanguage(newLocale);
      setLocaleCookie(newLocale);

      onComplete?.();
    } finally {
      setIsChangingLanguage(false);
      setChangingLocale(null);
    }
  };

  return {
    isChangingLanguage,
    changingLocale,
    onLanguageChange,
  };
};

export default useLanguageChange;
