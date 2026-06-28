import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import copyPinnedVerses from '@/components/QuranReader/PinnedVerses/utils/copyPinnedVerses';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { PinnedVerse } from '@/redux/slices/QuranReader/pinnedVerses';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';
import ChaptersData from 'types/ChaptersData';

interface UsePinnedVerseHandlersProps {
  pinnedVerses: PinnedVerse[];
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslation>['t'];
  toast: ReturnType<typeof useToast>;
  lang: string;
  chaptersData: ChaptersData;
  selectedTranslations: number[];
  setIsNoteModalOpen: (isOpen: boolean) => void;
  unpinVerseWithSync: (verseKey: string) => Promise<void>;
  clearPinnedWithSync: () => Promise<void>;
  onGoToVerse: (chapterId: string, verseNumber: string) => void;
}

const usePinnedVerseHandlers = ({
  pinnedVerses,
  router,
  t,
  toast,
  lang,
  chaptersData,
  selectedTranslations,
  setIsNoteModalOpen,
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

  const handleAddNote = useCallback(() => {
    logButtonClick('study_mode_add_note');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsNoteModalOpen(true);
  }, [router, setIsNoteModalOpen]);

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
    handleAddNote,
    handleCopy,
  };
};

export default usePinnedVerseHandlers;
