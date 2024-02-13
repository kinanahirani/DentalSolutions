import {useNavigation} from '@react-navigation/native';
import React from 'react';
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
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const ProductCardLine = ({
  product,
  isBundle = false,
}: {
  product: Product | Bundle;
  isBundle?: boolean;
}) => {
  //
  const {navigate} = useNavigation();

  return (
    <View
      style={{
        position: 'relative',
        // borderWidth: 1,
        // borderColor: 'red',
        marginEnd: (24 / 360) * w,
      }}>
      <TouchableOpacity
        style={styles.saleItemsItem}
        onPress={() => {
          !isBundle
            ? navigate('ProductScreen', {
                product,
              })
            : navigate('BundleScreen', {
                id: product.id,
              });
        }}>
        <View
          style={[
            styles.saleItemsItemImage,
            {
              borderColor: !isBundle ? product.color : '#cfcfcf',
              borderWidth: 3,
            },
          ]}>
          <FastImage
            source={{
              uri: product.images[0]
                ? product.images[0]
                    .replace('https://api.dental.local', IMAGES_URL)
                    .replace('/uploads/', '/uploads/400/')
                : '',
            }}
            resizeMode="cover"
            style={{width: (70 / 360) * w, height: (70 / 360) * w}}
          />
        </View>
        <View style={styles.saleItemsItemInfo}>
          <Text
            style={styles.saleItemsItemTitle}
            ellipsizeMode="tail"
            numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.saleItemsItemCategory}>
            {!isBundle ? product.categories[0]?.title : 'Promotions'}
          </Text>
          <Text style={styles.saleItemsItemPrice}>
            {' '}
            {!isBundle ? asPrice(product) : `$${product.price}`}
          </Text>
        </View>
        {!isBundle && <ButtonFavorite id={product.id} size="small" />}
      </TouchableOpacity>
    </View>
  );
};

export default ProductCardLine;

const styles = StyleSheet.create({
  saleItemsItem: {
    flexDirection: 'row',
    width: (300 / 360) * w,
    marginBottom: (15 / 360) * w,
  },

  saleItemsItemImage: {
    position: 'relative',
    width: (88 / 360) * w,
    height: (88 / 360) * w,
    marginEnd: (15 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (12 / 360) * w,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleItemsItemInfo: {
    marginEnd: (10 / 360) * w,
    flex: 1,
    // maxWidth: (150 / 360) * w,
  },

  saleItemsItemTitle: {
    fontFamily: theme.fontFamily.regular,
    fontWeight: '500',
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (4 / 360) * w,
  },
  saleItemsItemCategory: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (11 / 360) * w,
    lineHeight: (16 / 360) * w,
    marginBottom: (5 / 360) * w,
    color: theme.primary,
    opacity: 0.5,
  },
  saleItemsItemPrice: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '700',
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
});
