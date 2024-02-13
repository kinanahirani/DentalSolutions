import React, {useContext, useEffect, useState} from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import Welcome from '../screens/Welcome';
import SignUp from '../screens/SignUp';
import SignIn from '../screens/SignIn';
import CategoryScreen from '../screens/CategoryScreen';
import ValidateCode from '../screens/ValidateCode';
import MainTabs from './MainTabs';
import Privacy from '../screens/Privacy';
import Profile from '../screens/Profile';
import {Dimensions, Image, View} from 'react-native';
import {theme} from '../UI/theme';
import ProductScreen from '../screens/ProductScreen';
import {useTranslation} from 'react-i18next';
import Button from '../UI/Button';
import Article from '../screens/Article';
import AddNewArticle from '../screens/AddNewArticle';
import AddNewComment from '../screens/AddNewComment';
import Checkout from '../screens/Checkout';
import ShippingDetails from '../screens/ShippingDetails';
import AddNewAddress from '../screens/AddNewAddress';
import PaymentInfomation from '../screens/PaymentInfomation';
import AddNewCard from '../screens/AddNewCard';
import OrderHistory from '../screens/OrderHistory';
import Order from '../screens/Order';
import Notification from '../screens/Notification';
import Credits from '../screens/Credits';
import AboutUs from '../screens/AboutUs';
import FAQ from '../screens/FAQ';
import MyFavorites from '../screens/MyFavorites';
import TermsOfService from '../screens/TermsOfService';
import ContactUs from '../screens/ContactUs';
import FAQItem from '../screens/FAQ/item';
import UserStore from '../store/UserStore';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../helpers/api';
import ContactPopover from '../UI/ContactPopover';
import ForgotPassword from '../screens/ForgotPassword';
import BundleScreen from '../screens/BundleScreen';
import MessageScreen from '../screens/MessageScreen';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';
import VideoPlayerScreen from '../screens/ProductScreen/VideoPlayerScreen';

const Stack = createStackNavigator();
const {width, height} = Dimensions.get('screen');

const AppNavigation = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const [showPopover, setShowPopover] = useState(false);

  //
  // const {t, i18n} = useTranslation();

  //
  const [token, setToken] = useState<string | null>();

  //
  useEffect(() => {
    (async () => {
      appsFlyer.logEvent('af_first_open', {});
      const curTok = await AsyncStorage.getItem('@token');
      // console.log('UERS TOKEN', curTok);

      if (curTok) {
        const resp = await api('account', 'GET', {}, curTok);
        // console.log('UERS ACCOUNT', resp);
        if (resp.id) {
          storeUser.setUser(resp);
          storeUser.setToken(curTok);
          setToken(curTok);
          return;
        }

        setToken(null);
      } else {
        setToken(null);
      }
    })();
  }, []);

  return (
    <>
      {token !== undefined && (
        <Stack.Navigator
          initialRouteName={token ? 'MainTabs' : 'Welcome'}
          screenOptions={{
            headerBackTitleVisible: false,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              backgroundColor: theme.background,
              borderBottomWidth: 0,
            },
            // headerTitleContainerStyle: {
            //   flex: 1,
            // },
            headerRightContainerStyle: {
              marginEnd: 24,
            },
            headerTitleStyle: {
              color: theme.white,
              fontSize: (18 / 360) * width,
              lineHeight: (22 / 360) * width,
              fontFamily: theme.fontFamily.regular,
            },
            headerTitleAlign: 'left',
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
            headerBackImage: () => (
              <View
                style={{
                  backgroundColor: theme.grey,
                  height: (44 / 360) * width,
                  width: (44 / 360) * width,
                  marginStart: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                }}>
                <FastImage
                  source={require('../UI/images/arrow_back_black.png')}
                  resizeMode="cover"
                  style={{
                    width: (24 / 360) * width,
                    height: (24 / 360) * width,
                    // marginHorizontal: Platform.OS === 'ios' ? 16 : 0,
                    // transform: [{scaleX: isRTL ? 1 : -1}],
                  }}
                />
              </View>
            ),
            title: false,
            cardOverlayEnabled: true,
            cardStyle: {
              backgroundColor: theme.background,
            },
            // cardOverlay: () => (
            //   <Image
            //     source={require('../UI/images/bg.png')}
            //     resizeMode="cover"
            //     style={{
            //       position: 'absolute',
            //       top: 0,
            //       left: 0,
            //       width,
            //       height,
            //     }}
            //   />
            // ),
          }}>
          <Stack.Screen
            name="Welcome"
            component={Welcome}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ValidateCode"
            component={ValidateCode}
            options={{
              headerTransparent: true,
              // title: false,
              // headerShown: false,
            }}
          />
          <Stack.Screen
            name="CategoryScreen"
            component={CategoryScreen}
            options={{
              headerTransparent: true,
              // title: false,
              // headerShown: false,
            }}
          />
          <Stack.Screen name="SubCategoryScreen" component={CategoryScreen} />
          <Stack.Screen name="ProductScreen" component={ProductScreen} />
          <Stack.Screen
            options={{
              headerTransparent: true,
              // title: false,
              // headerShown: false,
            }}
            name="BundleScreen"
            component={BundleScreen}
          />
          <Stack.Screen
            name="Article"
            component={Article}
            options={{
              title: '',
              headerTransparent: true,
              // headerShown: false,
              // headerStyle: {position: 'absolute', backgroundColor: 'transparent'},
            }}
          />
          <Stack.Screen name="AddNewArticle" component={AddNewArticle} />
          <Stack.Screen name="AddNewComment" component={AddNewComment} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ShippingDetails" component={ShippingDetails} />
          <Stack.Screen
            name="AddNewAddress"
            component={AddNewAddress}
            options={{
              headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="PaymentInfomation"
            component={PaymentInfomation}
          />
          <Stack.Screen name="AddNewCard" component={AddNewCard} />
          <Stack.Screen name="OrderHistory" component={OrderHistory} />
          <Stack.Screen
            name="Order"
            component={Order}
            options={{
              headerTransparent: true,
            }}
          />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen name="Credits" component={Credits} />
          <Stack.Screen name="MyFavorites" component={MyFavorites} />
          <Stack.Screen
            name="AboutUs"
            component={AboutUs}
            options={{
              title: '',
              headerTransparent: true,
              // headerShown: false,
              // headerStyle: {position: 'absolute', backgroundColor: 'transparent'},
            }}
          />
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfService}
            options={{
              headerTransparent: true,
            }}
          />
          <Stack.Screen name="FAQ" component={FAQ} />
          <Stack.Screen
            name="FAQItem"
            component={FAQItem}
            options={{
              headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={Privacy}
            options={{
              headerTransparent: true,
            }}
          />
          <Stack.Screen name="ContactUs" component={ContactUs} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="MessageScreen" component={MessageScreen} />
          <Stack.Screen
            name="VideoPlayerScreen"
            component={VideoPlayerScreen}
            options={{
              // title: '',
              // headerTransparent: true,
              headerShown: false,
              // headerStyle: {position: 'absolute', backgroundColor: 'transparent'},
            }}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

export default AppNavigation;
