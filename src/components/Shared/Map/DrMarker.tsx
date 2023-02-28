import type { CircleMarker as CMarker } from 'leaflet';
import type { Ref } from 'react';
import { forwardRef } from 'react';
import { CircleMarker } from 'react-leaflet';

import type { LatLngLiteral } from '@/lib/types/Map';

type DrMarkerProps = {
  accepts: 'y' | 'n';
  center: LatLngLiteral;
  children?: React.ReactNode;
  className?: string;
};

const DrMarker = (
  { center, children, className, accepts }: DrMarkerProps,
  ref: Ref<CMarker>
) => {
  return (
    <CircleMarker
      ref={ref}
      center={center}
      fillColor="currentColor"
      fillOpacity={0.7}
      stroke={false}
      radius={12}
      className={className}
      data-accepts={accepts}
    >
      {children}
    </CircleMarker>
  );
};

export default forwardRef(DrMarker);
