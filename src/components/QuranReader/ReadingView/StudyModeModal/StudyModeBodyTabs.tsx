import { useLayoutEffect } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeBodyTabs.module.scss';
import { StudyModeTabId } from './StudyModeBottomActions';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import { verseHasRelatedVerses } from '@/data/relatedVerses';
import useBatchedCountRangeHadiths from '@/hooks/auth/useBatchedCountRangeHadiths';
import BookIcon from '@/icons/book-open.svg';
import HadithIcon from '@/icons/bx-book.svg';
import RelatedVerseIcon from '@/icons/related-verses.svg';
import { AyahHadithsResponse } from '@/types/Hadith';
import { toLocalizedNumber } from '@/utils/locale';

const Loading = () => (
  <div className={styles.edgeToEdge}>
    <TafsirSkeleton />
  </div>
);

export const StudyModeTafsirTab = dynamic(() => import('./tabs/StudyModeTafsirTab'), {
  loading: Loading,
});

const StudyModeHadithTab = dynamic(() => import('./tabs/Hadith'), {
  loading: Loading,
});

export const StudyModeRelatedVersesTab = dynamic(
  () => import('./tabs/StudyModeRelatedVerses/StudyModeRelatedVersesTab'),
  { loading: TafsirSkeleton },
);

interface TabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
  tafsirIdOrSlug?: string;
  hadithsInitialData?: AyahHadithsResponse;
  onGoToVerse?: (chapterId: string, verseNumber: string, previousVerseKey?: string) => void;
  setRelatedVersesCount?: (count: number) => void;
}

export const TAB_COMPONENTS: Partial<Record<StudyModeTabId, React.ComponentType<TabProps>>> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.RELATED_VERSES]: StudyModeRelatedVersesTab,
  [StudyModeTabId.HADITH]: StudyModeHadithTab,
};

export type TabConfig = {
  id: StudyModeTabId;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  condition: boolean;
};

/**
 * Hook to generate tab configuration for StudyModeBottomActions.
 *
 * @param {object} props
 * @param {StudyModeTabId | null | undefined} props.activeTab - Currently active tab
 * @param {string} props.verseKey - Current verse key
 * @param {Function} [props.onTabChange] - Callback when tab is clicked
 * @param {number | null} [props.relatedVersesCount] - Count of related verses
 * @returns {TabConfig[]} Array of tab configurations
 */
export const useStudyModeTabs = ({
  activeTab,
  verseKey,
  onTabChange,
  relatedVersesCount,
}: {
  activeTab: StudyModeTabId | null | undefined;
  verseKey: string;
  onTabChange?: (tabId: StudyModeTabId | null) => void;
  relatedVersesCount?: number | null;
}): TabConfig[] => {
  const { t, lang } = useTranslation('common');

  const { data: hadithCount, isLoading: isLoadingHadiths } = useBatchedCountRangeHadiths(verseKey);
  const hasHadiths = (hadithCount ?? 0) > 0 || isLoadingHadiths;

  // Used flushSync to wrap the onTabChange(null) calls, ensuring React performs the state update synchronously and triggers an immediate rerender.
  useLayoutEffect(() => {
    if (activeTab === StudyModeTabId.HADITH && !hasHadiths) onTabChange?.(null);
  }, [activeTab, hasHadiths, onTabChange]);

  const handleTabClick = (tabId: StudyModeTabId) => {
    const newTab = activeTab === tabId ? null : tabId;
    onTabChange?.(newTab);
  };

  return [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: () => handleTabClick(StudyModeTabId.TAFSIR),
      condition: true,
    },
    {
      id: StudyModeTabId.HADITH,
      label: t('quran-reader:hadith.title'),
      icon: <HadithIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: () => handleTabClick(StudyModeTabId.HADITH),
      condition: hasHadiths,
    },
    {
      id: StudyModeTabId.RELATED_VERSES,
      label: relatedVersesCount
        ? `${t('related-verses')} (${toLocalizedNumber(relatedVersesCount, lang)})`
        : t('related-verses'),
      icon: <RelatedVerseIcon />,
      onClick: () => handleTabClick(StudyModeTabId.RELATED_VERSES),
      condition: verseHasRelatedVerses(verseKey),
    },
  ];
};
