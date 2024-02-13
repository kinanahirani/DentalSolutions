import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import CustomCarousel from '../../UI/Carousel';
import {Bundle, Category, Product} from '../../types';
import api, {IMAGES_URL} from '../../helpers/api';
import ProductCard from '../../UI/ProductCard';
import ProductCardLine from '../../UI/ProductCardLine';
import UserStore from '../../store/UserStore';
import {asCurrency} from '../../helpers/formatter';
import {exampleItems} from '../../UI/Dropbox';
import {Observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const Home = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();

  //
  const {navigate, setOptions} = useNavigation();

  //
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  //
  const getCategories = async () => {
    const resp: {data: Category[]} = await api(
      'categories?filter[status]=10',
      'GET',
      {},
    );

    console.log('resp >>', resp);

    setCategories(resp.data);
    setRefreshing(false);
  };

  //
  const getBundles = async () => {
    const resp: {data: Bundle[]} = await api(
      'bundles?per-page=10&page=1&sort=-id',
      'GET',
      {},
      storeUser.token,
    );
    setBundles(resp.data);
    setRefreshing(false);
  };

  //
  const getTopProducts = async () => {
    const resp: {data: Product[]} = await api(
      'products?filter[top]=1&sort=-top_position',
      'GET',
      {},
      storeUser.token,
    );

    setTopProducts(resp.data);
  };

  //
  const getSaleProducts = async () => {
    const resp: {data: Product[]} = await api(
      'products?filter[sale]=1&sort=-sale_position',
      'GET',
      {},
      storeUser.token,
    );

    setSaleProducts(resp.data);
  };

  //
  const onRefresh = () => {
    setRefreshing(true);
    getCategories();
    getTopProducts();
    getSaleProducts();
    getBundles();
  };

  //
  useEffect(() => {
    getCategories();
    getTopProducts();
    getSaleProducts();
    getBundles();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (storeUser.user) {
        setOptions({
          headerTitle: () => (
            <View style={{flexDirection: 'row', paddingTop: 8}}>
              <View>
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: (12 / 360) * w,
                    fontFamily: theme.fontFamily.regular,
                  }}>
                  {t('Your Level') + ':'}
                </Text>
                <Text
                  style={{
                    fontSize: (14 / 360) * w,
                    lineHeight: (20 / 360) * w,
                    fontFamily: theme.fontFamily.title,
                    color: theme.primary,
                  }}>
                  {
                    exampleItems.find(
                      i => i.value === storeUser.user?.type.toString(),
                    )?.label
                  }
                </Text>
              </View>
              <Text>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </Text>
              <Observer>
                {() => (
                  <View>
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: (12 / 360) * w,
                        fontFamily: theme.fontFamily.regular,
                      }}>
                      {t('Your credit') + ':'}
                    </Text>
                    <Text
                      style={{
                        fontSize: (14 / 360) * w,
                        lineHeight: (20 / 360) * w,
                        fontFamily: theme.fontFamily.title,
                        color: theme.primary,
                        textAlign: 'center',
                      }}>
                      {asCurrency(storeUser.user?.credits || 0)}
                    </Text>
                  </View>
                )}
              </Observer>
            </View>
          ),
        });
      }
      // storeUser.setShowCartBubble(true);
      storeUser.setPromotionMode(false);
    }, []),
  );

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.whiteBG} />
      <ScrollView
        contentContainerStyle={styles.wrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primarydark}
            titleColor={theme.primarydark}
          />
        }>
        <CustomCarousel />

        {/* <<<<<<<<<<<<<<<<<<<<<< CATEGORYES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
        <View style={{marginBottom: (38 / 360) * w}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: (10 / 360) * w,
              paddingHorizontal: (24 / 360) * w,
            }}>
            <Title label={t('Category')} size="medium" />
            {/* <TouchableOpacity>
                <Text>{t('Sea All')}</Text>
              </TouchableOpacity> */}
          </View>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{
              // paddingStart: (24 / 360) * w,
              paddingHorizontal: (10 / 360) * w,
            }}
            showsHorizontalScrollIndicator={false}>
            {categories.map((item, index) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.categoryItem}
                  onPress={() => {
                    if (item.productsCount > 0) {
                      navigate('CategoryScreen', {
                        category: item,
                        // bundles: bundles,
                      });
                    }
                  }}>
                  <View
                    style={[
                      styles.categoryItemImage,
                      {borderColor: item.color},
                    ]}>
                    <FastImage
                      source={
                        item.promotion_image
                          ? {
                              uri: item.promotion_image
                                .replace('https://api.dental.local', IMAGES_URL)
                                .replace('/uploads/', '/uploads/400/'),
                            }
                          : require('../../UI/images/categoryes/category-2.png')
                      }
                      resizeMode="contain"
                      style={{
                        width: (64 / 360) * w,
                        height: (64 / 360) * w,
                        overflow: 'hidden',
                        borderRadius: (32 / 360) * w,
                      }}
                    />
                  </View>

                  <Text style={styles.categoryTitle}>{item.title}</Text>
                  {item.productsCount > 0 && (
                    <Text style={styles.categoryItems}>
                      {t('All ')}
                      {item.productsCount}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* <<<<<<<<<<<<<<<<<<<< TOP ITEMS >>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
        <View style={{marginBottom: (43 / 360) * w}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: (10 / 360) * w,
              paddingHorizontal: (24 / 360) * w,
            }}>
            <Title label={t('Most popular')} size="medium" />
            <TouchableOpacity onPress={() => navigate('Search')}>
              <Text>{t('Sea All')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{
              paddingStart: (24 / 360) * w,
              paddingEnd: (10 / 360) * w,
            }}
            showsHorizontalScrollIndicator={false}>
            {topProducts.map(item => (
              <View
                style={{width: (150 / 360) * w, marginEnd: (10 / 360) * w}}
                key={item.id}>
                <ProductCard key={item.id} product={item} isBundle={false} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* <<<<<<<<<<<<<<<<<<<< SALE ITEMS >>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
        <View style={{marginBottom: (38 / 360) * w}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: (10 / 360) * w,
              paddingHorizontal: (24 / 360) * w,
            }}>
            <Title label={t('Specials')} size="medium" />
            <TouchableOpacity onPress={() => navigate('Search')}>
              <Text>{t('Sea All')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={true}
            snapToInterval={(300 / 360) * w + (24 / 360) * w}
            contentContainerStyle={{
              paddingHorizontal: (24 / 360) * w,
              // borderWidth: 1,
              // borderColor: 'red',
            }}
            showsHorizontalScrollIndicator={false}>
            {saleProducts.map(item => (
              <ProductCardLine key={item.id} product={item} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    paddingVertical: (24 / 360) * w,
  },
  whiteBG: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    // width: (80 / 360) * w,
    marginEnd: (10 / 360) * w,
  },
  categoryItemImage: {
    borderWidth: (1 / 360) * w,
    width: (72 / 360) * w,
    height: (72 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (72 / 360) * w,
    justifyContent: 'center',
    alignItems: 'center',
    // overflow: 'hidden',
    // padding: (11 / 360) * w,
    marginBottom: (10 / 360) * w,
    marginHorizontal: (10 / 360) * w,
    shadowColor: theme.bluedark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.59,
    elevation: 5,
  },
  categoryTitle: {
    fontWeight: '700',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    textAlign: 'center',
    color: theme.primary,
    maxWidth: (80 / 360) * w,
    alignItems: 'center',
  },
  categoryItems: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (11 / 360) * w,
    lineHeight: (16 / 360) * w,
    textAlign: 'center',
    color: 'black',
  },
});
