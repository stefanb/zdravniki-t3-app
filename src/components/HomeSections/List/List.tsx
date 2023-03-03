import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useDebounce } from 'usehooks-ts';

import { Footer } from '@/components/Footer';
import useDoctors from '@/lib/hooks/useDoctors';
import useBoundStore from '@/lib/store/useBoundStore';
import { createDoctorFilter, normalize } from '@/lib/utils/search';
import type { Doctor } from '@/server/api/routers/doctors';

import styles from './List.module.css';

const List = () => {
  const { data, status } = useDoctors();
  const accepts = useBoundStore(state => state.accepts);
  const bounds = useBoundStore(state => state.bounds);
  const search = useBoundStore(state => state.search);
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  const { t } = useTranslation('map');

  if (status === 'loading') {
    return <div>loading...</div>;
  }

  if (status === 'error') {
    return <div>error</div>;
  }

  const doctorFilter = bounds
    ? createDoctorFilter({ accepts, bounds, search: debouncedSearch })
    : () => true;
  const filteredDoctors = doctorFilter
    ? data?.doctors
        .filter(doctorFilter)
        .sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)))
    : [];

  const drByAlphabet = new Map<string, Doctor[]>();

  // create a map by alphabet
  filteredDoctors?.forEach(doctor => {
    const firstLetter = doctor.name[0]?.toUpperCase() ?? '';
    if (!firstLetter) return;
    if (drByAlphabet.has(firstLetter)) {
      const existing = drByAlphabet.get(firstLetter) as Doctor[];
      drByAlphabet.set(firstLetter, [...existing, doctor]);
    } else {
      drByAlphabet.set(firstLetter, [doctor]);
    }
  });

  const list = Array.from(drByAlphabet.entries())
    .sort((a, b) => {
      return a[0].localeCompare(b[0]);
    })
    .map(([letter, doctors]) => (
      <li key={letter}>
        <div>{letter}</div>
        <ul>
          {doctors.map(doctor => (
            <li key={doctor.fakeId}>
              <div>
                {doctor.href ? (
                  <Link
                    href={doctor.href}
                    passHref
                    locale={router.locale}
                    hrefLang={router.locale}
                  >
                    {doctor.name}
                  </Link>
                ) : (
                  <span>{doctor.name}</span>
                )}
                <div>{doctor.institution?.location.address?.fullAddress}</div>
              </div>
            </li>
          ))}
        </ul>
      </li>
    ));

  const headerStyles = clsx(styles.ListHeader);
  const innerContainerStyles = clsx(styles.ListInnerContainer);

  const totalHits = t('totalHits', { count: filteredDoctors?.length ?? 0 });

  return (
    <>
      <header className={headerStyles}>{totalHits}</header>
      <ul className={innerContainerStyles}>
        {list}
        {list.length === 0 && <li>Refine your search</li>}
      </ul>
      <Footer position="list" />
    </>
  );
};

export default List;
