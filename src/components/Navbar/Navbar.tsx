import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import LanguageDrawer from './LanguageDrawer/LanguageDrawer';
import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';
import SettingsDrawer from './SettingsDrawer/SettingsDrawer';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import {
  selectIsLanguageDrawerOpen,
  selectIsSettingsDrawerOpen,
  selectNavbar,
} from '@/redux/slices/navbar';
import { isQuranReaderRoutePathname } from '@/utils/routes';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const router = useRouter();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isLanguageDrawerOpen = useSelector(selectIsLanguageDrawerOpen);
  // Use the shared hook to debounce navbar visibility changes
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  // On Quran reader routes the ContextMenu acts as the top header and hosts the
  // theme/language buttons, so the floating navbar bar is not rendered. NavbarBody
  // is still mounted (bare) so the reader's SidebarNavigation overlay renders, and
  // the drawers stay mounted so the theme/language/settings buttons still work.
  const isReaderRoute = isQuranReaderRoutePathname(router.pathname);

  return (
    <>
      {isReaderRoute ? (
        <NavbarBody />
      ) : (
        <nav
          className={classNames(styles.container, {
            [styles.hiddenNav]: !showNavbar,
            [styles.dimmed]: isSettingsDrawerOpen || isLanguageDrawerOpen,
          })}
          data-testid="navbar"
          data-isvisible={showNavbar}
        >
          <NavbarBody />
        </nav>
      )}
      {/* Drawers rendered outside nav to avoid transform containment issues */}
      <SettingsDrawer />
      <LanguageDrawer />
    </>
  );
};

export default Navbar;
