import {autorun} from 'mobx';
import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import UserStore from '../../store/UserStore';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('window').width;

interface ButtonProps {
  id: number;
  backgroundColor?: 'white' | 'transparent';
  position?: 'relative' | 'absolute';
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
  active?: boolean;
  color?: 'white' | 'gray';
}

const ButtonFavorite = ({
  id,
  backgroundColor = 'transparent',
  size = 'large',
  style = {},
  position = 'relative',
  active = true,
  color,
}: ButtonProps) => {
  //
  const storeUser = useContext(UserStore);

  //
  const [checked, setChecked] = useState(storeUser.favorites.includes(id));

  const styles = StyleSheet.create({
    wrapper: {
      width: (20 / 360) * w,
      height: (20 / 360) * w,
      position: position,
      top: position === 'absolute' ? (10 / 360) * w : 0,
      right: position === 'absolute' ? (10 / 360) * w : 0,
      alignItems: 'center',
      justifyContent: 'center',
      // borderRadius: 50,
      backgroundColor: backgroundColor,
      zIndex: 5,
    },
    icon: {
      width: ((size === 'large' ? 20 : 18) / 360) * w,
      height: ((size === 'large' ? 20 : 18) / 360) * w,
    },
  });

  //
  useEffect(() => {
    autorun(() => {
      if (storeUser.favorites) {
        setChecked(storeUser.favorites.includes(id));
      }
    });
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!checked) {
          analytics().logEvent('FIB_Add_Favorites', {});
          AppEventsLogger.logEvent('fb_Add_Favorites');
          appsFlyer.logEvent('af_Add_Favorites', {});
        }
        if (active) {
          setChecked(c => !c);
          storeUser.setFavorites(id);
        }
      }}
      style={[styles.wrapper, style]}>
      <FastImage
        source={
          checked
            ? require('../../UI/images/favorite_on.png')
            : color === 'white'
            ? require('../../UI/images/favorite_off_white.png')
            : require('../../UI/images/favorite_off.png')
        }
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default ButtonFavorite;
