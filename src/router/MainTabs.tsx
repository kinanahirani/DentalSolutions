import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Alert, Dimensions, Image, StyleSheet, View} from 'react-native';
import {theme} from '../UI/theme';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Forum from '../screens/Forum';
import Cart from '../screens/Cart';
import User from '../screens/User';
import Button from '../UI/Button';
import UserStore from '../store/UserStore';
import ContactPopover from '../UI/ContactPopover';
import {autorun} from 'mobx';
import LinearGradient from 'react-native-linear-gradient';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import {getUniqueId} from 'react-native-device-info';
import api from '../helpers/api';
import {useNavigation} from '@react-navigation/native';
import CommonStore from '../store/CommonStore';
import FastImage from 'react-native-fast-image';

//
const Tab = createBottomTabNavigator();

//
const w = Dimensions.get('screen').width;

const MainTabs = () => {
  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const navigation = useNavigation();

  //
  const {t} = useTranslation();

  //
  // const {bottom} = useSafeAreaInsets();
  //
  const [showPopover, setShowPopover] = useState(false);
  const [cartCount, setCartCount] = useState(
    storeUser.cart.length + storeUser.bundlesInCart.length === 0
      ? undefined
      : storeUser.cart.reduce((a, b) => a + b.quantity, 0) +
          storeUser.bundlesInCart.length,
  );

  //
  const pushNotificationClick = async (data: any) => {
    console.log('data', data);

    if (data.page === 'Order') {
      navigation.navigate('Order', {order_id: data.id});
      return;
    }

    if (data.page === 'Product') {
      storeCommon.setLoading(true);
      const resp = await api(`products/${data.id}`, 'GET', {}, storeUser.token);
      storeCommon.setLoading(false);
      if (resp.error) {
        Alert.alert('Error', resp.error[0].message);
        return;
      }

      navigation.navigate('ProductScreen', {product: resp});
      return;
    }

    if (data.page === 'Bundle') {
      navigation.navigate('BundleScreen', {id: data.id});
      return;
    }
    if (data.page === 'Message') {
      navigation.navigate('MessageScreen', {message_id: data.id});
    }
  };

  //
  useEffect(() => {
    autorun(() => {
      setCartCount(
        storeUser.cart.length + storeUser.bundlesInCart.length === 0
          ? undefined
          : storeUser.cart.reduce((a, b) => a + b.quantity, 0) +
              storeUser.bundlesInCart.length,
      );
    });
  }, []);

  //
  useEffect(() => {
    PushNotification.configure({
      onNotification: remoteMessage => {
        if (remoteMessage.userInteraction && remoteMessage.data) {
          pushNotificationClick(remoteMessage.data);
          // goToMessages();
        }
      },
    });

    PushNotification.createChannel(
      {
        channelId: 'fcm_fallback_notification_channel',
        channelName: 'Dental Solutions',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      created => {
        console.log(`createChannel returned '${created}'`);
      },
    );

    const unsubscribe = messaging().onMessage(async message => {
      console.log('MESSAGE ==>>', message);

      PushNotification.localNotification({
        channelId: 'fcm_fallback_notification_channel',
        title: message.notification?.title,
        message: message.notification?.body || '',
        playSound: true,
        userInfo: message.data,
        // number: message.notification?.ios?.badge || '0',
      });

      // refresh store data after any push notification message
      const resp = await api('account', 'GET', {}, storeUser.token);
      if (resp.id) {
        storeUser.setUser(resp);
      }
    });

    //
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    (async () => {
      const authorizationStatus = await messaging().requestPermission();

      if (
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        const tokenFirebase = await messaging().getToken();

        // console.log('tokenFirebase', tokenFirebase.toString());

        const hwid = await getUniqueId();

        const resp = await api(
          'account',
          'PUT',
          {
            devices: {
              [hwid]: tokenFirebase ? tokenFirebase.toString() : '',
            },
          },
          storeUser.token,
        );
        console.log('RESP  ++>>  ', resp);
      }
    })();

    return unsubscribe;
  }, []);

  //
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage.data) {
        pushNotificationClick(remoteMessage.data);
        // console.log('22222');
        // goToMessages();
      }
    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data) {
          pushNotificationClick(remoteMessage.data);
          if (remoteMessage) {
            // console.log('33333');
            // goToMessages();
          }
        }
      });
  }, []);

  //
  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: theme.background,
      }}
      screenOptions={{
        // headerLeft: false,
        headerRight: () => (
          <>
            <Button
              color="grey"
              icon={require('../UI/images/WhatsApp.png')}
              size="medium"
              onPress={() => setShowPopover(true)}
            />
            <ContactPopover
              open={showPopover}
              close={() => setShowPopover(false)}
            />
          </>
        ),
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: theme.background,
          borderBottomWidth: 0,
        },
        headerTitleContainerStyle: {
          // flex: 1,
          marginStart: (24 / 360) * w,
        },
        headerRightContainerStyle: {
          marginEnd: (24 / 360) * w,
        },
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          color: theme.primary,
          fontSize: (24 / 360) * w,
          lineHeight: (28 / 360) * w,
          fontFamily: theme.fontFamily.title,
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          // height: ((70 + bottom / 2) / 360) * w,
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1A3C68', '#12C3F4']}
            start={{x: 0.0, y: 0}}
            end={{x: 1.5, y: 0}}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          height: (45 / 360) * w,
          // paddingHorizontal: 15,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: t('Home'),
          tabBarIcon: ({focused}) => (
            <View
              style={[
                styles.containerTabIconLabel,
                {backgroundColor: focused ? theme.white : theme.trans},
              ]}>
              <FastImage
                style={styles.icon}
                resizeMode="contain"
                source={
                  focused
                    ? require('../UI/images/tabs/home_active.png')
                    : require('../UI/images/tabs/home.png')
                }
              />
            </View>
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          title: t('Search'),
          tabBarIcon: ({focused}) => (
            <View
              style={[
                styles.containerTabIconLabel,
                {backgroundColor: focused ? theme.white : theme.trans},
              ]}>
              <FastImage
                style={styles.icon}
                resizeMode="contain"
                source={
                  focused
                    ? require('../UI/images/tabs/search_active.png')
                    : require('../UI/images/tabs/search.png')
                }
              />
            </View>
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Forum"
        component={Forum}
        options={{
          title: t('Forum'),

          tabBarIcon: ({focused}) => (
            <View
              style={[
                styles.containerTabIconLabel,
                {backgroundColor: focused ? theme.white : theme.trans},
              ]}>
              <FastImage
                style={styles.icon}
                resizeMode="contain"
                source={
                  focused
                    ? require('../UI/images/tabs/forum_active.png')
                    : require('../UI/images/tabs/forum.png')
                }
              />
            </View>
          ),

          // unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          title: t('My Cart'),

          tabBarIcon: ({focused}) => (
            <View
              style={[
                styles.containerTabIconLabel,
                {backgroundColor: focused ? theme.white : theme.trans},
              ]}>
              <FastImage
                style={styles.icon}
                resizeMode="contain"
                source={
                  focused
                    ? require('../UI/images/tabs/cart_active.png')
                    : require('../UI/images/tabs/cart.png')
                }
              />
            </View>
          ),

          unmountOnBlur: true,

          tabBarBadge: cartCount,
          // tabBarBadgeStyle: {
          //   backgroundColor: '#42D70D',
          // },
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        options={{
          title: t(storeUser.user ? 'More' : 'Information'),

          tabBarIcon: ({focused}) => (
            <View
              style={[
                styles.containerTabIconLabel,
                {backgroundColor: focused ? theme.white : theme.trans},
              ]}>
              <FastImage
                style={styles.icon}
                resizeMode="contain"
                source={
                  focused
                    ? require('../UI/images/tabs/user_active.png')
                    : require('../UI/images/tabs/user.png')
                }
              />
            </View>
          ),

          unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  icon: {
    width: (22 * w) / 360,
    height: (22 * w) / 360,
    maxHeight: (22 * w) / 360,
  },
  containerTabIconLabel: {
    padding: (7 * w) / 360,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
