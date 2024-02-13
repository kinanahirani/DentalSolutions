import {useRoute} from '@react-navigation/native';
import React from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import {useHeaderHeight} from '@react-navigation/elements';
import {FAQ} from '../../types';
import AutoHeightWebView from 'react-native-autoheight-webview';

const w = Dimensions.get('screen').width;

const FAQItem = () => {
  //
  const {
    params: {faq},
  } = useRoute<{
    params: {
      faq: FAQ;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const headerHeight = useHeaderHeight();

  return (
    <>
      <View
        style={{
          height: headerHeight,
        }}
      />
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.whiteBG} />
      <ScrollView contentContainerStyle={styles.wrapper}>
        <Title
          label={faq.question}
          size="large"
          style={{marginBottom: (25 / 360) * w}}
        />
        <AutoHeightWebView
          // source={{html: `${product.description}`}}
          source={{
            html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 15px 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Rubik', sans-serif!important;}h1{text-align:center;}</style></head><body>${faq.answer}</body></html>`,
          }}
          style={{
            width: Dimensions.get('window').width - 65,
            opacity: 0.99,
            minHeight: 1,
          }}
          scalesPageToFit={false}
          viewportContent={'width=device-width, user-scalable=no'}
        />
      </ScrollView>
    </>
  );
};

export default FAQItem;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    padding: (24 / 360) * w,
  },
  whiteBG: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },
});
