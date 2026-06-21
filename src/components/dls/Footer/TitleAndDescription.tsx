import Trans from 'next-translate/Trans';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';

const TitleAndDescription = () => {
  return (
    <div className={styles.titleAndDescriptionContainer}>
      <p className={styles.description}>
        <Trans
          i18nKey="common:footer.description"
          components={{
            br: <br />,
            link: <Link href="https://quran.foundation" variant={LinkVariant.Blend} isNewTab />,
          }}
        />
      </p>
    </div>
  );
};

export default TitleAndDescription;
