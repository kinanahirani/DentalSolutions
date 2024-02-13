import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Dimensions, Image, ScrollView, Text, View} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import RNSmtpMailer from 'react-native-smtp-mailer';
import CommonStore from '../../store/CommonStore';
import UserStore from '../../store/UserStore';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const ContactUs = () => {
  //
  const storeCommon = useContext(CommonStore);
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();
  const {goBack} = useNavigation();

  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState(storeUser.user?.email || '');
  const [comment, setComment] = useState('');

  //
  const sendMessage = async () => {
    storeCommon.setLoading(true);

    try {
      const resp = await RNSmtpMailer.sendMail({
        mailhost: 'smtp.gmail.com',
        port: '465',
        ssl: true,
        username: '3176639@gmail.com',
        fromName: 'Dental Solutions Contact form',
        password: 'djafbpuadxglpped',
        replyTo: email,
        // recipients: 'topans@mail.ru',
        recipients: 'D.a.implants@gmail.com',
        // bcc: ['topans@mail.ru', 'bickm@ya.ru'],
        subject: subject,
        htmlBody: `${comment}<br><br><hr><a href="mailto:${email}">${email}</a>`,
      });
      storeCommon.setLoading(false);

      console.log('respContact', resp);
    } catch (err: any) {
      storeCommon.setLoading(false);
      Alert.alert('', err.message);
      console.log('err', err);
      return;
    }

    Alert.alert('', t('Your question sent successfully'));
    goBack();
  };

  return (
    <View style={[theme.wrapper, {paddingHorizontal: 0}]}>
      <Title
        label={t('Contact us')}
        size="large"
        style={{
          marginBottom: (20 / 360) * w,
          paddingHorizontal: (24 / 360) * w,
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: (80 / 360) * w,
          paddingHorizontal: (24 / 360) * w,
        }}>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 6,
            borderColor: '#A8C3EC',
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginBottom: 20,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FastImage
              source={require('../../UI/images/tooth.png')}
              style={{width: 20, height: 20, marginEnd: 10}}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fontFamily.SFProTextBold,
                color: theme.primary,
              }}>
              Dental solutions
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.fontFamily.regular,
              color: theme.primary + 'b2',
              paddingVertical: 10,
            }}>
            +972 54 743 9889
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.fontFamily.regular,
              color: theme.primary + 'b2',
            }}>
            Ha’oreg 20 street, Netanya city, Israel
          </Text>
        </View>

        {/* <Dropbox /> */}
        <Input
          label={t('Subject*')}
          value={subject}
          onChangeText={setSubject}
        />
        <Input label={t('Email')} value={email} onChangeText={setEmail} />
        <Input
          label={t('Make comment')}
          value={comment}
          onChangeText={setComment}
          multiline
          style={{marginBottom: (77 / 360) * w, borderRadius: 6}}
        />
        <Button
          label="Send"
          size="large"
          color="primary"
          type="circle"
          onPress={sendMessage}
        />
      </ScrollView>
    </View>
  );
};

export default ContactUs;
