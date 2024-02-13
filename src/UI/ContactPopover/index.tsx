import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Popover, {Rect} from 'react-native-popover-view';
import {theme} from '../theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';

interface Popover {
  open: boolean;
  close: () => void;
}

const ContactPopover = ({open = false, close}: Popover) => {
  //
  const w = Dimensions.get('window').width;
  //
  const {t, i18n} = useTranslation();

  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    itemContact: {
      padding: 15,
      fontFamily: theme.fontFamily.regular,
      fontSize: (14 / 360) * w,
      lineHeight: (16 / 360) * w,
      color: theme.primary,
      flexWrap: 'nowrap',
      textAlign: 'center',
    },
  });

  return (
    <>
      <Popover
        isVisible={open}
        onRequestClose={close}
        // isVisible={showPopover}
        // onRequestClose={() => setShowPopover(false)}
        backgroundStyle={{backgroundColor: 'transparent'}}
        popoverStyle={{
          shadowColor: theme.primary,
          shadowOffset: {
            width: 1,
            height: 5,
          },
          shadowOpacity: 1,
          shadowRadius: 3,
          elevation: 4,
          borderRadius: 8,
          width: (110 / 360) * w,
        }}
        // arrowStyle={{
        //   width: 32,
        //   height: 16,
        //   backgroundColor: '#fff',
        //   shadowColor: '#000',
        //   shadowOffset: {width: 0, height: 2},
        //   shadowOpacity: 0.8,
        //   shadowRadius: 2,
        //   elevation: 2,
        // }}
        from={{
          x: w - 56,
          y: (Platform.OS === 'ios' ? 50 : 30) + insets.top,
          width: 0,
          height: 0,
        }}>
        <TouchableOpacity
          onPress={() => {
            analytics().logEvent('FIB_Contact_us_sale', {});
            AppEventsLogger.logEvent('fb_Contact_us_sale');
            appsFlyer.logEvent('af_Contact_us_sale', {});
            Linking.openURL('whatsapp://send?text=hello&phone=+972547439889');
          }}>
          <Text style={[styles.itemContact, {marginBottom: 0}]}>
            {t('Sales')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            analytics().logEvent('FIB_Contact_us_support', {});
            AppEventsLogger.logEvent('fb_Contact_us_support');
            appsFlyer.logEvent('af_Contact_us_support', {});
            Linking.openURL('whatsapp://send?text=hello&phone=+14055001550');
          }}>
          <Text style={[styles.itemContact, {marginBottom: 0}]}>
            {t('Support')}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => {}}>
          <Text style={styles.itemContact}>{t('Online chat')}</Text>
        </TouchableOpacity> */}
      </Popover>
    </>
  );
};

export default ContactPopover;
