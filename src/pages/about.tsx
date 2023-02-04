import { MDXProvider } from '@mdx-js/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import AboutEN from '@/content/en/about.mdx';
import AboutIT from '@/content/it/about.mdx';
import AboutSL from '@/content/sl/about.mdx';
import type { Locale } from '@/types/i18n';

import nextI18nextConfig from '../../next-i18next.config.js';

const AboutIntlMap = {
  default: AboutSL,
  it: AboutIT,
  sl: AboutSL,
  en: AboutEN,
} as const;

const LanguagePageMDX = function LanguagePageMDX({ name }: { name: Locale }) {
  const Page = AboutIntlMap[`${name}`];
  return <Page id="about-mdx" />;
};

function About({ locale }: { locale: Locale }) {
  return (
    <MDXProvider components={{}}>
      <LanguagePageMDX name={locale} />
    </MDXProvider>
  );
}

export async function getStaticProps({ locale }: { locale: Locale }) {
  if (locale === 'default') {
    return { notFound: true };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18nextConfig)),
      locale,
      // Will be passed to the page component as props
    },
  };
}

export default About;