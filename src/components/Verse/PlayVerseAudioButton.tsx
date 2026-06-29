import React, { useCallback, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useIsMobile from '@/hooks/useIsMobile';
import PlayIcon from '@/icons/play-outline.svg';
import QueryParam from '@/types/QueryParam';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { selectIsVerseLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface PlayVerseAudioProps {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
}
const PlayVerseAudioButton: React.FC<PlayVerseAudioProps> = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.RECITER,
  );
  const isVerseLoading = useXstateSelector(audioService, (state) =>
    selectIsVerseLoading(state, verseKey),
  );
  const chapterId = getChapterNumberFromKey(verseKey);
  const verseNumber = getVerseNumberFromKey(verseKey);
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const onPlayClicked = useCallback(() => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_play_verse`);

    audioService.send({
      type: 'PLAY_AYAH',
      surah: chapterId,
      ayahNumber: verseNumber,
      reciterId: reciterQueryParamDifferent ? reciterId : undefined,
    });

    onActionTriggered?.();
  }, [
    audioService,
    chapterId,
    isTranslationView,
    onActionTriggered,
    reciterId,
    reciterQueryParamDifferent,
    verseNumber,
  ]);

  if (isVerseLoading) {
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={isMobile ? undefined : t('loading')}
        type={ButtonType.Success}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        className="play-audio-button" // this class is for onboarding
      >
        <Spinner />
      </Button>
    );
  }

  return (
    <Button
      size={ButtonSize.Small}
      tooltip={isMobile ? undefined : t('audio.player.play')}
      variant={ButtonVariant.Ghost}
      onClick={onPlayClicked}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      id="play-verse-button" // this ID is for onboarding
      className={classNames(styles.iconContainer, styles.verseAction)}
      ariaLabel={t('aria.play-surah', { surahName: chapterData.transliteratedName })}
    >
      <span className={classNames(styles.icon, styles.playIcon)}>
        <IconContainer
          icon={<PlayIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      </span>
    </Button>
  );
};
export default PlayVerseAudioButton;
