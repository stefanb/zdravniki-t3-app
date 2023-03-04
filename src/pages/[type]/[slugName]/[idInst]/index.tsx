import type { ParsedUrlQuery } from 'querystring';

import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Papa from 'papaparse';

import nextI18nextConfig from '@/../../next-i18next.config.js';
import { DOCTORS_CSV_URL } from '@/lib/constants/data-url';
import { drListSchema } from '@/lib/types/doctors';
import { instTransformedSchema } from '@/lib/types/institutions';
import {
  PARSE_OPTIONS,
  fetchDrAndInstDataAndParse,
} from '@/lib/utils/fetch-and-parse';
import { drPersonalPageSchema, slugSchema } from '@/lib/utils/zod';
import type { Doctor } from '@/server/api/routers/doctors';

interface DrTypeNameInstPageProps {
  doctors: Doctor[];
}

interface DrTypeNameInstPageParams extends ParsedUrlQuery {
  type: string;
  slugName: string;
  idInst: string;
}

const DrTypeNameInstPage: NextPage<DrTypeNameInstPageProps> = ({ doctors }) => {
  const router = useRouter();
  const goBack = () => {
    router.back();
  };
  return (
    <div>
      {doctors?.map(doctor => (
        <div key={doctor.fakeId}>{doctor.name}</div>
      ))}
      <button type="button" onClick={goBack} style={{ cursor: 'pointer' }}>
        Nazaj
      </button>
    </div>
  );
};

export default DrTypeNameInstPage;

export const getStaticProps: GetStaticProps<
  DrTypeNameInstPageProps,
  DrTypeNameInstPageParams
> = async ctx => {
  const { params } = ctx;
  const drTypePage = drPersonalPageSchema.safeParse(params);

  if (!drTypePage.success) {
    return { notFound: true };
  }

  const { doctorsParsedFromCsv, institutionsParsedFromCsv } =
    await fetchDrAndInstDataAndParse();

  const doctorsFiltered = doctorsParsedFromCsv.data.filter(
    doctor =>
      (doctor.id_inst satisfies string) === drTypePage.data.idInst &&
      drTypePage.data.type.includes(doctor.type) &&
      drTypePage.data.slugName === slugSchema.parse(doctor.doctor)
  );

  if (!doctorsFiltered || doctorsFiltered.length === 0) {
    return { notFound: true };
  }

  const doctorsValidated = drListSchema.parse(doctorsFiltered);

  const doctors = doctorsValidated.map(doctor => {
    const institution = institutionsParsedFromCsv.data.find(
      institution => institution.id_inst === doctor.idInst
    );

    return {
      ...doctor,
      provider: institution?.name ?? '',
      institution: instTransformedSchema.parse(institution),
    };
  });

  return {
    props: {
      ...(await serverSideTranslations(
        ctx.locale ?? 'sl',
        ['common', 'doctor', 'map'],

        nextI18nextConfig
      )),
      // Will be passed to the page component as props
      doctors,
    },
    revalidate: 1, // to reconsider how often to revalidate; more: https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration
  };
};

export const getStaticPaths: GetStaticPaths<
  DrTypeNameInstPageParams
> = async () => {
  const doctorsResponse = await fetch(DOCTORS_CSV_URL);
  const doctorsResult = await doctorsResponse.text();
  const doctorsParsedFromCsv = Papa.parse(
    doctorsResult,
    PARSE_OPTIONS
  ).data.slice(0, 10);

  const doctorsValidated = drListSchema.parse(doctorsParsedFromCsv);

  const paths = doctorsValidated.map(doctor => ({
    params: {
      type: doctor.typePage,
      slugName: doctor.slugName,
      idInst: doctor.idInst,
    },
    locale: 'sl',
  }));

  return { paths, fallback: 'blocking' };
};