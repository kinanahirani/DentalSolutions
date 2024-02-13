import {useNavigation, useRoute} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import InputSearch from '../../UI/InputSearch';
import Button from '../../UI/Button';
import {Bundle, Category, Product} from '../../types';
import api, {IMAGES_URL} from '../../helpers/api';
import {FlatList} from 'react-native-gesture-handler';
import ProductCard from '../../UI/ProductCard';
import {useHeaderHeight} from '@react-navigation/elements';
import ProductCardLine from '../../UI/ProductCardLine';
import {MultiplyBlendColor} from 'react-native-image-filter-kit';
import ContactPopover from '../../UI/ContactPopover';
import SelectPicker from '../../UI/SelectPicker';
import UserStore from '../../store/UserStore';
import {PromotionCard} from '../../UI/PromotionCard';
import FastImage from 'react-native-fast-image';
//
const w = Dimensions.get('screen').width;

const CategoryScreen = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {
    params: {category, bundles},
  } = useRoute<{
    params: {
      category: Category;
      bundles?: Bundle[];
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const {t} = useTranslation();
  const {navigate, setOptions} = useNavigation();
  //
  const headerHeight = useHeaderHeight();

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '80%'], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  //const handleSheetChanges = useCallback((index: number) => {
  //console.log('handleSheetChanges', index);
  //}, []);

  //
  const navigation = useNavigation();

  //
  const [currentTab, setCurrentTab] = useState(0);
  const [total, setTotal] = useState(category.productsCount);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [numColumns, setNumColumns] = useState(2);
  //
  const [showPopover, setShowPopover] = useState(false);

  //
  const [filters, setFilters] = useState<{
    brands: {label: string; value: number}[];
    released: string[];
    sizes: {label: string; value: number}[];
    types: {label: string; value: number}[];
  }>();
  const [choosenFilters, setChoosenFilters] = useState<{
    brand?: string;
    released?: string;
    size?: string;
    type?: string;
  }>();
  const [sortBy, setSortBy] = useState<string | undefined>('-position');

  //
  const leftAnim = useRef(new Animated.Value(0)).current;

  //
  const animate = (to: number) => {
    Animated.timing(leftAnim, {
      toValue: to,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  //
  const getProducts = async () => {
    console.log(encodeURI(search));

    const resp: {data: Product[]} = await api(
      `products?sort=${sortBy}&per-page=50&category=${category.id}${
        choosenFilters?.brand ? `&filter[brand_id]=${choosenFilters.brand}` : ''
      }${
        choosenFilters?.released
          ? `&filter[released][gte]=${
              new Date(parseInt(choosenFilters.released, 10), 0, 1).getTime() /
              1000
            }&filter[released][lte]=${
              new Date(
                parseInt(choosenFilters?.released, 10),
                11,
                31,
              ).getTime() / 1000
            }`
          : ''
      }${choosenFilters?.size ? `&option=${choosenFilters?.size}` : ''}${
        choosenFilters?.type ? `&type=${choosenFilters?.type}` : ''
      }${search ? `&filter[title][like]=${encodeURI(search)}` : ''}`,
      'GET',
      {},
      storeUser.token,
    );

    // console.log('PRODUCTS +++>>>', resp.data);

    setProducts(resp.data);
    setTotal(resp.data.length);
  };

  //
  const setFiltersValue = (field: any, value: any) => {
    setChoosenFilters({
      ...choosenFilters,
      [field]: value,
    });
  };

  //
  useEffect(() => {
    const getFilters = async () => {
      const resp: {
        brands: {id: number; title: string}[];
        released: string[];
        sizes: {id: number; title: string}[];
        types: {id: number; title: string}[];
      } = await api(`products/filters/${category.id}`, 'GET', {});

      if (resp) {
        setFilters({
          brands: resp.brands.map(brand => ({
            label: brand.title,
            value: brand.id,
          })),
          released: resp.released.reduce<string[]>((acc, release) => {
            const year = new Date(parseInt(release, 10) * 1000)
              .getFullYear()
              .toString();

            if (!acc.includes(year)) {
              acc.push(year);
            }
            return acc;
          }, []),
          sizes: resp.sizes.map(size => ({
            label: size.title,
            value: size.id,
          })),
          types: resp.types.map(type => ({
            label: type.title,
            value: type.id,
          })),
        });
      }
    };

    !storeUser.promotionMode && getFilters();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //
  useEffect(() => {
    !storeUser.promotionMode && getProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, storeUser.promotionMode]);

  useLayoutEffect(() => {
    setOptions({
      headerStyle: {
        backgroundColor: category.color,
        borderBottomWidth: 0,
        elevation: 0,
      },
      cardStyle: {
        backgroundColor: category.color,
      },
      headerBackImage: () => (
        <TouchableOpacity
          onPress={() => {
            storeUser.setDefaultBundleState();
            navigation.goBack();
          }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: (44 / 360) * w,
            width: (44 / 360) * w,
            marginStart: 13,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
          }}>
          <FastImage
            source={require('../../UI/images/arrow_back_white.png')}
            resizeMode="cover"
            style={{
              width: (24 / 360) * w,
              height: (24 / 360) * w,
              // marginHorizontal: Platform.OS === 'ios' ? 16 : 0,
              // transform: [{scaleX: isRTL ? 1 : -1}],
            }}
          />
        </TouchableOpacity>
      ),
      headerRight: () => {
        return (
          <Button
            color="halpOpaque"
            icon={require('../../UI/images/WatsUp_white.png')}
            size="medium"
            onPress={() => setShowPopover(true)}
          />
        );
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rendeListItems = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: theme.white,
          alignItems: 'center',
          flex: 0.5,
        }}>
        {currentTab === 0 ? (
          <ProductCard product={item} isBundle={storeUser.promotionMode} />
        ) : (
          <ProductCardLine product={item} isBundle={storeUser.promotionMode} />
        )}
      </View>
    );
  };

  return (
    <>
      <ContactPopover open={showPopover} close={() => setShowPopover(false)} />
      {category.parent_id === null && (
        <View
          style={{
            height: headerHeight,
            //borderWidth: 10,
            //borderColor: 'red',
          }}>
          {/* <MultiplyBlendColor
            srcColor={category?.color || 'white'}
            dstImage={
              <FastImage
                source={
                  category?.promotion_image
                    ? {
                        uri: category.promotion_image.replace(
                          'https://api.dental.local',
                          IMAGES_URL,
                        ),
                      }
                    : require('../../UI/images/categoryes/category-2.png')
                }
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: (w / 3) * 2.5,
                  opacity: 0.5,
                }}
              />
            }
          /> */}
          <FastImage
            source={
              category?.promotion_image
                ? {
                    uri: category.promotion_image.replace(
                      'https://api.dental.local',
                      IMAGES_URL,
                    ),
                  }
                : require('../../UI/images/categoryes/category-2.png')
            }
            resizeMode="contain"
            style={{
              width: '100%',
              height: (w / 3) * 2.5,
              opacity: 0.5,
            }}
          />
        </View>
      )}
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.categoryH1}>
        <Title
          label={category.title}
          size="large"
          style={{
            color: theme.white,
            fontWeight: '700',
          }}
        />
      </View>
      <FlatList
        //style={{display: 'none'}}
        ListEmptyComponent={() => (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.white,
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        key={numColumns}
        numColumns={numColumns}
        contentContainerStyle={styles.wrapper}
        data={storeUser.promotionMode ? bundles : products}
        renderItem={rendeListItems}
        ListHeaderComponent={
          <>
            <View
              style={{
                borderTopStartRadius: (24 / 360) * w,
                borderTopEndRadius: (24 / 360) * w,
                padding: (24 / 360) * w,
                backgroundColor: theme.white,
              }}>
              {category.children.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: (10 / 360) * w,
                    }}>
                    <Title label={t('Sub category')} size="medium" />
                    {/* <TouchableOpacity>
                  <Text>{t('Sea All')}</Text>
                </TouchableOpacity> */}
                  </View>
                  <ScrollView
                    horizontal={true}
                    style={{
                      flexDirection: 'row',
                      // paddingStart: (14 / 360) * w,
                      marginBottom: (40 / 360) * w,
                      marginHorizontal: -(24 / 360) * w,
                    }}
                    contentContainerStyle={{
                      paddingHorizontal: (10 / 360) * w,
                    }}
                    showsHorizontalScrollIndicator={false}>
                    {category.children.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.categoryItem}
                        onPress={() => {
                          if (item.productsCount > 0) {
                            navigate('SubCategoryScreen', {
                              category: item,
                            });
                          }
                        }}>
                        <View
                          style={[
                            styles.categoryItemImage,
                            {borderColor: category.color},
                          ]}>
                          <FastImage
                            source={
                              item.promotion_image
                                ? {
                                    uri: item.promotion_image
                                      .replace(
                                        'https://api.dental.local',
                                        IMAGES_URL,
                                      )
                                      .replace('/uploads/', '/uploads/400/'),
                                  }
                                : require('../../UI/images/categoryes/category-2.png')
                            }
                            resizeMode="contain"
                            style={{
                              width: (64 / 360) * w,
                              height: (64 / 360) * w,
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
                    ))}
                  </ScrollView>
                </>
              )}
              <View style={styles.filterBlock}>
                <Text style={styles.result}>
                  {total} {t(total === 1 ? 'Result' : 'Results')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={[styles.tabs]}>
                    {/* <Animated.View
                    style={[
                      styles.tabActive,
                      {
                        left: leftAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (w - 5 * 2) / 2],
                        }),
                      },
                    ]}
                  /> */}
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        {
                          backgroundColor:
                            currentTab === 0 ? 'white' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        setCurrentTab(0);
                        setNumColumns(2);
                        animate(+!currentTab);
                      }}>
                      <FastImage
                        source={require('../../UI/images/tile.png')}
                        resizeMode="contain"
                        style={{
                          width: (14 / 360) * w,
                          height: (14 / 360) * w,
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        {
                          backgroundColor:
                            currentTab === 1 ? 'white' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        setCurrentTab(1);
                        setNumColumns(1);
                        animate(+!currentTab);
                      }}>
                      <FastImage
                        source={require('../../UI/images/list.png')}
                        resizeMode="contain"
                        style={{
                          width: (14 / 360) * w,
                          height: (14 / 360) * w,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  {!storeUser.promotionMode && (
                    <TouchableOpacity
                      onPress={handlePresentModalPress}
                      style={styles.filter}>
                      <FastImage
                        source={require('../../UI/images/filter.png')}
                        resizeMode="contain"
                        style={{width: (24 / 360) * w, height: (24 / 360) * w}}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </>
        }
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        //onChange={handleSheetChanges}
        backdropComponent={() => (
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => bottomSheetModalRef.current?.close()}
            />
          </View>
        )}
        handleComponent={() => {
          return (
            <View style={[styles.handleComponent]}>
              <View style={styles.handleComponentInner} />
            </View>
          );
        }}>
        <View style={styles.contentContainer}>
          <Text style={styles.filterTitle}>{t('Filter')}</Text>
          <InputSearch search={search} setSearch={setSearch} />

          <SelectPicker
            title="Sort by"
            items={[
              {label: 'Default', value: '-position'},
              {label: 'Newest', value: '-id'},
              {label: 'Latest', value: 'id'},
            ]}
            value={sortBy}
            onSelect={value => {
              setSortBy(value);
            }}
          />

          {filters && filters.brands?.length >= 2 && (
            <SelectPicker
              title="Brands"
              items={filters?.brands}
              value={choosenFilters?.brand}
              onSelect={value => {
                setFiltersValue('brand', value);
              }}
            />
          )}

          {filters && filters?.types.length >= 2 && (
            <SelectPicker
              title="Size Types"
              items={filters?.types}
              value={choosenFilters?.type}
              onSelect={value => {
                setFiltersValue('type', value);
              }}
            />
          )}

          {filters && filters?.sizes.length >= 2 && (
            <SelectPicker
              title="Sizes"
              items={filters?.sizes}
              value={choosenFilters?.size}
              onSelect={value => {
                setFiltersValue('size', value);
              }}
            />
          )}

          {filters && filters?.released.length >= 2 && (
            <SelectPicker
              title="Release Years"
              items={filters?.released.map(release => ({
                label: release,
                value: release,
              }))}
              value={choosenFilters?.released}
              onSelect={value => {
                setFiltersValue('released', value);
              }}
            />
          )}

          <Button
            label="Search"
            color="white"
            type="circle"
            border
            style={{width: '100%'}}
            onPress={() => {
              getProducts();
              bottomSheetModalRef.current?.close();
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    // borderRadius: (32 / 360) * w,
    borderTopEndRadius: (32 / 360) * w,
    borderTopStartRadius: (32 / 360) * w,
    backgroundColor: theme.white,
  },
  categoryH1: {
    alignItems: 'center',
    justifyContent: 'center',
    height: (100 / 360) * w,
  },
  filterBlock: {
    backgroundColor: theme.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingBottom: (20 / 360) * w,
  },
  result: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (12 / 360) * w,
    fontWeight: '700',
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  tabs: {
    flexDirection: 'row',
    width: (52 / 360) * w,
    height: (28 / 360) * w,
    padding: (2 / 360) * w,
    borderRadius: (5 / 360) * w,
    backgroundColor: theme.primary,
  },
  tab: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (4 / 360) * w,
  },
  tabActive: {
    width: '50%',
    position: 'absolute',
    height: (24 / 360) * w,
    borderRadius: (4 / 360) * w,
    top: (2 / 360) * w,
    marginStart: (2 / 360) * w,
    backgroundColor: theme.white,
  },
  filter: {
    marginStart: (15 / 360) * w,
  },
  container: {
    flex: 1,
    padding: (24 / 360) * w,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: (24 / 360) * w,
  },
  filterTitle: {
    textAlign: 'center',
    fontFamily: theme.fontFamily.title,
    fontSize: (20 / 360) * w,
    color: theme.primary,
    marginBottom: 30,
  },

  handleComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: (10 / 360) * w,
    paddingBottom: (30 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    borderTopStartRadius: (24 / 360) * w,
  },
  handleComponentInner: {
    height: (4 / 336) * w,
    borderRadius: (2 / 360) * w,
    width: (44 / 360) * w,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(4, 20, 44, 0.1)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4, 20, 44, 0.6)',
  },
  sortItem: {
    alignSelf: 'stretch',
  },
  categoryItem: {
    alignItems: 'center',
    // width: (80 / 360) * w,
    // marginHorizontal: (10 / 360) * w,
    // borderWidth: 1,
  },
  categoryItemImage: {
    borderWidth: (1 / 360) * w,
    width: (72 / 360) * w,
    height: (72 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (72 / 360) * w,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: (11 / 360) * w,
    marginBottom: (10 / 360) * w,
    marginHorizontal: (10 / 360) * w,
    shadowColor: theme.bluedark,
    shadowOffset: {
      width: 0,
      height: (3 / 360) * w,
    },
    shadowOpacity: (0.18 / 360) * w,
    shadowRadius: (4.59 / 360) * w,
    elevation: (5 / 360) * w,
    // borderWidth: 1,
  },
  categoryTitle: {
    // fontFamily: theme.fontFamily.SFBold,
    fontWeight: '700',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    textAlign: 'center',
    color: theme.primary,
    maxWidth: (80 / 360) * w,
    paddingHorizontal: (5 / 360) * w,
    alightItems: 'center',
  },
  categoryItems: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (11 / 360) * w,
    lineHeight: (16 / 360) * w,
    textAlign: 'center',
  },
  filterItem: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (20 / 360) * w,
    color: theme.primary,
    fontWeight: '700',
    marginBottom: (25 / 360) * w,
  },
  popularContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: (15 / 360) * w,
  },
  popularView: {
    backgroundColor: theme.grey,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularText: {
    color: theme.bluedark,
    fontFamily: theme.fontFamily.SFProTextBold,
  },
});
