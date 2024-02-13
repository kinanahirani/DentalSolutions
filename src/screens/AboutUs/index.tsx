import React, {useLayoutEffect} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import Button from '../../UI/Button';
import FastImage from 'react-native-fast-image';
//
const w = Dimensions.get('screen').width;

const AboutUs = () => {
  //
  const {t, i18n} = useTranslation();
  //
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageBlock}>
        <FastImage
          source={require('../../UI/images/aboutus.png')}
          resizeMode="cover"
          style={{width: '100%', height: '110%'}}
        />
      </View>
      <View
        style={[
          theme.wrapper,
          {paddingHorizontal: 0, marginTop: (220 / 360) * w},
        ]}>
        <ScrollView style={{paddingHorizontal: (24 / 360) * w}}>
          <Title
            label={t('About us')}
            size="large"
            style={{
              fontFamily: theme.fontFamily.bold,
              marginBottom: 10,
              color: theme.primary,
            }}
          />
          <Text style={styles.articleText}>
            DENTAL SOLUTIONS LTD™️ provides dental implant products that support
            a wide variety of dental systems.
            {'\n\n'}
            We work with a dental experts all over the world.
            {'\n\n'}
            With us you can get fair prices for quality dental products.
            {'\n\n'}
            We, DENTAL SOLUTIONS LTD™️,{'\n'}
            have a large variety of dental implant products of all types and are
            compatible with most systems.{'\n'}
            Our warehouses prepare orders at lightning speed and this is how the
            products reach customers with record speed.{'\n'}
            We promise to provide customers with the best value and the best
            service and provide only the highest quality products.{'\n'}
            {'\n'}
            Our online APP was created for you.{'\n'}
            For all the dental implants that get lost in the big companies and
            fail to purchase products easily and quickly.{'\n'}
            Our vision is to provide our products and dental surgeons from all
            over the world with our products and adhere to the following
            principles: maximum quality, extremely fast delivery, personal
            treatment.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  imageBlock: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
  },
  articleInfoText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: theme.primary,
    marginEnd: 15,
  },
  likeArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: theme.primary,
    // marginEnd: 15,
  },
  articleText: {
    paddingTop: 20,
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: 14,
    lineHeight: 18,
    color: theme.primary,
  },
});
