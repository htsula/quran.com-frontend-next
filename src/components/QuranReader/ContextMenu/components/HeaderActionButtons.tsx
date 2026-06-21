import React from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconHome from '@/icons/home.svg';
import { ROUTES } from '@/utils/navigation';

const ThemeSwitcher = dynamic(() => import('@/components/Navbar/ThemeSwitcher'), {
  ssr: false,
  loading: () => <Spinner />,
});

/**
 * The theme switcher and home buttons that used to live in the navbar.
 * On Quran reader routes the navbar bar is hidden, so these are rendered inside
 * the ContextMenu next to the settings button instead. The language selector is
 * not surfaced in reader mode.
 *
 * @returns {JSX.Element} The theme and home action buttons.
 */
const HeaderActionButtons: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <ThemeSwitcher />
      <Button
        href={ROUTES.HOME}
        tooltip={t('home')}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        shouldFlipOnRTL={false}
        ariaLabel={t('home')}
        data-testid="navbar-home-button"
      >
        <IconHome />
      </Button>
    </>
  );
};

export default HeaderActionButtons;
