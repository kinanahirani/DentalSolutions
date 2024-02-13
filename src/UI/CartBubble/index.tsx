import {useNavigation} from '@react-navigation/native';
import {Observer} from 'mobx-react';
import React, {useContext} from 'react';
import {Dimensions, Image, Text, TouchableOpacity} from 'react-native';
import UserStore from '../../store/UserStore';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const CartBubble = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {navigate} = useNavigation();

  return (
    <Observer>
      {() => {
        if (storeUser.cart.length === 0 || !storeUser.showCartBubble) {
          return <></>;
        }

        const count =
          storeUser.cart.reduce((a, b) => a + b.quantity, 0) +
          storeUser.bundlesInCart.length;

        return (
          <TouchableOpacity
            onPress={() => navigate('Cart')}
            style={{
              position: 'absolute',
              top: '20%',
              right: 0,
              backgroundColor: '#42D70D',
              paddingVertical: (12 / 360) * w,
              paddingHorizontal: (8 / 360) * w,
              alignItems: 'center',
              borderTopLeftRadius: (12 / 360) * w,
              borderBottomLeftRadius: (12 / 360) * w,
            }}>
            <FastImage
              source={require('../images/cart.png')}
              style={{
                width: (20 / 360) * w,
                height: (20 / 360) * w,
                marginBottom: (5 / 360) * w,
              }}
            />
            <Text
              style={{
                fontSize: (13 / 360) * w,
                color: 'white',
              }}>
              {count} {count === 1 ? 'Item' : 'Items'}
            </Text>
          </TouchableOpacity>
        );
      }}
    </Observer>
  );
};

export default CartBubble;
