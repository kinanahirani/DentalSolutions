import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

import Button from '../../UI/Button';
import {theme} from '../../UI/theme';
import UserStore from '../../store/UserStore';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

//
const welcomCarousel = [
  {
    title: "It's easy to order",
    desc: 'Orders can be placed easily and quickly at any time by tapping the screen, and points can be earned for future purchases as well.',
  },
  {
    title: "Don't miss out",
    desc: 'You will receive notifications when your package has been shipped, you can track your package through the app, and you will receive updates on special discounts, promotions, and new products.',
  },
  {
    title: 'Answers to your questions',
    desc: 'The application contains answers to common questions, as well as the option to contact a live person and receive a quick response.',
  },
];

const Welcome = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const navigation = useNavigation();
  const {t} = useTranslation();

  //
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [url, setUrl] = useState<string | null>(null);

  //
  const scrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(
        contentOffsetX / (w - ((30 / 360) * w * 2) / 3),
      );

      setCurrentSlideIndex(currentIndex);
    },
    [],
  );

  return (
    <>
      <FastImage
        source={require('../../UI/images/bgWelcome.png')}
        resizeMode="cover"
        style={styles.bg}
      />
      <View style={styles.welcomeBlock}>
        <View style={{flex: 1}} />
        <FastImage
          resizeMode="contain"
          source={require('../../UI/images/logo_color.png')}
          style={{
            width: (280 / 360) * w,
            height: (86 / 360) * w,
            marginBottom: (20 / 360) * w,
          }}
        />
        <View style={{height: (200 / 360) * w}}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={scrollHandler}>
            {welcomCarousel.map(({title, desc}) => (
              <View
                style={[
                  styles.sliderItem,
                  {
                    width: w - (30 / 360) * w * 2,
                    marginHorizontal: (30 / 360) * w,
                  },
                ]}>
                <Text style={styles.carouselTitle}>{title}</Text>
                <Text style={styles.carouselDesc}>{desc}</Text>
              </View>
            ))}
          </ScrollView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {new Array(3).fill(undefined).map((_, index) => {
              return index === currentSlideIndex ? (
                <LinearGradient
                  start={{x: 0.0, y: 0.5}}
                  end={{x: 1.0, y: 0.5}}
                  colors={['#F5825C', '#FFD167']}
                  style={{
                    width: (8 / 360) * w,
                    height: (8 / 360) * w,
                    borderRadius: (24 / 360) * w,
                    marginHorizontal: (10 / 360) * w,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: (4 / 360) * w,
                    height: (4 / 360) * w,
                    borderRadius: (24 / 360) * w,
                    backgroundColor: theme.primary,
                    marginHorizontal: (10 / 360) * w,
                  }}
                  key={index}
                />
              );
            })}
          </View>
        </View>
        <View style={{flex: 1}} />
        <View style={styles.btns}>
          <Button
            label="Sign Up"
            color="primary"
            type="circle"
            style={{marginBottom: (10 / 360) * w}}
            onPress={() => navigation.navigate('SignUp')}
          />
          <Button
            label="Sign In"
            color="white"
            type="circle"
            border
            style={{
              marginBottom: (10 / 360) * w,
            }}
            onPress={() => navigation.navigate('SignIn')}
          />
          <Button
            label={t('Continue to Guest')}
            invert
            color="white"
            style={{marginBottom: (30 / 360) * w}}
            onPress={() => {
              storeUser.setCart([]);
              analytics().logEvent('FIB_Guest_sign_in', {});
              AppEventsLogger.logEvent('fb_Guest_sign_in');
              appsFlyer.logEvent('af_Guest_sign_in', {});
              navigation.navigate('MainTabs');
            }}
          />
          {/* <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Text
              style={{
                // fontFamily: theme.fontFamily.SFBold,
                fontWeight: '700',
                fontSize: 20,
                lineHeight: 28,
                color: '#FFFFFF',
                marginBottom: 56,
                textAlign: 'center',
              }}>
              {t('Continue to Guest')}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: theme.background,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  welcomeBlock: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: (180 / 360) * w,
    justifyContent: 'flex-start',
  },
  //Carousel
  sliderItem: {
    alignItems: 'center',
  },
  carouselTitle: {
    color: theme.primary,
    fontFamily: theme.fontFamily.title,
    textAlign: 'center',
    marginBottom: (10 / 360) * w,
    fontSize: (26 / 360) * w,
    lineHeight: (32 / 360) * w,
    letterSpacing: -0.3,
  },
  carouselDesc: {
    fontSize: (14 / 360) * w,
    lineHeight: (24 / 360) * w,
    letterSpacing: -0.3,
    color: theme.primary,
    textAlign: 'center',
    opacity: 0.7,
  },
  btns: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: (30 / 360) * w,
  },
});
