import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const benefitsItem = [
  {
    icon: require('../../UI/images/defense.png'),
    title: '14 day money-back guarantee',
  },
  {
    icon: require('../../UI/images/bestPrice.png'),
    title: 'Best Price Guarantee',
  },
  {
    icon: require('../../UI/images/certificate.png'),
    title: 'Certificate of Authenticity',
  },
];

const Benefits = () => {
  return (
    <View style={styles.benefitsContainer}>
      {benefitsItem.map(({icon, title}) => (
        <View style={styles.benefitItem} key={title}>
          <FastImage
            style={styles.iconBeneft}
            source={icon}
            resizeMode="contain"
          />
          <Text style={styles.titleBeneft}>{title}</Text>
        </View>
      ))}
    </View>
  );
};

export default Benefits;

const styles = StyleSheet.create({
  benefitsContainer: {
    paddingHorizontal: (30 / 360) * w,
    marginBottom: (30 / 360) * w,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: (15 / 360) * w,
    alignItems: 'center',
  },
  iconBeneft: {
    width: (20 / 360) * w,
    height: (20 / 360) * w,
    marginEnd: (10 / 360) * w,
  },
  titleBeneft: {
    fontFamily: theme.fontFamily.SFProDisplayBold,
    fontWeight: '400',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
});
