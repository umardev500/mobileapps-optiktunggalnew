import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { default as lang } from '../../lang';
import { isDev } from '../config';

const localization = i18n.use(initReactI18next);

if (!localization.isInitialized) {
  localization.init({
    debug: isDev,

    lng: 'id',
    fallbackLng: 'id',
    keySeparator: false,

    resources: lang,
  });
}
