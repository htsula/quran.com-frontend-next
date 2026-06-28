import { useEffect, useCallback, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logErrorToSentry } from '@/lib/sentry';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { PinnedVerse, selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import {
  RecentReadingSessions,
  selectRecentReadingSessions,
} from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { syncUserLocalData } from '@/utils/auth/api';
import { makeReadingSessionsUrl, makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { getLastSyncAt, removeLastSyncAt, setLastSyncAt } from '@/utils/auth/userDataSync';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import SyncDataType, {
  SyncLocalDataPayload,
  SyncReadingSessionPayload,
} from 'types/auth/SyncDataType';
import UserProfile from 'types/auth/UserProfile';
import { PinnedItemTargetType, SyncPinnedItemPayload } from 'types/PinnedItem';

const MAX_SYNC_ATTEMPTS = 3; // 1 initial + 2 retries
const INITIAL_RETRY_DELAY_MS = 1000;

const formatLocalReadingSession = (
  ayahKey: string,
  updatedAt: number,
): SyncReadingSessionPayload => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    updatedAt: new Date(updatedAt).toISOString(),
    chapterNumber: Number(surahNumber),
    verseNumber: Number(ayahNumber),
  };
};

const formatLocalPinnedVerse = (verse: PinnedVerse, mushafId: number): SyncPinnedItemPayload => ({
  targetType: PinnedItemTargetType.Ayah,
  targetId: verse.verseKey,
  metadata: {
    sourceMushafId: mushafId,
    key: verse.chapterNumber,
    verseNumber: verse.verseNumber,
  },
  createdAt: new Date(verse.timestamp).toISOString(),
});

const buildSyncPayload = (
  sessions: RecentReadingSessions,
  pinnedVerses: PinnedVerse[],
  mushafId: number,
): SyncLocalDataPayload => ({
  [SyncDataType.READING_SESSIONS]: Object.entries(sessions).map(([k, v]) =>
    formatLocalReadingSession(k, v),
  ),
  [SyncDataType.PINNED_VERSES]: pinnedVerses.map((v) => formatLocalPinnedVerse(v, mushafId)),
});

/** Syncs local user data (reading sessions, pinned verses) to DB on login with retry logic */
const useSyncUserData = () => {
  const { mutate } = useSWRConfig();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const hasSyncedRef = useRef(false);
  const { isLoggedIn } = useIsLoggedIn();
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const pinnedVersesRef = useRef(pinnedVerses);
  pinnedVersesRef.current = pinnedVerses;
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const performSync = useCallback(
    async (attempt = 0): Promise<void> => {
      const payload = buildSyncPayload(recentReadingSessions, pinnedVersesRef.current, mushafId);
      try {
        const { lastSyncAt } = await syncUserLocalData(payload);
        mutate(makeUserProfileUrl(), (data: UserProfile) => ({ ...data, lastSyncAt }));
        mutate(makeReadingSessionsUrl());
        setLastSyncAt(new Date(lastSyncAt));
        hasSyncedRef.current = true;
      } catch (error) {
        const readingSessionsCount = Object.keys(recentReadingSessions).length;
        logErrorToSentry(error, {
          transactionName: 'useSyncUserData',
          metadata: { readingSessionsCount, mushafId, attempt },
        });
        // Retry with exponential backoff (attempt 0, 1, 2 = 3 total attempts)
        if (attempt < MAX_SYNC_ATTEMPTS - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => performSync(attempt + 1), delay);
        }
      }
    },
    [recentReadingSessions, mushafId, mutate],
  );

  useEffect(() => {
    // Clear lastSyncAt cookie when user is logged out (handles server-side logout via /logout page)
    if (!isLoggedIn) {
      if (getLastSyncAt()) removeLastSyncAt();
      hasSyncedRef.current = false;
      return () => {};
    }
    // Wait for Redux hydration to complete before syncing to ensure we have the full local data
    if (!isPersistGateHydrationComplete) {
      return () => {};
    }
    // Sync local data to DB when user logs in and hasn't synced yet.
    // Use hasSyncedRef to track if we've successfully synced (not just started syncing)
    // so we retry if the first sync ran before hydration completed.
    if (!getLastSyncAt() && !hasSyncedRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      performSync().finally(() => {
        isSyncingRef.current = false;
      });
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isLoggedIn, isPersistGateHydrationComplete, performSync]);
};

export default useSyncUserData;
