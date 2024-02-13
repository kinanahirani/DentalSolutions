import React, {useContext, useLayoutEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import Button from '../../UI/Button';
import {useTranslation} from 'react-i18next';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import {theme} from '../../UI/theme';
import {StackActions, useNavigation} from '@react-navigation/native';
import ButtonClose from '../../UI/ButtonClose';
import ButtonLogin from '../../UI/ButtonLogin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {ErrorType, User} from '../../types';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
import api from '../../helpers/api';
import SocAuth from '../../UI/SocAuth';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

//
const w = Dimensions.get('screen').width;

const SignIn = () => {
  //
  const storeUser = useContext(UserStore);
  const {setLoading} = useContext(CommonStore);

  //
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  //
  const loginAction = async () => {
    setLoading(true);
    const resp = await api('api/login', 'POST', {
      email,
      password,
    });

    setLoading(false);
    analytics().logEvent('FIB_sign_in_complete', {});
    AppEventsLogger.logEvent('fb_sign_in_complete');
    appsFlyer.logEvent('af_sign_in_complete', {});
    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    storeUser.setUser(resp.user);
    storeUser.setToken(resp.token);
    // login(resp.token);

    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  //
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            onPress={() => navigation.goBack()}
            icon={require('../../UI/images/close.png')}
            color="grey"
            size="large"
            type="circle"
            style={{
              width: (44 / 360) * w,
              height: (44 / 360) * w,
              marginStart: (24 / 360) * w,
            }}
          />
        );
      },
    });
  }, []);

  return (
    <>
      <FastImage
        source={require('../../UI/images/bgSignIn.png')}
        resizeMode="cover"
        style={{
          backgroundColor: theme.background,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
        }}
      />
      <View style={styles.wrapper}>
        <View style={styles.titleBlock}>
          <Title
            label={t('Welcome to\nDental Solutions')}
            style={{marginBottom: (8 / 360) * w}}
          />
          <Text
            style={{
              color: theme.primary,
              fontFamily: theme.fontFamily.regular,
              opacity: 0.7,
              fontSize: (16 / 360) * w,
              lineHeight: (24 / 360) * w,
              marginBottom: (20 / 360) * w,
            }}>
            {t(
              'Orders for dental implant products can now be made by touching the screen',
            )}
          </Text>
        </View>
        <View style={styles.wrap}>
          <SocAuth />
          <View style={styles.signInWith}>
            <View style={styles.decorLine} />
            <Text
              style={{
                color: theme.primary,
                fontFamily: theme.fontFamily.bold,
                fontWeight: '700',
                fontSize: (13 / 360) * w,
                lineHeight: (20 / 360) * w,
                marginHorizontal: (20 / 360) * w,
              }}>
              {t('or sign in with')}
            </Text>
            <View style={styles.decorLine} />
          </View>
          <Input
            label={t('E-mail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            secureTextEntry={true}
            label={t('Password')}
            value={password}
            onChangeText={setPassword}
          />
          <Button
            type="text"
            label={t('Forgot your password?')}
            // onPress={() => navigation.navigate('ValidateCode')}
            onPress={() => navigation.navigate('ForgotPassword')}
            color="white"
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: (13 / 360) * w,
              lineHeight: (20 / 360) * w,
              justifyContent: 'flex-start',
              marginBottom: (20 / 360) * w,
            }}
          />
          <Button
            label="Get Started"
            color="primary"
            type="circle"
            style={{marginBottom: (20 / 360) * w}}
            onPress={loginAction}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: (14 / 360) * w,
                lineHeight: (17 / 360) * w,
                fontFamily: theme.fontFamily.regular,
                color: theme.bluedark,
              }}>
              {t('Have not an account? ')}{' '}
            </Text>
            <Button
              type="text"
              color="white"
              label={t('Sign up')}
              onPress={() =>
                navigation.dispatch(StackActions.replace('SignUp'))
              }
            />
          </View>
        </View>
      </View>
    </>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  titleBlock: {
    paddingHorizontal: (24 / 360) * w,
  },
  wrap: {
    backgroundColor: theme.white,
    padding: (24 / 360) * w,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
  },
  login: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: (25 / 360) * w,
  },
  signInWith: {
    flexDirection: 'row',
    paddingHorizontal: (12 / 360) * w,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: (24 / 360) * w,
  },
  decorLine: {
    flex: 1,
    height: (1 / 360) * w,
    backgroundColor: '#D5DDE0',
  },
});
