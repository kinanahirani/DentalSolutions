import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Text, Dimensions, Alert, Image} from 'react-native';
import Button from '../../UI/Button';
import {useTranslation} from 'react-i18next';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import {useHeaderHeight} from '@react-navigation/elements';
import api from '../../helpers/api';
import CommonStore from '../../store/CommonStore';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

//
const w = Dimensions.get('screen').width;

const ValidateCode = () => {
  //
  const {
    params: {email, valid_code, callback},
  } = useRoute<{
    params: {
      email: string;
      valid_code: string;
      callback: (resp: any) => void;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  const {setLoading} = useContext(CommonStore);

  //
  const {t, i18n} = useTranslation();
  const [code, setCode] = useState('');

  const navigation = useNavigation();

  const headerHeight = useHeaderHeight();

  //
  const verifyCode = async () => {
    setLoading(true);
    const resp = await api('api/verify', 'POST', {
      email,
      code,
    });
    setLoading(false);
    analytics().logEvent('FIB_Complete_sign_up', {});
    AppEventsLogger.logEvent('fb_Complete_sign_up');
    appsFlyer.logEvent('af_Complete_sign_up', {});
    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }
    callback(resp);
  };

  //
  useEffect(() => {
    if (code.length === 4) {
      if (code === valid_code) {
        verifyCode();
      }
    }
  }, [code]);

  return (
    <>
      <View style={{height: headerHeight}} />
      <FastImage
        source={require('../../UI/images/bgSignIn.png')}
        resizeMode="cover"
        style={{
          backgroundColor: theme.background,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <View style={styles.wrapper}>
        <Title
          label={t('Validate your email')}
          style={{
            color: theme.primary,
            marginBottom: (13 / 360) * w,
          }}
        />
        <Text
          style={{
            textAlign: 'center',
            fontSize: (16 / 360) * w,
            lineHeight: (24 / 360) * w,
            color: theme.primary,
            opacity: 0.7,
            marginBottom: (50 / 360) * w,
          }}>
          {'we send you to ' + email + ' code to verify your email.'}
        </Text>
        <View style={styles.inputContainer}>
          <SmoothPinCodeInput
            cellStyle={[
              styles.smoothCellStyle,
              {
                borderWidth: 1,
                borderColor: theme.grey,
                // backgroundColor: storeUser.borderColor() + '19',
              },
            ]}
            codeLength={4}
            value={code}
            onTextChange={setCode}
            cellSpacing={16}
            keyboardType={'numeric'}
            textStyle={[
              styles.smoothTextStyle,
              {
                // color: storeUser.color(),
              },
            ]}
            cellStyleFocused={[
              styles.smoothCellStyleFocused,
              {
                // backgroundColor: storeUser.borderColor() + '19',
              },
            ]}
            autoFocus
          />
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'flex-end',
            marginBottom: (54 / 360) * w,
          }}>
          <Button
            label="Enter"
            color="white"
            type="square"
            onPress={verifyCode}
          />
        </View>
      </View>
    </>
  );
};

export default ValidateCode;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    padding: (30 / 360) * w,
    alignItems: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: (50 / 375) * w,
  },
  smoothCellStyle: {
    width: w / 4 - 16 * 2,
    height: (66 / 375) * w,
    borderRadius: (12 / 360) * w,
    backgroundColor: theme.white,
  },
  smoothCellStyleFocused: {
    // borderColor: theme,
  },
  smoothTextStyle: {
    fontSize: (24 / 375) * w,
    fontFamily: theme.fontFamily.regular,
    textAlign: 'left',
    color: theme.primary,
  },
});
