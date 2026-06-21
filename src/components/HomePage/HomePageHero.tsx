import { useState } from 'react';

import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import RadioButton from './HeroButtons/RadioButton';
import RecitersButton from './HeroButtons/RecitersButton';
import styles from './HomePageHero.module.scss';

import PopularDropdown from '@/components/HomePage/PopularDropdown';
import SearchInput from '@/components/Search/SearchInput';
import Background from '@/icons/background.svg';

const HomePageHero = () => {
  const { t } = useTranslation('common');
  const [isPopularDropdownOpen, setIsPopularDropdownOpen] = useState(false);

  const handlePopularClick = () => {
    setIsPopularDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = () => {
    setIsPopularDropdownOpen(false);
  };

  return (
    <div className={styles.outerContainer}>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" />
      </Head>
      <div className={styles.backgroundImage}>
        <Background />
      </div>
      <div>
        <div className={styles.innerContainer}>
          <SearchInput placeholder={t('command-bar.placeholder')} shouldExpandOnClick />
          {!isPopularDropdownOpen && (
            <div className={styles.buttonsContainer}>
              <NavigationButton />
              <PopularButton onClick={handlePopularClick} />
              <RadioButton />
              <RecitersButton />
            </div>
          )}
          <PopularDropdown isOpen={isPopularDropdownOpen} onClose={handleDropdownClose} />
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
