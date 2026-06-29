import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './AppContent.module.scss';

import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import GlobalListeners from '@/components/GlobalListeners';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/dls/Footer/Footer';
import useShowNavbar from '@/hooks/useShowNavbar';
import { selectIsLanguageDrawerOpen, selectIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { isQuranReaderRoutePathname } from '@/utils/routes';
import { createSEOConfig } from '@/utils/seo';

interface AppContentProps {
  Component: any;
  pageProps: any;
}

function AppContent({ Component, pageProps }: AppContentProps) {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');
  // On reader routes the navbar bar is not rendered (the ContextMenu is the top
  // header), so the navbar no longer occupies any space.
  const isReaderRoute = isQuranReaderRoutePathname(router.pathname);
  const showNavbar = useShowNavbar();
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isLanguageDrawerOpen = useSelector(selectIsLanguageDrawerOpen);

  return (
    <div
      className={classNames({
        navbarVisible: showNavbar,
        navbarHidden: !showNavbar,
      })}
    >
      <DefaultSeo {...createSEOConfig({ locale, description: t('default-description') })} />
      <GlobalListeners />
      <Navbar />
      <div
        className={classNames(styles.contentContainer, {
          [styles.dimmed]: isSettingsDrawerOpen || isLanguageDrawerOpen,
          [styles.readerRoute]: isReaderRoute,
        })}
        {...((isSettingsDrawerOpen || isLanguageDrawerOpen) && {
          inert: true,
          'aria-hidden': true, // eslint-disable-line @typescript-eslint/naming-convention
        })}
      >
        <Component {...pageProps} />
      </div>
      <AudioPlayer />
      <Footer />
    </div>
  );
}

export default AppContent;
