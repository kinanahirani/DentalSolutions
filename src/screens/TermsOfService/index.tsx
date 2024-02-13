import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import CommonStore from '../../store/CommonStore';
import {Term} from '../../types';
import api from '../../helpers/api';
import WebView from 'react-native-webview';
import {useHeaderHeight} from '@react-navigation/elements';

const w = Dimensions.get('screen').width;

const TermsOfService = () => {
  //
  const navigation = useNavigation();

  //
  const storeCommon = useContext(CommonStore);

  //
  const headerHeight = useHeaderHeight();

  //
  const [privacy, setPrivacy] = useState<Term | undefined>();

  //
  useEffect(() => {
    storeCommon.setLoading(true);
    (async () => {
      const response: Term = await api('api/terms');
      storeCommon.setLoading(false);
      setPrivacy(response);
      // navigation.setOptions({
      //   title: response.title,
      // });
    })();
  }, []);

  const scalesPageToFit = Platform.OS === 'android';

  return (
    <>
      <View
        style={{
          height: headerHeight,
        }}
      />
      <View style={{height: (12 / 360) * w}} />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          top: '50%',
          backgroundColor: 'white',
          width: '100%',
        }}
      />

      <View
        style={{
          backgroundColor: theme.white,
          borderTopStartRadius: (24 / 360) * w,
          borderTopEndRadius: (24 / 360) * w,
          paddingVertical: (24 / 360) * w,
          flex: 1,
        }}>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            top: '50%',
            backgroundColor: 'white',
            width: '100%',
          }}
        />
        {!!privacy && (
          <>
            <Title
              label={privacy.title}
              size="large"
              style={{
                marginBottom: (20 / 360) * w,
                paddingHorizontal: (24 / 360) * w,
              }}
            />
            <WebView
              scalesPageToFit={scalesPageToFit}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                width: Dimensions.get('window').width,
                // borderWidth: 1,
                // borderColor: 'red',
              }}
              source={{
                html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 15px 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Lato', sans-serif!important;}h1{text-align:center;}</style></head><body><!--<h1><h1>${privacy.title}--></h1>${privacy.content}</body></html>`,
              }}
            />
          </>
        )}
      </View>
    </>
  );
};

export default TermsOfService;
