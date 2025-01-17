import { clsx } from 'clsx';
import { useRef } from 'react';

import { LinkSvg } from '@/components/Shared/Icons';
import { Polymorphic } from '@/components/Shared/Polymorphic';

import styles from './ComponentsMDX.module.css';

type HeadingAnchorProps = {
  headingText: string;
};

const HeadingAnchor = ({ headingText }: HeadingAnchorProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const href = '#' + headingText.trim().replaceAll(' ', '-').toLowerCase();
  const headingAnchorStyles = clsx(styles.ComponentsMDX, styles.HeadingAnchor);

  return (
    <Polymorphic
      ref={ref}
      as="a"
      href={href}
      className={headingAnchorStyles}
      onClick={() => ref.current?.parentElement?.scrollIntoView()}
      aria-label={`Link to ${headingText}`}
    >
      <LinkSvg width="1rem" height="1rem" />
    </Polymorphic>
  );
};

export default HeadingAnchor;
