import { useState } from 'react';

import classNames from 'classnames';

import AudioPlayerOverflowMenuTrigger from './AudioPlayerOverflowMenuTrigger';
import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import PopoverMenu, { PopoverMenuExpandDirection } from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import { logEvent } from '@/utils/eventLogger';

interface OverflowAudioPlayerActionsMenuProps {
  isEmbedded?: boolean;
}

const OverflowAudioPlayerActionsMenu = ({ isEmbedded }: OverflowAudioPlayerActionsMenuProps) => {
  const direction = useDirection();
  const [open, setOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => {
    logEvent(`audio_player_overflow_menu_${open ? 'open' : 'close'}`);
    setOpen(newOpen);
  };

  return (
    <div dir={direction}>
      <PopoverMenu
        isOpen={open}
        isPortalled
        trigger={<AudioPlayerOverflowMenuTrigger />}
        onOpenChange={onOpenChange}
        contentClassName={classNames(styles.overriddenPopoverMenuContentPositioning, {
          [styles.embeddedContent]: isEmbedded,
        })}
        shouldUseModalZIndex={isEmbedded}
        {...(isEmbedded && { expandDirection: PopoverMenuExpandDirection.TOP })}
      >
        <OverflowAudioPlayActionsMenuBody isEmbedded={isEmbedded} />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
