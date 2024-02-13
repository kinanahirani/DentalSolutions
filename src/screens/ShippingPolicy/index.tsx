import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';

const w = Dimensions.get('screen').width;

const ShippingPolicy = () => {
  //
  const {t, i18n} = useTranslation();

  return (
    <View style={[theme.wrapper, {paddingHorizontal: 0}]}>
      <Title
        label={t('ShippingPolicy')}
        size="large"
        style={{
          marginBottom: (20 / 360) * w,
          paddingHorizontal: (24 / 360) * w,
        }}
      />
      <Text>
        "But I must explain to you how all this mistaken idea of denouncing
        pleasure and praising pain was born and I will give you a complete
        account of the system, and expound the actual teachings of the great
        explorer of the truth, the master-builder of human happiness. No{' '}
      </Text>
    </View>
  );
};

export default ShippingPolicy;

const styles = StyleSheet.create({});
