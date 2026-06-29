import React from 'react';

import CopyMenuItem from './MenuItems/CopyMenuItem';
import MoreMenuItem from './MenuItems/MoreMenuItem';
import PinMenuItem from './MenuItems/PinMenuItem';
import PlayAudioMenuItem from './MenuItems/PlayAudioMenuItem';
import ShareMenuItem from './MenuItems/ShareMenuItem';
import TafsirMenuItem from './MenuItems/TafsirMenuItem';
import TranslationsMenuItem from './MenuItems/TranslationsMenuItem';
import VerseActionsMenuType from './types';

import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
  onMenuChange: (menu: VerseActionsMenuType) => void;
  openShareModal?: () => void;
}

const MainActionsMenu: React.FC<Props> = ({
  verse,
  onActionTriggered,
  onMenuChange,
  openShareModal,
}) => {
  return (
    <>
      {verse?.timestamps && (
        <PlayAudioMenuItem
          verse={{
            verseKey: verse.verseKey,
            timestamps: verse.timestamps,
            chapterId: verse.chapterId,
            verseNumber: verse.verseNumber,
          }}
          onActionTriggered={onActionTriggered}
        />
      )}

      <TranslationsMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <TafsirMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <CopyMenuItem verse={verse} onActionTriggered={onActionTriggered} />
      <PinMenuItem verse={verse} onActionTriggered={onActionTriggered} />

      {/* Submenu navigation items */}
      <ShareMenuItem onActionTriggered={onActionTriggered} openShareModal={openShareModal} />
      <MoreMenuItem onMenuChange={onMenuChange} />
    </>
  );
};

export default MainActionsMenu;
