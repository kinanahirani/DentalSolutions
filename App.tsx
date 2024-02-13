/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  StatusBar,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  I18nManager,
  Dimensions,
  Platform,
} from 'react-native';
import AppNavigation from './src/router';

import CartBubble from './src/UI/CartBubble';
import Loader from './src/UI/Loader';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {theme} from './src/UI/theme';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger, Settings} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import CheckUpdate from './src/UI/CheckUpdate';
import FastImage from 'react-native-fast-image';

const App = () => {
  const keyboardAvoidingViewProps: KeyboardAvoidingViewProps = {
    style: {flex: 1},
    enabled: true,
  };
  // ОБЁРТКА ДЛЯ БОЛЕЕ УДОБНОГО ЮЗАБИЛИТИ КЛАВИАТУРЫ НА iPhone
  if (Platform.OS === 'ios') {
    keyboardAvoidingViewProps.behavior = 'padding';
  }

  // console.log('lang', i18n.language);

  I18nManager.forceRTL(false);
  I18nManager.allowRTL(false);

  useEffect(() => {
    (async () => {
      const trackingStatus = await requestTrackingPermission();
      if (trackingStatus === 'authorized') {
        Settings.setAdvertiserTrackingEnabled(true);
      }
    })();

    analytics().logEvent('FIB_first_open', {});
    AppEventsLogger.logEvent('fb_first_open');
    appsFlyer.initSdk(
      {
        devKey: '26QyMhXis34sWSJYidQ4xe',
        isDebug: true, // set to true if you want to see data in the logs
        appId: '1632815869', // iOS app id
      },
      result => {
        console.log(result);
      },
      error => {
        console.error(error);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BottomSheetModalProvider>
        <FastImage
          source={require('./src/UI/images/bgWelcome.png')}
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: theme.white,
            ...Dimensions.get('screen'),
          }}
        />
        <NavigationContainer>
          <KeyboardAvoidingView {...keyboardAvoidingViewProps}>
            <AppNavigation />

            <StatusBar
              translucent={true}
              backgroundColor="transparent"
              barStyle="dark-content"
            />

            <CartBubble />

            <Loader />
          </KeyboardAvoidingView>
        </NavigationContainer>
      </BottomSheetModalProvider>
      <CheckUpdate />
    </>
  );
};

export default App;
