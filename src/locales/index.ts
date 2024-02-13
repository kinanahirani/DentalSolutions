import en from './en';
import he from './he';
import {getLocales, uses24HourClock} from 'react-native-localize';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
  he,
  en,
};

/**
 * Localize
 */
const lng = getLocales()[0].languageCode;
// const lng = 'en';
// i18n.use(initReactI18next).init({
//   resources,
//   lng,
//   fallbackLng: 'en',
// });

const isRTL = getLocales()[0].isRTL;
// const isRTL = false;

/**
 *
 */
const localeOptions = {
  hour12: uses24HourClock(),
};

export default resources;
export {isRTL, localeOptions, i18n};
