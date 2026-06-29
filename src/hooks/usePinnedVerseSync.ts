import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import { pinVerse, unpinVerse, clearPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';

/**
 * Manage pinned verses locally (redux-persist) and broadcast changes to other
 * open tabs. There is no server-side account sync in this build.
 *
 * @returns {{ pinVerseWithSync: (verseKey: string) => void, unpinVerseWithSync: (verseKey: string) => void, clearPinnedWithSync: () => void }}
 */
const usePinnedVerseSync = () => {
  const dispatch = useDispatch();

  const pinVerseWithSync = useCallback(
    (verseKey: string) => {
      dispatch(pinVerse(verseKey));
      broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey });
    },
    [dispatch],
  );

  const unpinVerseWithSync = useCallback(
    (verseKey: string) => {
      dispatch(unpinVerse(verseKey));
      broadcastPinnedVerses(PinnedVersesBroadcastType.UNPIN, { verseKey });
    },
    [dispatch],
  );

  const clearPinnedWithSync = useCallback(() => {
    dispatch(clearPinnedVerses());
    broadcastPinnedVerses(PinnedVersesBroadcastType.CLEAR);
  }, [dispatch]);

  return { pinVerseWithSync, unpinVerseWithSync, clearPinnedWithSync };
};

export default usePinnedVerseSync;
