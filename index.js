/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (Platform.OS === 'android') {
  // only android needs polyfill
  const Intl = require('intl'); // import intl object
  require('intl/locale-data/jsonp/en');
  require('intl/locale-data/jsonp/he');
  Intl.__disableRegExpRestore();
}

AppRegistry.registerComponent(appName, () => App);
