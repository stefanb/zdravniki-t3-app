import { clsx } from 'clsx';
import { useRef, useState } from 'react';

import { IconButton } from '@/components/Shared/Buttons';
import { ListSvg, MapSvg } from '@/components/Shared/Icons';

import styles from './Filters.module.css';
import { SearchInput } from './SearchInput';
import type { View } from '../types';

type Props = { onLayoutChange: () => void; view: View };

const Filters = ({ onLayoutChange, view }: Props) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState('');

  const searchContainerStyles = clsx(styles.SearchContainer);

  const toggleViewContaineStyles = clsx(
    styles.ToggleViewContainer,
    view === 'loading' && styles.Loading
  );
  const iconButtonStyles = clsx(
    styles.Btn,
    view !== 'list' && styles.Map,
    view === 'list' && styles.List
  );

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div id="filters-container" className={styles.Filters}>
      <div id="filters-first-container">Info</div>
      <div
        id="filters-second-container"
        className={styles.FiltersSecondContainer}
      >
        <div id="search-container" className={searchContainerStyles}>
          <SearchInput
            ref={searchInputRef}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
        <div id="toggle-view-container" className={toggleViewContaineStyles}>
          <IconButton
            type="button"
            onClick={onLayoutChange}
            className={iconButtonStyles}
          >
            <MapSvg />
            <ListSvg />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Filters;