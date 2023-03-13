import { clsx } from 'clsx';
import { useTranslation } from 'next-i18next';

import { IBMPlexSans } from '@/assets/fonts';
import { api } from '@/lib/utils/api';

import styles from './Footer.module.css';
import { LongDate } from '../Shared/LongDate';

type FooterProps = {
  position?: 'mdx' | 'list';
};

const Footer = ({ position = 'mdx' }: FooterProps) => {
  const positionStyles = clsx(
    position === 'mdx' && styles.Mdx,
    position === 'list' && styles.List
  );
  const { t } = useTranslation('common');

  const ts = api.timestamp.doctors.useQuery();

  // LongDate handles the error case
  const timestamp = ts.data?.success ? ts.data.data * 1000 : 'error';

  const footerStyles = clsx(
    styles.Footer,
    IBMPlexSans.className,
    positionStyles
  );

  const contentStyles = clsx(styles.Content, positionStyles);

  const dataSource = t`footer.dataSource`;
  const lastChange = t`footer.lastChange`;
  const zzzs = t`footer.zzzs`;
  const gurs = t`footer.gurs`;

  return (
    <footer className={footerStyles}>
      <div className={contentStyles}>
        <div>
          {dataSource}:{' '}
          <a href="https://www.zzzs.si" target="_blank" rel="noreferrer">
            <abbr title={zzzs}>ZZZS</abbr>
          </a>
          ,{' '}
          <a
            href="https://www.gov.si/drzavni-organi/organi-v-sestavi/geodetska-uprava/"
            target="_blank"
            rel="noreferrer"
          >
            <abbr title={gurs}>GURS</abbr>
          </a>
          <br />
          {lastChange}: <LongDate timestamp={timestamp} />
          .
          <br />© 2021-{new Date().getFullYear()} <strong>Sledilnik.org</strong>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
