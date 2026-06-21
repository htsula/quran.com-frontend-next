import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import heroButtonStyles from '@/components/HomePage/HeroButtons/HeroButtons.module.scss';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import IconHeadphonesFilled from '@/icons/headphones-filled.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { RECITERS_URL } from '@/utils/navigation';

const RecitersButton = () => {
  const { t } = useTranslation('common');

  const onClick = () => {
    logButtonClick('home_reciters');
  };

  return (
    <Button
      variant={ButtonVariant.Simplified}
      className={heroButtonStyles.button}
      onClick={onClick}
      size={ButtonSize.Small}
      href={RECITERS_URL}
    >
      <div className={heroButtonStyles.buttonContent}>
        <IconContainer
          size={IconSize.Xsmall}
          icon={<IconHeadphonesFilled />}
          shouldForceSetColors={false}
        />
        <p className={heroButtonStyles.navigateQuranText}>{t('reciters')}</p>
      </div>
    </Button>
  );
};

export default RecitersButton;
