import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import PlaybackControls from '../PlaybackControls';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface AudioPlayerBodyProps {
  isEmbedded?: boolean;
}

const AudioPlayerBody = ({ isEmbedded }: AudioPlayerBodyProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);

  return (
    <>
      <div className={styles.innerContainer}>
        <AudioKeyBoardListeners
          togglePlaying={() => audioService.send('TOGGLE')}
          isAudioPlayerHidden={false}
        />
        {!isRadioMode && (
          <div className={styles.sliderContainer}>
            <AudioPlayerSlider isEmbedded={isEmbedded} />
          </div>
        )}
      </div>
      {isRadioMode ? (
        <RadioPlaybackControl radioActor={audioService.getSnapshot().context.radioActor} />
      ) : (
        <PlaybackControls isEmbedded={isEmbedded} />
      )}
    </>
  );
};

export default AudioPlayerBody;
