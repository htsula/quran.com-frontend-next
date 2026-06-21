import React, { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import StudyModeBodyContent from '../../StudyModeBodyContent';

import styles from './StudyModeRelatedVerses.module.scss';
import StudyModeRelatedVerseSkeleton from './StudyModeRelatedVerseSkeleton';

import { fetcher } from '@/api';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import useQcfFont from '@/hooks/useQcfFont';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import RelatedVerse from 'types/RelatedVerse';
import Verse from 'types/Verse';

interface VerseResponse {
  verse: Verse;
}

const NOOP = (): void => {};

interface StudyModeRelatedVerseContentProps {
  relatedVerse: RelatedVerse;
}

const StudyModeRelatedVerseContent: React.FC<StudyModeRelatedVerseContentProps> = ({
  relatedVerse,
}) => {
  const { t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const wordByWordLocale = useSelector(selectWordByWordLocale);

  const handleGoToVerse = useCallback(() => {
    logButtonClick('study_mode_goto_verse', { verseKey: relatedVerse.verseKey });
  }, [relatedVerse.verseKey]);

  // Fetch verse data when collapsible is opened
  const queryKey = makeByVerseKeyUrl(relatedVerse.verseKey, {
    words: true,
    translationFields: 'resource_name,language_id',
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
    wordTranslationLanguage: wordByWordLocale,
    wordTransliteration: 'true',
  });

  const { data, isValidating } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const verse = data?.verse;

  const versesForFont = useMemo(() => (verse ? [verse] : []), [verse]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  if (isValidating || !verse) {
    return <StudyModeRelatedVerseSkeleton />;
  }

  return (
    <>
      <div className={styles.relatedVerse}>
        <StudyModeBodyContent
          verse={verse}
          showWordBox={false}
          onWordClick={NOOP}
          onWordBoxClose={NOOP}
          onNavigatePreviousWord={NOOP}
          onNavigateNextWord={NOOP}
          canNavigateWordPrev={false}
          canNavigateWordNext={false}
        />
        <div className={styles.relatedVerseCta}>
          <Button
            className={styles.goToVerseButton}
            size={ButtonSize.Small}
            variant={ButtonVariant.Compact}
            href={getChapterWithStartingVerseUrl(relatedVerse.verseKey)}
            isNewTab
            onClick={handleGoToVerse}
          >
            {t('go-to-verse')}
          </Button>
        </div>
      </div>
      <div className={styles.relatedVerseSeparatorContainer}>
        <Separator />
      </div>
    </>
  );
};

export default StudyModeRelatedVerseContent;
