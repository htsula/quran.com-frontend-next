import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './EndOfSurahSection.module.scss';
import ReadMoreCard from './ReadMoreCard';

import { getChapterMetadata } from '@/api';
import Link from '@/dls/Link/Link';
import useScrollToTop from '@/hooks/useScrollToTop';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { makeChapterMetadataUrl } from '@/utils/apiPaths';
import { getNextChapterNumber } from '@/utils/chapter';
import EventName from '@/utils/event-names';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahNavigationUrl } from '@/utils/navigation';

interface EndOfSurahSectionProps {
  chapterNumber: number;
}

const EndOfSurahSection: React.FC<EndOfSurahSectionProps> = ({ chapterNumber }) => {
  const { t, lang } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  const { data: metadataResponse } = useSWRImmutable(
    makeChapterMetadataUrl(String(chapterNumber), lang),
    () => getChapterMetadata(String(chapterNumber), lang),
  );

  const chapterMetadata = metadataResponse?.chapterMetadata;

  const nextChapterId = getNextChapterNumber(chapterNumber, isReadingByRevelationOrder);

  const handleCtaClick = () => {
    logButtonClick(EventName.QURAN_READER_END_OF_SURAH_CTA);
  };

  return (
    <div className={styles.container} data-testid="end-of-surah-section">
      <div className={styles.ctaContainer}>
        <h2 className={styles.header}>{t('end-of-surah.header')}</h2>
        {nextChapterId && (
          <Link
            onClick={handleCtaClick}
            href={getSurahNavigationUrl(nextChapterId)}
            className={styles.cta}
          >
            {t('end-of-surah.cta')}
          </Link>
        )}
      </div>

      <div className={styles.cardsGrid}>
        <ReadMoreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          nextSummaries={chapterMetadata?.nextChapter?.summaries}
          previousSummaries={chapterMetadata?.previousChapter?.summaries}
          onScrollToTop={scrollToTop}
        />

        {/* <ExploreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          verseKey={verseKey}
          suggestions={chapterMetadata?.suggestions}
          hasQuestions={hasQuestions}
          hasClarificationQuestion={hasClarificationQuestion}
          onStudyModeOpen={handleStudyModeOpen}
        />

        <StreakGoalCard cardClassName={styles.card} /> */}
      </div>
    </div>
  );
};

export default EndOfSurahSection;
