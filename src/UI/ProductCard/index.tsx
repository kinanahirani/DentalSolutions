import {StackActions, useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {IMAGES_URL} from '../../helpers/api';
import {asPrice} from '../../helpers/formatter';
import {Bundle, Product} from '../../types';
import ButtonFavorite from '../ButtonFavorite';
import {theme} from '../theme';
import {
  MultiplyBlendColor,
  ExclusionBlendColor,
} from 'react-native-image-filter-kit';
import UserStore from '../../store/UserStore';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const ProductCard = ({
  product,
  isBundle = false,
}: {
  product: Product | Bundle;
  onBundleItemPress?: () => void;
  isBundle?: boolean;
}) => {
  //
  const {dispatch, navigate, getState} = useNavigation();

  const storeUser = useContext(UserStore);

  return (
    <View
      style={{
        position: 'relative',
        // marginEnd: 15,
        maxWidth: (140 / 360) * w,
        flex: 1,
      }}>
      <TouchableOpacity
        style={styles.topItemsItem}
        onPress={() => {
          const state = getState();
          //
          if (state.index > 0 && state.type !== 'tab') {
            if (isBundle) {
              storeUser.setCurrentBundle(product as Bundle);
              navigate('BundleScreen', {
                product,
                id: product.id,
              });
            } else {
              dispatch(
                StackActions.replace('ProductScreen', {
                  product,
                }),
              );
            }
          } else {
            navigate('ProductScreen', {
              product,
            });
          }
        }}>
        <View
          style={[
            styles.topItemsItemImage,
            {
              borderColor: !isBundle ? product.color : '#cfcfcf',
              borderWidth: 5,
            },
          ]}>
          {product.images[0] && (
            // <MultiplyBlendColor
            //   // srcColor={product.color}
            //   srcColor={'white'}
            //   // srcImage={
            //   //   <FastImage
            //   //     source={require('../../UI/images/blank.png')}
            //   //     resizeMode="cover"
            //   //     style={{width: (120 / 360) * w, height: (85 / 360) * w}}
            //   //   />
            //   // }
            //   dstImage={
            //     <FastImage
            //       source={{
            //         uri: product.images[0].replace(
            //           'https://api.dental.local',
            //           IMAGES_URL,
            //         ),
            //       }}
            //       resizeMode="cover"
            //       style={{width: (120 / 360) * w, height: (85 / 360) * w}}
            //     />
            //   }
            // />
            <FastImage
              // source={require('../../UI/images/blank.png')}
              source={{
                uri: product.images[0]
                  .replace('https://api.dental.local', IMAGES_URL)
                  .replace('/uploads/', '/uploads/400/'),
              }}
              resizeMode="cover"
              style={{width: (120 / 360) * w, height: (85 / 360) * w}}
            />
          )}
        </View>
        <Text
          style={[
            styles.topItemsItemTitle,
            !isBundle && {minHeight: (52 / 360) * w},
          ]}
          ellipsizeMode="tail"
          numberOfLines={3}>
          {product.title}
        </Text>
        <Text style={styles.topItemsItemCategory}>
          {!isBundle ? product.categories[0]?.title : 'Promotions'}
        </Text>
        <Text style={styles.topItemsItemPrice}>
          {!isBundle ? asPrice(product) : `$${product.price}`}
        </Text>
      </TouchableOpacity>
      {!isBundle && (
        <ButtonFavorite id={product.id} size="small" position="absolute" />
      )}
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  topItemsItem: {
    // width: 150,
    // flex: 1,

    marginBottom: (20 / 360) * w,
  },

  topItemsItemImage: {
    position: 'relative',
    height: (150 / 360) * w,
    marginBottom: (10 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (12 / 360) * w,
    padding: (12 / 360) * w,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  topItemsItemTitle: {
    fontFamily: theme.fontFamily.regular,
    fontWeight: '500',
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (4 / 360) * w,
  },
  topItemsItemCategory: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (11 / 360) * w,
    lineHeight: (16 / 360) * w,
    marginBottom: (2 / 360) * w,
    color: theme.primary,
    opacity: 0.5,
  },
  topItemsItemPrice: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '700',
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
});
