import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './PinnedVersesBar.module.scss';
import menuStyles from './PinnedVersesMenu.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import CopyIcon from '@/icons/copy.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import TrashIcon from '@/icons/trash.svg';

interface PinnedVersesMenuProps {
  onClear: () => void;
  onCopy?: () => void;
}

const PinnedVersesMenu: React.FC<PinnedVersesMenuProps> = ({ onClear, onCopy }) => {
  const { t } = useTranslation('quran-reader');

  return (
    <PopoverMenu
      contentClassName={menuStyles.menuContent}
      align={PopoverMenuAlign.END}
      trigger={
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          tooltip={t('common:more')}
          ariaLabel={t('common:more')}
          className={styles.moreButton}
        >
          <OverflowMenuIcon />
        </Button>
      }
    >
      <PopoverMenu.Item
        icon={<CopyIcon className={menuStyles.menuItemIcon} />}
        onClick={onCopy}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('copy-pinned')}</span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<TrashIcon className={menuStyles.menuItemIcon} />}
        onClick={onClear}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('clear-pinned')}</span>
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default PinnedVersesMenu;
