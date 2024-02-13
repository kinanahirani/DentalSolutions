import React, {useContext, useEffect, useState} from 'react';
import {Dimensions, Platform, StyleSheet, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import WebView from 'react-native-webview';
import api from '../../helpers/api';
import CommonStore from '../../store/CommonStore';
import UserStore from '../../store/UserStore';
import {Message} from '../../types';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';

const w = Dimensions.get('screen').width;

const MessageScreen = () => {
  const {
    params: {message_id},
  } = useRoute<{
    params: {
      message_id: number;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const storeCommon = useContext(CommonStore);
  const storeUser = useContext(UserStore);

  //
  const [message, setMessage] = useState<Message | undefined>();

  //

  useEffect(() => {
    storeCommon.setLoading(true);
    (async () => {
      const response: Message = await await api(
        `messages/${message_id}`,
        'GET',
        {},
        storeUser.token,
      );
      storeCommon.setLoading(false);
      setMessage(response);
      console.log('get message by id', response);
    })();
  }, [message_id]);

  //

  const scalesPageToFit = Platform.OS === 'android';

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.container}>
        <View style={styles.wrapper} />
        {!!message && (
          <>
            <Title label={message.title} size="large" style={styles.title} />
            <WebView
              scalesPageToFit={scalesPageToFit}
              style={styles.web}
              source={{
                html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 15px 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Lato', sans-serif!important;}h1{text-align:center;}</style></head><body><!--<h1><h1>${message.title}--></h1>${message.message_text}</body></html>`,
              }}
            />
          </>
        )}
      </View>
    </>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    paddingVertical: (24 / 360) * w,
    flex: 1,
  },
  wrapper: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },
  title: {
    marginBottom: (20 / 360) * w,
    paddingHorizontal: (24 / 360) * w,
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
    width: Dimensions.get('window').width,
  },
});
