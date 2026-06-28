import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { fetcher } from '@/api';
import useIsUsingDefaultSettings from '@/hooks/useIsUsingDefaultSettings';
import useQcfFont from '@/hooks/useQcfFont';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Verse from '@/types/Verse';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';

interface VerseResponse {
  verse: Verse;
}

interface UseStudyModeVerseDataProps {
  verseKey: string;
  selectedChapterId: string;
  selectedVerseNumber: string;
  initialChapterId: string;
  initialVerseNumber: string;
  initialVerse?: Verse;
}

interface UseStudyModeVerseDataReturn {
  currentVerse: Verse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  retry: () => void;
}

const useStudyModeVerseData = ({
  verseKey,
  selectedChapterId,
  selectedVerseNumber,
  initialChapterId,
  initialVerseNumber,
  initialVerse,
}: UseStudyModeVerseDataProps): UseStudyModeVerseDataReturn => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const wordByWordLocale = useSelector(selectWordByWordLocale);
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const isUsingDefaultSettings = useIsUsingDefaultSettings({ selectedTranslations });

  const safeChapterId = initialChapterId || '1';
  const safeVerseNumber = initialVerseNumber || '1';

  const isInitialVerse =
    selectedChapterId === safeChapterId && selectedVerseNumber === safeVerseNumber;

  const shouldUseInitialData = isInitialVerse && isUsingDefaultSettings && !!initialVerse;

  const queryKey = isPersistGateHydrationComplete
    ? makeByVerseKeyUrl(verseKey, {
        words: true,
        translationFields: 'resource_name,language_id',
        translations: selectedTranslations.join(','),
        ...getDefaultWordFields(quranReaderStyles.quranFont),
        ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
        wordTranslationLanguage: wordByWordLocale,
        wordTransliteration: 'true',
      })
    : null;

  const { data, isValidating, error, mutate } = useSWRImmutable<VerseResponse>(queryKey, fetcher, {
    fallbackData: shouldUseInitialData ? { verse: initialVerse } : undefined,
  });

  const effectiveVerse = data?.verse || (shouldUseInitialData ? initialVerse : undefined);

  const currentVerse = useMemo(() => {
    if (!effectiveVerse) return undefined;
    return {
      ...effectiveVerse,
      chapterId: effectiveVerse.chapterId ?? Number(selectedChapterId),
    };
  }, [effectiveVerse, selectedChapterId]);

  const versesForFont = useMemo(() => (currentVerse ? [currentVerse] : []), [currentVerse]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  const isLoading = !effectiveVerse && isValidating;

  return {
    currentVerse,
    isLoading,
    error,
    retry: mutate,
  };
};

export default useStudyModeVerseData;
