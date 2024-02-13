import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import {theme} from '../UI/theme';
import {Dimensions, Image, Platform} from 'react-native';
import FastImage from 'react-native-fast-image';
import Welcome from '../screens/Welcome';

import {isRTL} from '../locales';

const Stack = createStackNavigator();

const {w, width, height} = Dimensions.get('screen');

const GuestStack = () => {
  //
  const {t} = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.primary,
        headerStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          // fontFamily: theme.fontFamily.SFBold,
          fontSize: (20 / 360) * w,
        },
        headerBackImage: () => (
          <FastImage
            source={require('../UI/images/arrow_back_black.png')}
            resizeMode="cover"
            style={{
              width: (24 / 360) * w,
              height: (24 / 360) * w,
              marginStart: 13,
              transform: [{scaleX: isRTL ? 1 : -1}],
            }}
          />
        ),
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
        // headerTransparent: Platform.OS === 'ios' ? true : false,
        cardOverlayEnabled: true,
        cardStyle: {
          backgroundColor: 'transparent',
        },
        cardOverlay: () => (
          <FastImage
            source={require('../UI/images/screen_bg.jpg')}
            resizeMode="cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width,
              height,
              transform: [{scaleX: isRTL ? -1 : 1}],
            }}
          />
        ),
      }}>
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default GuestStack;
