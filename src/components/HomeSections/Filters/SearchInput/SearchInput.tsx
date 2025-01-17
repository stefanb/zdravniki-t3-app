import { clsx } from 'clsx';
import { useTranslation } from 'next-i18next';
import type { ForwardedRef, RefObject } from 'react';
import { forwardRef, useRef, useState } from 'react';

import { IconButton } from '@/components/Shared/Buttons';
import { CloseSvg as CancelIcon, SearchSvg } from '@/components/Shared/Icons';

import styles from './SearchInput.module.css';

type Props = { value?: string; onChange?: (value: string) => void };

const SearchInput = (
  { value, onChange }: Props,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(value);
  const { t } = useTranslation('common');

  const searchLabelStyles = clsx(styles.SearchLabel);
  const searchInputStyles = clsx(styles.SearchInput);
  const searchIconStyles = clsx(styles.Icon, styles.SearchIcon);
  const cancelIconStyles = clsx(
    styles.Icon,
    styles.CancelIcon,
    value ?? searchValue ? styles.Visible : styles.Hidden
  );

  const onSearchFocus = () => {
    if (ref) {
      (ref as RefObject<HTMLInputElement>).current?.focus();
      return;
    }

    internalRef.current?.focus();
  };

  const onClear = () => {
    setSearchValue('');
    onChange?.('');
    onSearchFocus();
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <label
      className={searchLabelStyles}
      aria-label="Search for doctors by name, location, etc."
      onClickCapture={onSearchFocus}
    >
      <IconButton
        type="button"
        className={searchIconStyles}
        disabled
        aria-hidden="true"
      >
        <SearchSvg />
      </IconButton>
      <input
        ref={ref ?? internalRef}
        type="search"
        placeholder={t`search.placeholder` ?? 'Search'}
        onChange={onSearchChange}
        value={value ?? searchValue}
        className={searchInputStyles}
      />
      <IconButton
        type="button"
        className={cancelIconStyles}
        onClick={onClear}
        aria-label="Clear search"
        aria-hidden={searchValue ? 'false' : 'true'}
        tabIndex={searchValue ? 0 : -1}
      >
        <CancelIcon />
      </IconButton>
    </label>
  );
};

export default forwardRef<HTMLInputElement, Props>(SearchInput);
