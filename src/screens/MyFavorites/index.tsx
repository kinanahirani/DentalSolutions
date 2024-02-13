import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Product} from '../../types';
import ProductCard from '../../UI/ProductCard';

const w = Dimensions.get('screen').width;

const MyFavorites = () => {
  const storeUser = useContext(UserStore);

  const [products, setProducts] = useState<Product[]>([]);

  //
  const navigation = useNavigation();
  //
  const {t, i18n} = useTranslation();

  const getProducts = async () => {
    const resp: {data: Product[]} = await api(
      `products?per-page=50&${storeUser.favorites
        .map(f => `filter[id][in][]=${f}`)
        .join('&')}`,
      'GET',
      {},
      storeUser.token,
    );
    setProducts(resp.data);
  };

  //
  useEffect(() => {
    if (storeUser.favorites.length > 0) {
      getProducts();
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
  }, []);

  return (
    <View style={[theme.wrapper, {paddingHorizontal: 0}]}>
      <Title
        label={t('My favorites')}
        size="large"
        style={{
          marginBottom: (20 / 360) * w,
          paddingHorizontal: (24 / 360) * w,
        }}
      />
      <FlatList
        numColumns={2}
        contentContainerStyle={styles.wrapper}
        data={products}
        renderItem={({item, index}) => (
          <View
            style={{
              marginEnd: index % 2 === 0 ? (14 / 360) * w : 0,
              marginStart: index % 2 === 1 ? (14 / 360) * w : 0,
              flex: 1,
            }}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                color: theme.primary,
                fontSize: 36,
              }}>
              The List is empty
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default MyFavorites;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    padding: (24 / 360) * w,
    flexGrow: 1,
  },
});
