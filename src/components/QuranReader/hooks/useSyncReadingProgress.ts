import { useCallback, useContext } from 'react';

import { useDispatch } from 'react-redux';

import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from '../observer';

import DataContext from '@/contexts/DataContext';
import useGlobalIntersectionObserver from '@/hooks/useGlobalIntersectionObserver';
import { setLastReadVerse } from '@/redux/slices/QuranReader/readingTracker';

interface UseSyncReadingProgressProps {
  isReadingPreference: boolean;
}

/**
 * Tracks the last-read verse locally (for continue-reading / reading position)
 * via the intersection observer. There is no server-side reading-progress sync
 * in this build.
 *
 * @param {UseSyncReadingProgressProps} options
 */
const useSyncReadingProgress = ({ isReadingPreference }: UseSyncReadingProgressProps) => {
  const chaptersData = useContext(DataContext);
  const dispatch = useDispatch();

  // this function will be called when an element is triggered by the intersection observer
  const onElementVisible = useCallback(
    (element: Element) => {
      const lastReadVerse = getObservedVersePayload(element);

      // Guard against elements without proper data attributes
      if (!lastReadVerse.verseKey) {
        return;
      }

      dispatch(
        setLastReadVerse({
          lastReadVerse,
          chaptersData,
        }),
      );
    },
    [chaptersData, dispatch],
  );

  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );
};

export default useSyncReadingProgress;
