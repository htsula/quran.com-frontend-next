import { SyncPinnedItemPayload } from 'types/PinnedItem';

enum SyncDataType {
  READING_SESSIONS = 'readingSessions',
  PINNED_VERSES = 'pinnedVerses',
}

export interface SyncReadingSessionPayload {
  updatedAt: string;
  chapterNumber: number;
  verseNumber: number;
}

export interface SyncLocalDataPayload {
  [SyncDataType.READING_SESSIONS]: SyncReadingSessionPayload[];
  [SyncDataType.PINNED_VERSES]?: SyncPinnedItemPayload[];
}

export default SyncDataType;
