import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './PinnedVersesSection.module.scss';
import usePinnedVerseHandlers from './usePinnedVerseHandlers';

import PinnedVersesContent from '@/components/QuranReader/PinnedVersesBar/PinnedVersesContent';
import DataContext from '@/contexts/DataContext';
import { useToast } from '@/dls/Toast/Toast';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectStudyModeVerseKey } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';
import ChaptersData from 'types/ChaptersData';

interface PinnedVersesSectionProps {
  onGoToVerse: (chapterId: string, verseNumber: string) => void;
}

const PinnedVersesSection: React.FC<PinnedVersesSectionProps> = ({ onGoToVerse }) => {
  const { t, lang } = useTranslation('quran-reader');
  const toast = useToast();
  const chaptersData = useContext(DataContext) as ChaptersData;

  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const currentStudyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const { unpinVerseWithSync, clearPinnedWithSync } = usePinnedVerseSync();

  const { handleVerseTagClick, handleRemoveVerse, handleClear, handleCopy } =
    usePinnedVerseHandlers({
      pinnedVerses,
      t,
      toast,
      lang,
      chaptersData,
      selectedTranslations,
      unpinVerseWithSync,
      clearPinnedWithSync,
      onGoToVerse,
    });

  if (pinnedVerses.length === 0) {
    return null;
  }

  return (
    <div className={styles.pinnedSection}>
      <PinnedVersesContent
        pinnedVerses={pinnedVerses}
        selectedVerseKey={currentStudyModeVerseKey}
        showCompareButton={false}
        noPadding
        onVerseTagClick={handleVerseTagClick}
        onRemoveVerse={handleRemoveVerse}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default PinnedVersesSection;
