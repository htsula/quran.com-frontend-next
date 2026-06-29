import { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';

import { selectRecentReadingSessions } from '@/redux/slices/QuranReader/readingTracker';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

/**
 * Safely converts a date value (string or number) to a Date object.
 * Returns undefined if the conversion fails or the date is invalid.
 *
 * @param {string | number} dateValue - The date value to parse
 * @returns {Date | undefined} The parsed Date object or undefined if invalid
 */
const parseDate = (dateValue: string | number): Date | undefined => {
  try {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
};

type RecentlyReadVerseData = {
  surah: string;
  ayah: string;
};

/**
 * This hook returns the recently read verse keys from the local reading-tracker
 * state (redux-persist). There is no server-side account sync in this build.
 *
 * @param {boolean} shouldReturnVerseKeysArray - If true, returns verse keys as strings. If false, returns objects with surah and ayah properties.
 * @returns {object} The recently read verse keys and the loading state.
 */
function useGetRecentlyReadVerseKeys<T extends boolean = true>(
  shouldReturnVerseKeysArray: T = true as T,
  shouldAlsoReturnTimestamps: boolean = false,
): {
  recentlyReadVerseKeys: T extends true ? string[] : RecentlyReadVerseData[];
  isLoading: boolean;
  timestamps?: (Date | undefined)[];
} {
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);

  // Memoize computation of verse keys
  const recentlyReadVerseKeys = useMemo(() => {
    const verseKeys = Object.keys(recentReadingSessions);

    if (shouldReturnVerseKeysArray) {
      return verseKeys;
    }

    return verseKeys.map((verseKey) => {
      const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
      return { surah: chapterNumber, ayah: verseNumber };
    });
  }, [recentReadingSessions, shouldReturnVerseKeysArray]);

  // Memoize computation of timestamps
  const timestamps = useMemo<(Date | undefined)[] | undefined>(() => {
    if (!shouldAlsoReturnTimestamps) return undefined;

    return Object.values(recentReadingSessions).map((timestamp: number) => parseDate(timestamp));
  }, [recentReadingSessions, shouldAlsoReturnTimestamps]);

  return {
    recentlyReadVerseKeys: recentlyReadVerseKeys as T extends true
      ? string[]
      : RecentlyReadVerseData[],
    isLoading: false,
    ...(shouldAlsoReturnTimestamps && { timestamps }),
  };
}

export default useGetRecentlyReadVerseKeys;
