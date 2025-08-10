import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import XHR from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';

// import homepageTr from '@/locales/tr/homepage.json';
// import commonKr from '@/locales/kr/common.json';
// import homepageKr from '@/locales/kr/homepage.json';
// import commonVi from '@/locales/vi/common.json';
// import homepageVi from '@/locales/vi/homepage.json';
import { LANGUAGE_KEY } from './constants';

function getTranConfigs(lang: string) {
  return {
    translation: {
      launchpad: require(`@/locales/${lang}/launchpad.json`),
      header: require(`@/locales/${lang}/header.json`),
      modal: require(`@/locales/${lang}/modal.json`),
      odyssey: require(`@/locales/${lang}/odyssey.json`),
      tgp: require(`@/locales/${lang}/tgp.json`),
      common: require(`@/locales/${lang}/common.json`),
      notification: require(`@/locales/${lang}/notification.json`),
      mobile: require(`@/locales/${lang}/mobile.json`),
      errors: require(`@/locales/${lang}/errors.json`),
      tooltip: require(`@/locales/${lang}/tooltip.json`),
      campaign: require(`@/locales/${lang}/campaign.json`),
      year2024Summary: require(`@/locales/${lang}/year2024Summary.json`),
      spot: require(`@/locales/${lang}/spot.json`),
      affiliates: require(`@/locales/${lang}/affiliates.json`),
      ...require(`@/locales/${lang}/contractErrors.json`),
    },
  };
}

const resources = {
  en: getTranConfigs('en'),
  tr: getTranConfigs('tr'),
  // kr: getTranConfigs('kr'),
  vi: getTranConfigs('vi'),
  es: getTranConfigs('es'),
  fr: getTranConfigs('fr'),
  ja: getTranConfigs('ja'),
  th: getTranConfigs('th'),
};

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem(LANGUAGE_KEY) || 'en',
    // backend: {
    //   loadPath: `@/locales/{{lng}}/*.json`,
    // },
    react: {
      useSuspense: true,
    },
    fallbackLng: 'en',
    preload: [localStorage.getItem(LANGUAGE_KEY) || 'en'],
    interpolation: { escapeValue: false },
  });

export default i18n;
