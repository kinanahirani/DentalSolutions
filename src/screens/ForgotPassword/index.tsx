import React, {Dispatch, SetStateAction, useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  Alert,
  KeyboardType,
} from 'react-native';
import Button from '../../UI/Button';
import {useTranslation} from 'react-i18next';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import Input from '../../UI/Input';
import RNSmtpMailer from 'react-native-smtp-mailer';
import CommonStore from '../../store/CommonStore';
import api from '../../helpers/api';
import {useNavigation} from '@react-navigation/native';
import {ErrorType} from '../../types';
import FastImage from 'react-native-fast-image';

//
const w = Dimensions.get('screen').width;

//
const isEmail = (email: string) => {
  // const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
  // return reg.test(email);

  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

//
const ForgotPassword = () => {
  //
  const storeCommon = useContext(CommonStore);

  //
  const {t} = useTranslation();

  //
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'pass'>('email');
  const [passwordResp, setPasswordResp] = useState<string>();

  //
  const {goBack} = useNavigation();

  //
  const sendMessage = async () => {
    //
    if (step === 'email') {
      if (!email) {
        Alert.alert('', t('Email is required'));
        return;
      }
      if (!isEmail(email)) {
        Alert.alert('', t('Email address invalid'));
        return;
      }
      storeCommon.setLoading(true);
      const resp: null | string = await api('api/reset-password', 'POST', {
        email,
      });

      if (!resp) {
        storeCommon.setLoading(false);
        Alert.alert('', t('No user found with this email'));
        return;
      }
      setPasswordResp(resp);

      try {
        await RNSmtpMailer.sendMail({
          mailhost: 'smtp.gmail.com',
          port: '465',
          ssl: true,
          username: '3176639@gmail.com',
          fromName: 'Dental Solutions',
          password: 'djafbpuadxglpped',
          recipients: email,
          subject: t('Reset password request'),
          htmlBody: t('Reset password code') + ': ' + resp,
        });

        storeCommon.setLoading(false);
      } catch (err: any) {
        storeCommon.setLoading(false);
        Alert.alert('', err.message);
        return;
      }
      setStep('code');
    }

    if (step === 'code') {
      if (code !== passwordResp) {
        Alert.alert('', t('Code mismatch'));
        return;
      }
      setStep('pass');
    }

    if (step === 'pass') {
      if (!pass) {
        Alert.alert('', t('New password is required'));
        return;
      }
      storeCommon.setLoading(true);
      const resp: {error?: ErrorType[]} = await api(
        'api/reset-password',
        'POST',
        {
          email,
          code,
          pass,
        },
      );

      storeCommon.setLoading(false);

      if (resp.error) {
        Alert.alert('', resp.error[0].message);
        return;
      }

      Alert.alert(t('Success'), t('Your new password saved successfully'));
      goBack();
    }
  };

  const steps = {
    email: {
      text: t(
        "Enter your email address and we'll send you a code to reset your password",
      ),
      label: t('Your email'),
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      button: t('Send code'),
    },
    code: {
      text: t('Enter code received from email to reset your password'),
      label: t('Your reset code'),
      value: code,
      setValue: setCode,
      keyboardType: 'number-pad',
      button: t('Check code'),
    },
    pass: {
      text: t('Enter your new password'),
      label: t('New password'),
      value: pass,
      setValue: setPass,
      keyboardType: 'default',
      button: t('Change password'),
    },
  } as {
    [key: string]: {
      text: string;
      label: string;
      value: string;
      setValue: Dispatch<SetStateAction<string>>;
      keyboardType: KeyboardType;
      button: string;
    };
  };

  return (
    <>
      <FastImage
        source={require('../../UI/images/bgForgotPassword.png')}
        resizeMode="cover"
        style={styles.bg}
      />
      <View style={styles.wrapper}>
        <View style={styles.centered}>
          <Title label={t('Forgot your password?')} style={styles.title} />
          <Text style={styles.text}>{steps[step].text}</Text>
          <Input
            label={steps[step].label}
            value={steps[step].value}
            onChangeText={steps[step].setValue}
            keyboardType={steps[step].keyboardType}
            autoFocus
            // eslint-disable-next-line react-native/no-inline-styles
            labelStyle={{backgroundColor: '#fafafa'}}
          />
        </View>
        <Button
          label={steps[step].button}
          color="white"
          type="circle"
          border
          onPress={sendMessage}
          style={{marginBottom: (30 / 360) * w}}
        />
      </View>
    </>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    padding: (30 / 360) * w,
  },
  bg: {
    backgroundColor: theme.background,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    minHeight: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: (13 / 360) * w,
  },
  text: {
    textAlign: 'center',
    fontSize: (16 / 360) * w,
    lineHeight: (24 / 360) * w,
    color: theme.primary,
    opacity: 0.7,
    marginBottom: (30 / 360) * w,
  },
});
