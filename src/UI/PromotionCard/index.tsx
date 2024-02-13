import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import UserStore from '../../store/UserStore';

import {Bundle} from '../../types';
import ProductCard from '../ProductCard';
import {theme} from '../theme';
import Title from '../Title';

interface PromotionCardProps {
  bundle: Bundle;
}

const w = Dimensions.get('window').width;

export const PromotionCard = ({bundle}: PromotionCardProps) => {
  const {t} = useTranslation();

  //
  const storeUser = useContext(UserStore);

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Title label={t(`Promotion : ${bundle.title}`)} size="medium" />
        <Title
          label={t('Promotion conditions :')}
          size="medium"
          style={{marginTop: 16}}
        />
        <AutoHeightWebView
          // source={{html: `${product.description}`}}
          source={{
            html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 0 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Rubik', sans-serif!important;}h1{text-align:center;}</style></head><body>${bundle.description}</body></html>`,
          }}
          style={{
            width: w - (30 / 360) * w * 2 - 2,
            opacity: 0.99,
            minHeight: 1,
            marginTop: (16 / 360) * w,
          }}
          scalesPageToFit={false}
          viewportContent={'width=device-width, user-scalable=no'}
          bounces={false}
        />
      </View>
      <ScrollView style={styles.scrollView} horizontal>
        {bundle.products.map(({product}) => {
          return (
            <View key={product.id} style={styles.card}>
              <ProductCard
                product={product}
                onBundleItemPress={() => {
                  storeUser.setCurrentBundle(bundle);
                }}
              />
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.textField}>
        <Title label={t('Price : ')} size="medium" />
        <Text style={styles.priceText}>{bundle.price}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: (20 / 360) * w,
    flexDirection: 'column',
  },
  card: {
    marginHorizontal: (10 / 360) * w,
  },
  cardHeader: {
    marginStart: (10 / 360) * w,
  },
  priceText: {
    alignSelf: 'flex-end',
    marginEnd: (10 / 360) * w,
    fontSize: (20 / 360) * w,
  },
  scrollView: {
    marginTop: (16 / 360) * w,
  },
  textField: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});
