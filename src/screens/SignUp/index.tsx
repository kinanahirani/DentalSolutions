import React, {useContext, useLayoutEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import Button from '../../UI/Button';
import {useTranslation} from 'react-i18next';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import {theme} from '../../UI/theme';
import Checkbox from '../../UI/Checkbox';
import {StackActions, useNavigation} from '@react-navigation/native';
import SocAuth from '../../UI/SocAuth';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

//
const w = Dimensions.get('screen').width;

const SignUp = () => {
  //
  const storeUser = useContext(UserStore);
  const {setLoading} = useContext(CommonStore);

  //
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //
  const [check, setCheck] = useState(true);

  const navigation = useNavigation();

  //
  const signupAction = async () => {
    setLoading(true);
    const resp = await api('api/sign-up', 'POST', {
      email,
      password,
    });
    analytics().logEvent('FIB_Start_Sign_up', {});
    AppEventsLogger.logEvent('fb_Start_Sign_up');
    appsFlyer.logEvent('af_Start_Sign_up', {});
    setLoading(false);
    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    console.log('CODE ==>>', resp);

    navigation.navigate('ValidateCode', {
      email,
      valid_code: resp.code,
      callback: (resp2: any) => {
        storeUser.setUser(resp2.user);
        storeUser.setToken(resp2.token);
        // login(resp.token);
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        });
      },
    });
  };

  //
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate('Welcome')
            }
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
    <ScrollView>
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
            style={{marginBottom: (15 / 360) * w}}
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
              'Consectetur adipiscing elit. Ultricies  nisl mattis non mauris ullamcorper.',
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
              {t('or sign up with')}
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
          <View
            style={{
              flexDirection: 'row',
              marginBottom: (20 / 360) * w,
            }}>
            <Checkbox checked={check} setChecked={setCheck} />
            <Text
              style={{
                fontSize: (12 / 360) * w,
                lineHeight: (16 / 360) * w,
                color: '#969696',
              }}>
              {t('By Signing up, you agree to the ')}
              <Text
                onPress={() => navigation.navigate('TermsOfService')}
                style={{
                  fontSize: (12 / 360) * w,
                  fontFamily: theme.fontFamily.regular,
                  textAlign: 'left',
                  color: theme.primary,
                }}>
                {t('Terms of Service')}
              </Text>
              {'\n'}
              {t('and ')}
              <Text
                onPress={() => navigation.navigate('Privacy')}
                style={{
                  fontSize: (12 / 360) * w,
                  fontFamily: theme.fontFamily.regular,
                  textAlign: 'left',
                  color: theme.primary,
                  // borderColor: 'red',
                  // borderWidth: 1,
                }}>
                {t('Privacy Policy')}
              </Text>
            </Text>
          </View>
          <Button
            label="Get Started"
            color="primary"
            type="circle"
            style={{marginBottom: (25 / 360) * w}}
            onPress={signupAction}
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
              {t('Alreay have an account?')}{' '}
            </Text>
            <Button
              type="text"
              color="white"
              label={t('Log In')}
              onPress={() =>
                navigation.dispatch(StackActions.replace('SignIn'))
              }
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  titleBlock: {
    paddingTop: (12 / 375) * w,
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
    marginBottom: (30 / 360) * w,
  },
  decorLine: {
    flex: 1,
    height: (1 / 360) * w,
    backgroundColor: '#D5DDE0',
  },
});
