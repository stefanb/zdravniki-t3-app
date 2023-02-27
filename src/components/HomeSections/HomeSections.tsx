import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import styles from '@/layouts/Layout.module.css';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  SL_CENTER,
  ZOOM,
  maxBounds,
} from '@/lib/constants/map';
import type { LeafletMap } from '@/lib/types/Map';

import { Filters } from './Filters';
import { List } from './List';
import type { View } from './types';

const MapSkeleton = () => <div>loading map...</div>;

const HomeSections = () => {
  const BigMapWithNoSSR = useMemo(
    () =>
      dynamic(() => import('./BigMap').then(mod => mod.BigMap), {
        ssr: false,
        loading: MapSkeleton,
      }),
    []
  );

  const [layoutVisible, setLayoutVisible] = useState<View>('map');
  const [map, setMap] = useState<null | LeafletMap>(null);

  const onLayoutChange = () => {
    setLayoutVisible(prev => (prev === 'map' ? 'list' : 'map'));
  };

  const mapStyles = clsx(
    styles.MapSection,
    styles.Absolute,
    layoutVisible === 'map' && styles.Visible
  );

  const listStyles = clsx(
    styles.ListSection,
    styles.Absolute,
    layoutVisible === 'list' && styles.Visible
  );

  return (
    <>
      <section id="map" className={mapStyles}>
        <BigMapWithNoSSR
          center={SL_CENTER as [number, number]}
          maxBounds={maxBounds}
          setMap={setMap}
          zoom={ZOOM}
          maxZoom={MAX_ZOOM}
          minZoom={MIN_ZOOM}
        />
      </section>
      <section id="list" className={listStyles}>
        <List map={map} />
      </section>
      <section id="filters" className={styles.FiltersSection}>
        <Filters onLayoutChange={onLayoutChange} view={layoutVisible} />
      </section>
    </>
  );
};

export default HomeSections;
