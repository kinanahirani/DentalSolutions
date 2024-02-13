import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UserStore from '../../store/UserStore';
import {theme} from '../../UI/theme';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const w = Dimensions.get('screen').width;

const User = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();
  //
  const {navigate, reset} = useNavigation();

  //
  const logoutClick = () => {
    storeUser.setToken(null);
    storeUser.setUser(null);
    storeUser.setCart([]);
    GoogleSignin.signOut();

    reset({
      index: 0,
      routes: [{name: 'Welcome'}],
    });
  };

  //
  const registerClick = () => {
    reset({
      index: 0,
      routes: [{name: 'SignUp'}],
    });
  };

  const userMenuItems = [
    {
      icon: require('../../UI/images/usermenu/user.png'),
      label: t('Profile'),
      onPress: () => {
        navigate('Profile');
      },
    },
    {
      icon: require('../../UI/images/usermenu/shipping.png'),
      label: t('Shipping details'),
      onPress: () => {
        navigate('ShippingDetails');
      },
    },
    {
      icon: require('../../UI/images/usermenu/payment.png'),
      label: t('Payment Infomation'),
      onPress: () => {
        navigate('PaymentInfomation');
      },
    },
    {
      icon: require('../../UI/images/usermenu/order.png'),
      label: t('Order history'),
      onPress: () => {
        navigate('OrderHistory');
      },
    },
    {
      icon: require('../../UI/images/usermenu/bell.png'),
      label: t('Notification'),
      onPress: () => {
        navigate('Notification');
      },
    },
    {
      icon: require('../../UI/images/usermenu/gift.png'),
      label: t('Credits'),
      onPress: () => {
        navigate('Credits');
      },
    },
    {
      icon: require('../../UI/images/usermenu/heart.png'),
      label: t('My favorites'),
      onPress: () => {
        navigate('MyFavorites');
      },
    },
  ];

  const Information = [
    {
      icon: require('../../UI/images/usermenu/about.png'),
      label: t('About us'),
      onPress: () => {
        navigate('AboutUs');
      },
    },
    {
      icon: require('../../UI/images/usermenu/faq.png'),
      label: t('FAQ'),
      onPress: () => {
        navigate('FAQ');
      },
    },
    {
      icon: require('../../UI/images/usermenu/terms.png'),
      label: t('Terms of Service'),
      onPress: () => {
        navigate('TermsOfService');
      },
    },
    {
      icon: require('../../UI/images/usermenu/privacy.png'),
      label: t('Privacy Policy'),
      onPress: () => {
        navigate('Privacy');
      },
    },
    {
      icon: require('../../UI/images/usermenu/contact.png'),
      label: t('Contact us'),
      onPress: () => {
        navigate('ContactUs');
      },
    },
  ];

  const VersionSection = {
    title: undefined,
    data: [
      {
        icon: undefined,
        label: '',
        onPress: () => {},
      },
    ],
  };

  const SignOutSection = {
    title: undefined,
    data: [
      {
        icon: undefined,
        label: t('Sign Out'),
        onPress: logoutClick,
      },
    ],
  };

  const RedisterSection = {
    title: undefined,
    data: [
      {
        icon: undefined,
        label: t('Sign In'),
        onPress: registerClick,
      },
    ],
  };

  return (
    <SectionList
      style={styles.wrapper}
      contentContainerStyle={styles.layout}
      sections={
        storeUser.user
          ? [
              {title: undefined, data: userMenuItems},
              {title: t('Information'), data: Information},
              SignOutSection,
              VersionSection,
            ]
          : [
              {
                title: undefined,
                data: Information,
              },
              RedisterSection,
              VersionSection,
            ]
      }
      renderItem={({item}) => (
        <TouchableOpacity onPress={item.onPress}>
          <View style={styles.menuItem}>
            <Text
              style={[
                styles.itemText,
                item.icon
                  ? {}
                  : {
                      color: '#FF2343',
                    },
              ]}>
              {item.label}
            </Text>
            {item.icon && (
              <FastImage style={[styles.itemIcon]} source={item.icon} />
            )}
            {!item.icon && !item.label && (
              <Text
                style={{
                  fontFamily: theme.fontFamily.regular,
                  fontSize: 12,
                  color: theme.bluedark,
                  opacity: 0.5,
                }}>
                v. {DeviceInfo.getVersion()}
                {Platform.OS === 'ios' ? `.${DeviceInfo.getBuildNumber()}` : ''}
              </Text>
            )}
            {/* {!!item.badge && (
          <View style={styles.badgeView}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )} */}
          </View>
        </TouchableOpacity>
      )}
      renderSectionHeader={({section}) =>
        section.title ? (
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: 14,
              lineHeight: 20,
              color: theme.primary,
              marginBottom: 22,
              opacity: 0.7,
            }}>
            {section.title}
          </Text>
        ) : (
          <></>
        )
      }
      renderSectionFooter={info => (
        <View style={{height: info.section.data[0].icon ? 30 : 0}} />
      )}
    />
  );
};

export default User;

const styles = StyleSheet.create({
  wrapper: {
    // padding: 30,
    // paddingBottom: 70,
    marginTop: 20,
    // flexGrow: 1,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    backgroundColor: theme.white,
  },
  layout: {
    flexGrow: 1,
    // justifyContent: 'space-between',
    // borderWidth: 1,
    // borderColor: 'red',
    // marginBottom: 26,
    padding: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
    width: '100%',
    // borderWidth: 1,
    // borderColor: '#000000',
  },
  itemIcon: {
    width: 24,
    height: 24,
  },
  itemText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    color: theme.primary,
    fontFamily: theme.fontFamily.regular,
    textAlign: 'left',
  },
  singOut: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.red,
    fontFamily: theme.fontFamily.regular,
  },
});
