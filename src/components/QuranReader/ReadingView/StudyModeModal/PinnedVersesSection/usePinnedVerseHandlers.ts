import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import copyPinnedVerses from '@/components/QuranReader/PinnedVerses/utils/copyPinnedVerses';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { PinnedVerse } from '@/redux/slices/QuranReader/pinnedVerses';
import { logButtonClick } from '@/utils/eventLogger';
import ChaptersData from 'types/ChaptersData';

interface UsePinnedVerseHandlersProps {
  pinnedVerses: PinnedVerse[];
  t: ReturnType<typeof useTranslation>['t'];
  toast: ReturnType<typeof useToast>;
  lang: string;
  chaptersData: ChaptersData;
  selectedTranslations: number[];
  unpinVerseWithSync: (verseKey: string) => void;
  clearPinnedWithSync: () => void;
  onGoToVerse: (chapterId: string, verseNumber: string) => void;
}

const usePinnedVerseHandlers = ({
  pinnedVerses,
  t,
  toast,
  lang,
  chaptersData,
  selectedTranslations,
  unpinVerseWithSync,
  clearPinnedWithSync,
  onGoToVerse,
}: UsePinnedVerseHandlersProps) => {
  const handleVerseTagClick = useCallback(
    (verseKey: string) => {
      logButtonClick('study_mode_verse_tag_click');
      const [chapterId, verseNumber] = verseKey.split(':');
      onGoToVerse(chapterId, verseNumber);
    },
    [onGoToVerse],
  );

  const handleRemoveVerse = useCallback(
    (verseKey: string) => {
      logButtonClick('study_mode_remove_verse');
      unpinVerseWithSync(verseKey);

      if (pinnedVerses.length > 1) {
        const remainingVerses = pinnedVerses.filter((v) => v.verseKey !== verseKey);
        const nextVerse = remainingVerses[0];
        if (nextVerse) {
          const [chapterId, verseNumber] = nextVerse.verseKey.split(':');
          onGoToVerse(chapterId, verseNumber);
        }
      }
    },
    [pinnedVerses, unpinVerseWithSync, onGoToVerse],
  );

  const handleClear = useCallback(() => {
    logButtonClick('study_mode_clear_pinned');
    clearPinnedWithSync();
  }, [clearPinnedWithSync]);

  const handleCopy = useCallback(async () => {
    logButtonClick('study_mode_copy_pinned');
    try {
      await copyPinnedVerses({
        pinnedVerses,
        lang,
        chaptersData,
        selectedTranslations,
      });
      toast(t('common:copied'), { status: ToastStatus.Success });
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  }, [chaptersData, lang, pinnedVerses, selectedTranslations, t, toast]);

  return {
    handleVerseTagClick,
    handleRemoveVerse,
    handleClear,
    handleCopy,
  };
};

export default usePinnedVerseHandlers;
