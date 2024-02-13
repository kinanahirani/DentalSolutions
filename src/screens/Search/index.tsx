import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Product} from '../../types';
import InputSearch from '../../UI/InputSearch';
import ProductCard from '../../UI/ProductCard';
import {theme} from '../../UI/theme';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';

const w = Dimensions.get('screen').width;

const Search = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();

  //
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  //
  const getProducts = async () => {
    const resp: {data: Product[]; total: number} = await api(
      `products?sort=-position&per-page=50${
        search.length > 2
          ? `&filter[or][][title][like]=${search}&filter[or][][variants_data][like]=${search}`
          : ''
      }`,
      'GET',
      {},
      storeUser.token,
    );
    analytics().logEvent('FIB_Search', {});
    AppEventsLogger.logEvent('fb_Search');
    appsFlyer.logEvent('af_Search', {});
    setTotal(resp.total);
    setProducts(resp.data);
    setRefreshing(false);
  };

  //
  const onRefresh = () => {
    setRefreshing(true);
    getProducts();
  };

  //
  useEffect(() => {
    getProducts();
  }, [search]);

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.whiteBG} />
      <FlatList
        numColumns={2}
        contentContainerStyle={styles.wrapper}
        data={products}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
        ListHeaderComponent={
          <InputSearch search={search} setSearch={setSearch} />
        }
      />
    </>
  );
};

export default Search;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    padding: (24 / 360) * w,
    flexGrow: 1,
  },
  whiteBG: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },
  block: {
    width: (150 / 360) * w,
    height: (150 / 360) * w,
    backgroundColor: 'red',
  },
});
