import {useNavigation, useRoute} from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import ButtonFavorite from '../../UI/ButtonFavorite';
import {Pagination} from 'react-native-snap-carousel';
import Button from '../../UI/Button';
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from 'react-native-table-component';
import Benefits from '../../UI/Benefits';
import AccordionView from '../../UI/Accordion';
import {
  ErrorType,
  Option,
  OptionValue,
  OrderProduct,
  Product,
  Shipment,
} from '../../types';
import api, {IMAGES_URL} from '../../helpers/api';
import {asCurrency, asDate, asPriceCell} from '../../helpers/formatter';
import {useContext} from 'react';
import UserStore from '../../store/UserStore';
import ContactPopover from '../../UI/ContactPopover';
import ProductCard from '../../UI/ProductCard';
import AutoHeightWebView from 'react-native-autoheight-webview';
import LinearGradient from 'react-native-linear-gradient';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import Orientation from 'react-native-orientation-locker';

//
const w = Dimensions.get('screen').width;
const h = Dimensions.get('screen').height;

const ProductDescriptions = [
  {
    name: 'Ref',
    value: 'sku',
  },
  {
    name: 'Colorway',
    value: 'colorway',
  },
  {
    name: 'Application',
    value: 'application',
  },
  //{
  //  name: 'Release Date',
  //  value: 'released',
  //},
] as {name: string; value: 'sku' | 'colorway' | 'application' | 'released'}[];

const ProductScreen = ({route}) => {
  //
  const storeUser = useContext(UserStore);

  // ref
  const refMainScrollView = useRef<ScrollView>(null);
  const refModalScrollView = useRef<ScrollView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef(null);

  //
  const navigation = useNavigation();
  //
  const [product, setProduct] = useState<Product>(route.params.product);
  //
  const [showPopover, setShowPopover] = useState(false);
  //
  const leftAnim = useRef(new Animated.Value(0)).current;

  const [options, setOptions] = useState<Option[]>([]);
  const [currentType, setCurrentType] = useState(
    product.price_types[0]?.price_types || 0,
  );
  const [ordered, setOrderred] = useState<OrderProduct[]>([]);
  const [requiredQuantity, setRequiredQuantity] = useState<number | null>(null);

  //
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  //
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getShipments = async () => {
    const resp: {data: Shipment[]} = await api(
      'shipments',
      'GET',
      {},
      storeUser.token,
    );
    setShipments(resp.data);
  };

  useEffect(() => {
    if (storeUser.promotionMode) {
      setOrderred(
        storeUser.bundleProducts.filter(item => item.product_id === product.id),
      );
    }
    getShipments();
  }, []);

  //

  useEffect(() => {
    const quant: number = ordered.reduce((acc, curr) => acc + curr.quantity, 0);

    setOrderred(state =>
      state.map(orderedProduct => {
        let prices: any = [];

        if (orderedProduct) {
          const size = product.variants.find(
            v =>
              v.option_id === orderedProduct.variant[0].option_id &&
              v.value_id === orderedProduct.variant[0].value_id,
          );

          if (size) {
            if (size.variants) {
              const diam = size.variants.find(
                v =>
                  v.option_id === orderedProduct.variant[1].option_id &&
                  v.value_id === orderedProduct.variant[1].value_id,
              );

              prices = diam?.prices;
            } else {
              prices = size.prices;
            }
          }
        }

        if (prices.length === 3) {
          return {
            ...orderedProduct,
            price: quant < 10 ? prices[0] : quant < 100 ? prices[1] : prices[2],
            prices,
          };
        }

        if (prices.length === 6) {
          return {
            ...orderedProduct,
            price:
              quant < 10
                ? prices[0]
                : quant < 20
                ? prices[1]
                : quant < 30
                ? prices[2]
                : quant < 50
                ? prices[3]
                : quant < 100
                ? prices[4]
                : prices[5],
            prices,
          };
        }

        return orderedProduct;
      }),
    );
  }, [ordered.reduce((acc, curr) => acc + curr.quantity, 0)]);

  //
  const getSimilarProducts = async () => {
    if (product.similars.length === 0) {
      setSimilarProducts([]);
      return;
    }
    const resp: {data: Product[]; error?: ErrorType[]} = await api(
      `products?per-page=10000&${product.similars
        .map(id => `filter[id][in][]=${id}`)
        .join('&')}`,
      'GET',
      {},
      storeUser.token,
    );
    console.log(product, '.....product225');

    if (resp.error) {
      return;
    }

    setSimilarProducts(resp.data);
  };

  //
  useEffect(() => {
    getSimilarProducts();
  }, []);

  useEffect(() => {
    setProduct(route.params.product);
  }, [route.params.product]);

  //
  const animate = (to: number) => {
    Animated.timing(leftAnim, {
      toValue: to,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  //
  const {t} = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalImageVisible, setModalImageVisible] = useState(false);

  //
  const getOptions = async () => {
    const resp: {data: Option[]} = await api(
      `options?expand=values&sort=sort&${product.options
        .map(o => `filter[id][in][]=${o.option_id}`)
        .join('&')}`,
    );
    setOptions(resp.data);
  };

  const returnQuntity = () => {
    storeUser.currentBundle?.products.map(item => {
      if (item.product.id === product.id) {
        setRequiredQuantity(item.quantity);
      }
    });
  };
  //
  const getPriceTypes = useCallback(() => {
    if (product.price_types.length === 0) {
      return [];
    }
    const price_types: {
      [key: number]: {
        price_type: OptionValue;
        diams: OptionValue[];
      };
    } = {};

    product.price_types.forEach(pt => {
      if (!price_types[pt.price_types]) {
        price_types[pt.price_types] = {
          price_type: options
            .find(o => o.id === product.options[2]?.option_id)
            ?.values?.find(v => v.id === pt.price_types),
          diams: [],
        };
      }
      price_types[pt.price_types].diams.push(
        options
          .find(o => o.id === product.options[1]?.option_id)
          ?.values?.find(v => v.id === pt.value_id),
      );
    });
    return price_types;
  }, [options]);

  //
  const renderPriceCell = (diam: {
    option_id: number;
    value_id: number;
    prices: [number | null, number | null, number | null];
  }) => {
    return asPriceCell(diam.prices) ? (
      asPriceCell(diam.prices)
    ) : (
      <Text
        style={{
          opacity: 0.5,
          fontFamily: theme.fontFamily.regular,
          fontSize: (12 / 360) * w,
          lineHeight: (16 / 360) * w,
          color: theme.bluedark,
          textAlign: 'center',
        }}>
        {t('Not Exists')}
      </Text>
    );
  };

  //
  const renderAddToCardCell = (
    size: {
      option_id: number; // size ID
      value_id: number; // size value ID
      variants?: {
        option_id: number; // diam ID
        value_id: number; // diam value ID
        prices: [number | null, number | null, number | null];
      }[];
      prices?: [number | null, number | null, number | null];
    },
    diam?: {
      option_id: number; // diam ID
      value_id: number; // diam value ID
      prices: [number | null, number | null, number | null];
    },
  ) => {
    const variant = [
      {
        option_id: size.option_id,
        value_id: size.value_id,
      },
    ];
    if (diam) {
      variant.push({
        option_id: diam.option_id,
        value_id: diam.value_id,
      });
    }

    const orderProduct = ordered.find(
      op => JSON.stringify(op.variant) === JSON.stringify(variant),
    );

    const prices = size.prices || diam?.prices || [];
    const limit =
      requiredQuantity - ordered.reduce((a, b) => a + b.quantity, 0);

    const onChangeText = quantity => {
      let firstNum: number;
      if (quantity.length === 1) {
        firstNum = 0;
      } else if (quantity.length === 2) {
        firstNum = Number(quantity[0]);
      } else {
        firstNum = Number(quantity[0] + quantity[1]);
      }

      setOrderred(state =>
        state.map(op => {
          if (JSON.stringify(op.variant) !== JSON.stringify(variant)) {
            return op;
          } else {
            let num;
            if (Number.isNaN(parseInt(quantity, 10))) {
              num = 0;
            } else if (storeUser.promotionMode && quantity > limit + firstNum) {
              num = 0;
            } else {
              num = parseInt(quantity, 10);
            }
            return {
              ...op,
              quantity: Number.isNaN(parseInt(quantity, 10)) ? 0 : num,
              price:
                parseInt(quantity, 10) < 10
                  ? prices[0]
                  : parseInt(quantity, 10) < 100
                  ? prices[1]
                  : prices[2],
            } as OrderProduct;
          }
        }),
      );
    };

    return prices.length > 0 && asPriceCell(prices) ? (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: (62 / 360) * w,
          paddingVertical: (5 / 360) * w,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.grey + '8f',
            borderRadius: (16 / 360) * w,
            alignSelf: 'center',
          }}>
          {!!orderProduct && (
            <>
              <TouchableOpacity
                style={{
                  width: (32 / 360) * w,
                  height: (32 / 360) * w,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                disabled={
                  storeUser.promotionMode &&
                  ordered.reduce((a, b) => a + b.quantity, 0) <= 0
                }
                onPress={() => {
                  if (orderProduct.quantity === 1) {
                    setOrderred(state =>
                      state.filter(
                        op =>
                          JSON.stringify(op.variant) !==
                          JSON.stringify(variant),
                      ),
                    );
                  } else {
                    setOrderred(state =>
                      state.map(op =>
                        JSON.stringify(op.variant) !== JSON.stringify(variant)
                          ? op
                          : ({
                              ...op,
                              quantity: op.quantity - 1,
                              price:
                                op.quantity - 1 < 10
                                  ? prices[0]
                                  : op.quantity - 1 < 100
                                  ? prices[1]
                                  : prices[2],
                            } as OrderProduct),
                      ),
                    );
                  }
                }}>
                <Image
                  resizeMode="contain"
                  source={require('../../UI/images/minus.png')}
                  style={{width: (10 / 360) * w}}
                />
              </TouchableOpacity>
              <TextInput
                style={{
                  fontSize: 14,
                  lineHeight: 16,
                  fontFamily: theme.fontFamily.regular,
                  margin: 0,
                  padding: 0,
                  // borderWidth: 1,
                  height: (32 / 360) * w,
                  textAlign: 'center',
                  minWidth: 20,
                  color: theme.primary,
                  // direction: 'ltr',
                  // backgroundColor: 'red',
                }}
                keyboardType="number-pad"
                value={
                  orderProduct.quantity === 0
                    ? ''
                    : orderProduct.quantity.toString()
                }
                onChangeText={onChangeText}
                onBlur={() => {
                  setOrderred(state => state.filter(op => op.quantity > 0));
                }}
                // onFocus={() =>
                //   setSelection({
                //     start: orderProduct.quantity.toString().length,
                //     end: orderProduct.quantity.toString().length,
                //   })
                // }
                //selection={{
                //  start: orderProduct.quantity.toString().length,
                //  end: orderProduct.quantity.toString().length,
                //}}
              />
            </>
          )}
          <TouchableOpacity
            style={{
              width: orderProduct ? (32 / 360) * w : (80 / 360) * w,
              height: (32 / 360) * w,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={
              storeUser.promotionMode &&
              ordered.reduce((a, b) => a + b.quantity, 0) >= requiredQuantity
            }
            onPress={() => {
              if (orderProduct) {
                setOrderred(state =>
                  state.map(op =>
                    JSON.stringify(op.variant) !== JSON.stringify(variant)
                      ? op
                      : ({
                          ...op,
                          quantity: op.quantity + 1,
                          price:
                            op.quantity + 1 < 10
                              ? prices[0]
                              : op.quantity + 1 < 100
                              ? prices[1]
                              : prices[2],
                        } as OrderProduct),
                  ),
                );
              } else {
                const newOP: OrderProduct = {
                  product_id: product.id,
                  variant,
                  quantity: 1,
                  price: prices[0],
                };
                setOrderred(state => [...state, newOP]);
              }
            }}>
            <Image
              resizeMode="contain"
              source={require('../../UI/images/plus_blue.png')}
              style={{width: (10 / 360) * w}}
            />
          </TouchableOpacity>
        </View>
        {!!orderProduct && !storeUser.promotionMode && (
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              color: theme.primary,
              marginTop: 5,
            }}>
            {asCurrency(orderProduct.quantity * orderProduct.price)}
          </Text>
        )}
      </View>
    ) : (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: (62 / 360) * w,
          paddingVertical: (5 / 360) * w,
        }}>
        <Text
          style={{
            opacity: 0.5,
            fontFamily: theme.fontFamily.regular,
            fontSize: (12 / 360) * w,
            lineHeight: (16 / 360) * w,
            color: theme.bluedark,
            textAlign: 'center',
          }}>
          {t('Not Exists')}
        </Text>
      </View>
    );
  };

  //
  const addToCart = () => {
    const cart: OrderProduct[] = JSON.parse(
      JSON.stringify(storeUser.cart.filter(pr => pr.product_id !== product.id)),
    );

    ordered.forEach(orderProduct => {
      const variant = orderProduct.variant;

      const size = product.variants.find(
        (o: any) =>
          o.option_id === variant[0].option_id &&
          o.value_id === variant[0].value_id,
      );

      const prices =
        size?.prices ||
        size?.variants?.find(
          v =>
            v.option_id === variant[1].option_id &&
            v.value_id === variant[1].value_id,
        )?.prices;

      if (!prices) {
        return;
      }

      const existing = cart.findIndex(
        c =>
          c.product_id === orderProduct.product_id &&
          JSON.stringify(c.variant) === JSON.stringify(orderProduct.variant),
      );
      if (existing >= 0) {
        cart[existing].quantity =
          cart[existing].quantity + orderProduct.quantity;
        cart[existing].price =
          cart[existing].quantity < 10
            ? (prices[0] as number)
            : cart[existing].quantity < 20
            ? (prices[1] as number)
            : cart[existing].quantity < 30
            ? (prices[2] as number)
            : cart[existing].quantity < 50
            ? (prices[3] as number)
            : cart[existing].quantity < 100
            ? (prices[4] as number)
            : (prices[5] as number);
      } else {
        analytics().logEvent('FIB_Choose_sizes', {});
        AppEventsLogger.logEvent('fb_Choose_sizes');
        appsFlyer.logEvent('af_Choose_sizes', {});
        analytics().logEvent('FIB_Add_to_cart', {});
        AppEventsLogger.logEvent('fb_Add_to_cart');
        appsFlyer.logEvent('af_Add_to_cart', {});
        cart.push(orderProduct);
      }
    });

    storeUser.setCart(cart);
    bottomSheetModalRef.current?.close();
    setOrderred([]);
  };
  //
  const addBundle = () => {
    const bundlesProducts = ordered.map(item => {
      return {
        product_id: item.product_id,
        variant: item.variant,
        quantity: item.quantity,
      };
    });
    storeUser.setBundleProducts(bundlesProducts);
    setOrderred([]);
    bottomSheetModalRef.current?.close();
    // navigation.navigate('BundleScreen', {id: storeUser.currentBundle?.id});
    navigation.goBack();
  };
  //
  useLayoutEffect(() => {
    navigation.setOptions({
      // headerBackImage: () => (
      //   <TouchableOpacity
      //     onPress={() => {
      //       // !storeUser.promotionMode
      //       //   ? navigation.goBack()
      //       //   : navigation.navigate('BundleScreen', {
      //       //       id: storeUser.currentBundle?.id,
      //       //     });
      //       navigation.goBack();
      //     }}
      //     style={{
      //       backgroundColor: 'rgba(255, 255, 255, 0.1)',
      //       height: (44 / 360) * w,
      //       width: (44 / 360) * w,
      //       marginStart: 13,
      //       alignItems: 'center',
      //       justifyContent: 'center',
      //       borderRadius: 50,
      //     }}>
      //     <FastImage
      //       source={require('../../UI/images/arrow_back_white.png')}
      //       resizeMode="cover"
      //       style={{
      //         width: (24 / 360) * w,
      //         height: (24 / 360) * w,
      //         // marginHorizontal: Platform.OS === 'ios' ? 16 : 0,
      //         // transform: [{scaleX: isRTL ? 1 : -1}],
      //       }}
      //     />
      //   </TouchableOpacity>
      // ),
      headerRight: () => {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                height: (44 / 360) * w,
                width: (44 / 360) * w,
                marginStart: (24 / 360) * w,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 50,
                marginRight: 15,
              }}>
              <ButtonFavorite id={product.id} size="large" color="white" />
            </View>

            <Button
              color="halpOpaque"
              icon={require('../../UI/images/WatsUp_white.png')}
              size="medium"
              onPress={() => setShowPopover(true)}
            />
          </View>
        );
      },
      cardOverlayEnabled: false,
      cardStyle: {
        // backgroundColor: theme.bluelight,
        backgroundColor: product.color,
      },
      headerStyle: {
        // backgroundColor: theme.bluelight,
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: product.color,
      },
    });
    // StatusBar.setBarStyle('dark-content');

    return () => {
      // StatusBar.setBarStyle('light-content');
    };
  }, []);

  //
  useEffect(() => {
    getOptions();
    storeUser.setShowCartBubble(true);
    returnQuntity();
    return () => {
      storeUser.setShowCartBubble(false);
    };
  }, [product]);

  //
  useEffect(() => {
    const offset = activeIndex * w;

    if (modalImageVisible) {
      setTimeout(() => {
        refModalScrollView?.current?.scrollTo({
          x: offset,
          y: 0,
          animated: false,
        });
      }, 10);
    }

    if (!modalImageVisible) {
      setTimeout(() => {
        refMainScrollView?.current?.scrollTo({
          x: offset,
          y: 0,
          animated: false,
        });
      }, 10);
    }
  }, [activeIndex, modalImageVisible]);

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <ContactPopover open={showPopover} close={() => setShowPopover(false)} />
      <View style={styles.wrapper}>
        <ScrollView>
          <View style={styles.carouselBlock}>
            <ScrollView
              ref={refMainScrollView}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={event => {
                setActiveIndex(
                  Math.ceil(Math.floor(event.nativeEvent.contentOffset.x) / w),
                );
              }}>
              {product.images.map(image => (
                <TouchableOpacity
                  style={[styles.productImageItem]}
                  onPress={() => {
                    setModalImageVisible(true);
                  }}>
                  <FastImage
                    source={{
                      uri: image.replace(
                        'https://api.dental.local',
                        IMAGES_URL,
                      ),
                    }}
                    style={styles.productImageItemImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Pagination
              dotsLength={product.images.length}
              activeDotIndex={activeIndex}
              containerStyle={{
                position: 'relative',
                bottom: 0,
                display: 'flex',
                justifyContent: 'flex-start',
                paddingVertical: 0,
              }}
              dotContainerStyle={{marginHorizontal: (2 / 360) * w}}
              dotStyle={{
                width: (40 / 360) * w,
                height: (2 / 360) * w,
                borderRadius: (4 / 360) * w,
                backgroundColor: theme.primary,
              }}
              inactiveDotStyle={{
                width: (6 / 360) * w,
                height: (2 / 360) * w,
                borderRadius: (4 / 360) * w,
                backgroundColor: theme.primary,
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
          </View>
          <View
            style={{
              backgroundColor: theme.white,
              borderTopStartRadius: (24 / 360) * w,
              borderTopEndRadius: (24 / 360) * w,
              // paddingHorizontal: 30,
              borderWidth: 1,
              borderColor: theme.white,
              paddingVertical: (30 / 360) * w,
            }}>
            <View>
              <Title
                label={product.title}
                size="medium"
                style={{
                  fontFamily: theme.fontFamily.title,
                  marginBottom: (15 / 360) * w,
                  paddingHorizontal: (30 / 360) * w,
                }}
              />
              {ProductDescriptions.map(item =>
                product[item.value] ? (
                  <View style={styles.descriptionsItem}>
                    <Text style={styles.descriptionsItemName}>{item.name}</Text>
                    <Text style={styles.descriptionsItemValue}>
                      {item.value === 'released'
                        ? asDate(new Date(product[item.value] * 1000))
                        : product[item.value]}
                    </Text>
                  </View>
                ) : (
                  <></>
                ),
              )}
            </View>
            {/* !!storeUser.user && */}
            {options.length > 0 && product.variants.length > 0 && (
              <Button
                label={t('Choose Sizes')}
                // color="primary"
                type="circle"
                onPress={() => {
                  setOrderred(
                    storeUser.cart.filter(pr => pr.product_id === product.id),
                  );
                  bottomSheetModalRef.current?.present();
                }}
                style={{
                  marginHorizontal: (30 / 360) * w,
                }}
              />
            )}
            {/* !!storeUser.user && */}
            {options.length > 0 && product.variants.length > 0 && (
              <>
                <View style={styles.paramsBlock}>
                  {product.price_types.length > 0 && (
                    <View style={styles.paramsTabs}>
                      {Object.values(getPriceTypes()).map(type_value => {
                        return (
                          <TouchableOpacity
                            style={styles.paramsTab}
                            onPress={() => {
                              setCurrentType(type_value.price_type.id);
                              animate(+!currentType);
                            }}>
                            {currentType === type_value.price_type?.id ? (
                              <LinearGradient
                                colors={['#F5825C', '#FFD167']}
                                start={{x: 0.0, y: 0}}
                                end={{x: 1.5, y: 0}}
                                style={[
                                  StyleSheet.absoluteFill,
                                  {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  },
                                ]}>
                                <Text style={styles.paramsTabText}>
                                  {type_value.price_type?.title}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.paramsTabText}>
                                {type_value.price_type?.title}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {/* <Divider
                    color="bluelight"
                    style={{
                      margin: 0,
                      top: (17 / 360) * w,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  /> */}

                  <Table
                    borderStyle={{
                      borderWidth: (1 / 360) * w,
                      borderColor: '#E1CFB3',
                    }}>
                    <Row
                      data={
                        options.length > 1
                          ? [
                              product.table_title
                                ? t(product.table_title)
                                : t('Diameter /\n Length'),
                              ...(getPriceTypes()[currentType]?.diams.map(v =>
                                v.title.replace(',', '.'),
                              ) || []),
                            ]
                          : options
                              .find(o => o.id === product.options[0]?.option_id)
                              ?.values?.filter(v =>
                                product.options[0].values_id.includes(v.id),
                              )
                              .map(v => v.title.replace(',', '.')) || []
                      }
                      flexArr={[
                        1,
                        ...(getPriceTypes()[currentType]?.diams.map(() => 1) ||
                          options
                            .find(o => o.id === product.options[0]?.option_id)
                            ?.values?.filter(v =>
                              product.options[0].values_id.includes(v.id),
                            )
                            .map(() => 1) ||
                          []),
                      ]}
                      style={styles.headTable}
                      textStyle={styles.textHeader}
                    />
                    <TableWrapper style={styles.wrapperTable}>
                      {options.length > 1 ? (
                        <Col
                          data={
                            options
                              .find(o => o.id === product.options[0]?.option_id)
                              ?.values?.filter(v =>
                                product.options[0].values_id.includes(v.id),
                              )
                              .map(v => v.title.replace(',', '.')) || []
                          }
                          style={styles.titleTable}
                          heightArr={[(32 / 360) * w, (32 / 360) * w]}
                          textStyle={styles.textHeader}
                        />
                      ) : (
                        <></>
                      )}
                      <Rows
                        data={
                          options.length > 1
                            ? product.variants.map(size =>
                                size.variants
                                  ?.filter(v =>
                                    getPriceTypes()
                                      [currentType]?.diams.map(d => d.id)
                                      .includes(v.value_id),
                                  )
                                  .map(diam => renderPriceCell(diam)),
                              )
                            : [
                                product.variants.map(size =>
                                  renderPriceCell(size),
                                ),
                              ]
                        }
                        flexArr={
                          getPriceTypes()[currentType]?.diams.map(() => 1) ||
                          options
                            .find(o => o.id === product.options[0]?.option_id)
                            ?.values?.filter(v =>
                              product.options[0].values_id.includes(v.id),
                            )
                            .map(() => 1) ||
                          []
                        }
                        style={styles.rowTable}
                        textStyle={[styles.textTable]}
                      />
                    </TableWrapper>
                  </Table>
                </View>
              </>
            )}
            {/* {!storeUser.user && (
              <>
                <View
                  style={{
                    backgroundColor: '#00000005',
                    borderRadius: 12,
                    padding: 10,
                    alignSelf: 'center',
                    flexDirection: 'row',
                  }}>
                  <FastImage
                    source={require('../../UI/images/alert.png')}
                    style={{
                      width: 18,
                      height: 18,
                      marginEnd: 10,
                    }}
                  />
                  <Text
                    style={{
                      color: '#EE6E70',
                      fontFamily: theme.fontFamily.regular,
                      fontSize: 13,
                    }}>
                    Login to View Price
                  </Text>
                </View>
                <Button
                  label={t('Sign in or Register to purchase')}
                  color="primary"
                  type="square"
                  onPress={() =>
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'Welcome'}],
                    })
                  }
                  style={{
                    marginTop: 20,
                    marginBottom: (30 / 360) * w,
                    marginHorizontal: (30 / 360) * w,
                    paddingHorizontal: 0,
                  }}
                />
              </>
            )} */}
            <Benefits />

            {/* Video player code */}
            {product.videos && product.videos.length > 0 && (
              <TouchableOpacity
                style={styles.videoContainer}
                // onPress={() => setModalVisible(true)}
                onPress={() =>
                  navigation.navigate('VideoPlayerScreen', {
                    // uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    uri: product.videos[0],
                  })
                }
                activeOpacity={1}>
                {isLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#0000ff"
                    style={styles.loaderStyle}
                  />
                )}
                <Video
                  source={{
                    // uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    uri: product.videos[0],
                  }}
                  ref={videoRef}
                  style={{
                    width: '90%',
                    height: 200,
                    alignSelf: 'center',
                    marginBottom: 20,
                    // borderRadius: 10,
                    overflow: 'hidden',
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  resizeMode={'cover'}
                  onLoadStart={() => setIsLoading(true)}
                  onLoad={() => {
                    setIsLoading(false);
                    videoRef.current.seek(0);
                  }}
                  paused={isPaused}
                />
                {!isLoading && (
                  <Image
                    style={styles.playIcon}
                    source={require('../../../assets/images/play.png')}
                  />
                )}
              </TouchableOpacity>
            )}

            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'red',
              }}>
              {/* <Video
                source={{
                  uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                }}
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  // position: 'absolute',
                  // top: 0,
                  // left: 0,
                  // bottom: 0,
                  // right: 0,
                }}
                onBack={() => setModalVisible(false)}
                controls={true}
                fullscreen={true}
                paused={false}
                resizeMode="contain"
              /> */}
              <VideoPlayer
                source={{
                  // uri: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
                  uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                }}
                style={{
                  flex: 1,
                }}
                onBack={() => setModalVisible(false)}
                resizeMode="contain"
                fullscreen={true}
              />
            </Modal>

            <View style={styles.productDescription}>
              <Text style={styles.productDescriptionTitle}>
                {t('Description')}
              </Text>
              <AutoHeightWebView
                // source={{html: `${product.description}`}}
                source={{
                  html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 0 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Rubik', sans-serif!important;}h1{text-align:center;}</style></head><body>${product.description}<div style="height: 15px"></div></body></html>`,
                }}
                style={{
                  width:
                    Dimensions.get('window').width - (30 / 360) * w * 2 - 2,
                  opacity: 0.99,
                  minHeight: 1,
                  // borderWidth: 1,
                }}
                scalesPageToFit={false}
                viewportContent={'width=device-width, user-scalable=no'}
                bounces={false}
                scrollEnabled={false}
              />
            </View>
            <AccordionView shipments={shipments} />

            {similarProducts.length > 0 && (
              <View
                style={{
                  marginBottom: (43 / 360) * w,
                  backgroundColor: 'white',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: (10 / 360) * w,
                    paddingHorizontal: (24 / 360) * w,
                  }}>
                  <Title
                    label={t('Similar product')}
                    size="medium"
                    style={{color: theme.bluedark}}
                  />
                  {/* <TouchableOpacity
                    onPress={() => navigation.navigate('Search')}>
                    <Text>{t('Sea All')}</Text>
                  </TouchableOpacity> */}
                </View>
                <ScrollView
                  horizontal={true}
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: (24 / 360) * w,
                  }}
                  showsHorizontalScrollIndicator={false}>
                  {similarProducts.map(item => (
                    <View
                      style={{
                        width: (150 / 360) * w,
                        marginEnd: (10 / 360) * w,
                      }}>
                      <ProductCard key={item.id} product={item} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {options.length > 0 && product.variants.length > 0 && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={2}
          $modal
          snapPoints={[500, 600, h < 760 ? '90%' : '80%']}
          // onChange={handleSheetChanges}
          // enablePanDownToClose

          backdropComponent={() => (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.overlay}
              onPress={() => bottomSheetModalRef.current?.close()}
            />
          )}
          // backgroundStyle={{backgroundColor: 'green'}}
          handleComponent={() => {
            return (
              <View style={[styles.handleComponent]}>
                <View style={styles.handleComponentInner} />
              </View>
            );
          }}>
          <BottomSheetScrollView style={{flex: 1, marginBottom: -92}}>
            <View style={styles.contentContainer}>
              <Text style={styles.modalTitle}>{t('Select Quantity')}</Text>
              {product.price_types.length > 0 && (
                <View style={styles.paramsTabs}>
                  {Object.values(getPriceTypes()).map(type_value => (
                    <TouchableOpacity
                      style={styles.paramsTab}
                      onPress={() => {
                        setCurrentType(type_value.price_type.id);
                        animate(+!currentType);
                      }}>
                      {currentType === type_value.price_type?.id ? (
                        <LinearGradient
                          colors={['#F5825C', '#FFD167']}
                          start={{x: 0.0, y: 0}}
                          end={{x: 1.5, y: 0}}
                          style={[
                            StyleSheet.absoluteFill,
                            {
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                          ]}>
                          <Text style={styles.paramsTabText}>
                            {type_value.price_type?.title}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.paramsTabText}>
                          {type_value.price_type?.title}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{width: '100%'}}>
                <Table
                  borderStyle={{
                    borderWidth: (1 / 360) * w,
                    borderColor: theme.grey,
                  }}>
                  <Row
                    data={
                      options.length > 1
                        ? [
                            product.table_title
                              ? t(product.table_title)
                              : 'Diameter /\n Length',
                            ...(getPriceTypes()[currentType]?.diams.map(v =>
                              v.title.replace(',', '.'),
                            ) || []),
                          ]
                        : options
                            .find(o => o.id === product.options[0].option_id)
                            ?.values?.filter(v =>
                              product.options[0].values_id.includes(v.id),
                            )
                            .map(v => v.title.replace(',', '.')) || []
                    }
                    flexArr={[
                      options.length > 1 ? 0.65 : 1,
                      // 1,
                      ...(getPriceTypes()[currentType]?.diams.map(() => 1) ||
                        options
                          .find(o => o.id === product.options[0]?.option_id)
                          ?.values?.filter(v =>
                            product.options[0].values_id.includes(v.id),
                          )
                          .map(() => 1) ||
                        []),
                    ]}
                    style={styles.headTable}
                    textStyle={styles.textHeader}
                  />
                  <TableWrapper style={styles.wrapperTable}>
                    {/* {options.length > 1 ? (
                        <Col
                          data={
                            options
                              .find(o => o.id === product.options[0]?.option_id)
                              ?.values?.filter(v =>
                                product.options[0].values_id.includes(v.id),
                              )
                              .map(v => v.title.replace(',', '.')) || []
                          }
                          style={styles.titleTable}
                          heightArr={[(63 / 360) * w, (63 / 360) * w]}
                          textStyle={styles.textHeader}
                        />
                      ) : (
                        <></>
                      )} */}
                    <Rows
                      data={
                        options.length > 1
                          ? product.variants.map(size => [
                              options
                                .find(
                                  o => o.id === product.options[0]?.option_id,
                                )
                                ?.values?.find(v => v.id === size.value_id)
                                ?.title.replace(',', '.') || '',
                              ...(size.variants
                                ?.filter(v =>
                                  getPriceTypes()
                                    [currentType]?.diams.map(d => d.id)
                                    .includes(v.value_id),
                                )
                                .map(diam => renderAddToCardCell(size, diam)) ||
                                []),
                            ])
                          : [
                              product.variants.map(size =>
                                renderAddToCardCell(size),
                              ),
                            ]
                      }
                      flexArr={
                        (getPriceTypes()[currentType]?.diams
                          ? [
                              options.length > 1 ? 0.65 : 1,
                              // 1,
                              ...getPriceTypes()[currentType]?.diams.map(
                                () => 1,
                              ),
                            ]
                          : undefined) ||
                        options
                          .find(o => o.id === product.options[0]?.option_id)
                          ?.values?.filter(v =>
                            product.options[0].values_id.includes(v.id),
                          )
                          .map(() => 1) ||
                        []
                      }
                      style={styles.rowTable}
                      textStyle={styles.textTable}
                    />
                  </TableWrapper>
                </Table>
              </View>
              {/* <View style={{marginTop: (0 / 360) * w, paddingBottom: 92}}>
                <Text style={styles.totals}>
                  Total ({ordered.reduce((a, b) => a + b.quantity, 0)}):
                  {'   '}
                  <Text style={{fontFamily: theme.fontFamily.title}}>
                    {asCurrency(
                      ordered.reduce((a, b) => a + b.price * b.quantity, 0),
                    )}
                  </Text>
                </Text>
              </View> */}
              <View style={{marginTop: (30 / 360) * w, paddingBottom: 92}}>
                {!storeUser.promotionMode ? (
                  <Text style={styles.totals}>
                    Total (
                    {ordered
                      .filter(or => or.product_id === product.id)
                      .reduce((a, b) => a + b.quantity, 0)}
                    ):
                    {'   '}
                    <Text style={{fontFamily: theme.fontFamily.title}}>
                      {asCurrency(
                        ordered.reduce((a, b) => a + b.price * b.quantity, 0),
                      )}
                    </Text>
                  </Text>
                ) : (
                  <View style={{paddingBottom: 10}}>
                    <Text style={styles.totals}>
                      {`You selected: ${ordered.reduce(
                        (a, b) => a + b.quantity,
                        0,
                      )}`}
                    </Text>
                    <Text style={[styles.totals, {marginTop: (-20 / 360) * w}]}>
                      {`Should be selected: ${requiredQuantity}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </BottomSheetScrollView>
          {/* <Button
            label="Add to cart"
            color="primary"
            type="circle"
            // invert
            style={{
              width: w - (20 / 360) * w,
              marginHorizontal: 10,
              marginBottom: 10,
              // position: 'absolute',
              // left: 0,
              // bottom: (30 / 360) * w,
              // zIndex: 1000,
            }}
            onPress={addToCart}
          /> */}
          {storeUser.promotionMode ? (
            <Button
              label="Add to bundle"
              color="primary"
              type="circle"
              // invert
              style={{
                width: w - (20 / 360) * w,
                marginHorizontal: 10,
                marginBottom: 30,
                // position: 'absolute',
                // left: 0,
                // bottom: (30 / 360) * w,
                // zIndex: 1000,
              }}
              onPress={addBundle}
            />
          ) : (
            <Button
              label="Add to cart"
              color="primary"
              type="circle"
              // invert
              style={{
                width: w - (20 / 360) * w,
                marginHorizontal: 10,
                marginBottom: 30,
                // position: 'absolute',
                // left: 0,
                // bottom: (30 / 360) * w,
                // zIndex: 1000,
              }}
              onPress={addToCart}
            />
          )}
        </BottomSheetModal>
      )}

      <Modal
        visible={modalImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalImageVisible(false);
        }}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
            onPress={() => {
              setModalImageVisible(false);
            }}
          />
          <View>
            <ScrollView
              ref={refModalScrollView}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={event => {
                setActiveIndex(
                  Math.ceil(Math.floor(event.nativeEvent.contentOffset.x) / w),
                );
              }}>
              {product.images.map(image => (
                <View style={[styles.productImageItem]}>
                  <FastImage
                    source={{
                      uri: image.replace(
                        'https://api.dental.local',
                        IMAGES_URL,
                      ),
                    }}
                    style={[
                      styles.productImageItemImage,
                      {backgroundColor: theme.white},
                    ]}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
            <Pagination
              dotsLength={product.images.length}
              activeDotIndex={activeIndex}
              containerStyle={{
                position: 'relative',
                bottom: 10,
                display: 'flex',
                justifyContent: 'center',
                paddingVertical: 0,
              }}
              dotContainerStyle={{marginHorizontal: (2 / 360) * w}}
              dotStyle={{
                width: (40 / 360) * w,
                height: (2 / 360) * w,
                borderRadius: (4 / 360) * w,
                backgroundColor: theme.primary,
              }}
              inactiveDotStyle={{
                width: (6 / 360) * w,
                height: (2 / 360) * w,
                borderRadius: (4 / 360) * w,
                backgroundColor: theme.primary,
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
export default ProductScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  wrapper: {
    flexGrow: 1,
  },
  carouselBlock: {
    height: (250 / 360) * w,
    alignItems: 'center',
    marginBottom: (10 / 360) * w,
  },
  productImageItem: {
    width: w,
    height: (240 / 360) * w,
    // borderWidth: 2,
  },
  productImageItemImage: {
    width: '100%',
    height: '100%',
  },
  descriptionsItem: {
    flexDirection: 'row',
    paddingHorizontal: (30 / 360) * w,
  },
  descriptionsItemName: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (18 / 360) * w,
    letterSpacing: -0.3,
    color: theme.bluedark,
    minWidth: (100 / 360) * w,
    marginBottom: (20 / 360) * w,
  },
  descriptionsItemValue: {
    flex: 1,
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (12 / 360) * w,
    lineHeight: (18 / 360) * w,
    color: theme.primary,
    minWidth: (100 / 360) * w,
  },
  paramsBlock: {
    backgroundColor: '#FFFBF5',
    borderRadius: (12 / 360) * w,
    marginHorizontal: (15 / 360) * w,
    paddingVertical: (16 / 360) * w,
    paddingHorizontal: (10 / 360) * w,
    marginBottom: (20 / 360) * w,
  },
  paramsTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    // flex: 1,
    // borderWidth: 1,
    // borderColor: 'red',
    height: (28 / 360) * w,
    borderRadius: (50 / 360) * w,
    marginBottom: (10 / 360) * w,
  },
  paramsTab: {
    width: '33.3%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (50 / 360) * w,
    overflow: 'hidden',
  },
  paramsTabText: {
    fontFamily: theme.fontFamily.SFProTextBold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: theme.primary,
  },
  paramsTabActive: {
    borderRadius: (50 / 360) * w,
    backgroundColor: theme.blue,
  },
  ///////////Table
  headTable: {
    height: (42 / 360) * w,
  },
  wrapperTable: {
    flexDirection: 'row',
  },
  titleTable: {
    flex: 1,
    // width: '100%',
    // alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  rowTable: {
    minHeight: (32 / 360) * w,
    justifyContent: 'center',
  },
  textTable: {
    fontFamily: theme.fontFamily.SFProDisplayBold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.bluedark,
    textAlign: 'center',
  },
  textHeader: {
    fontFamily: theme.fontFamily.SFProDisplayBold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.bluedark,
    opacity: 0.5,
    textAlign: 'center',
  },

  productDescription: {
    marginHorizontal: (30 / 360) * w,
    // paddingBottom: (15 / 360) * w,
  },
  productDescriptionTitle: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (15 / 360) * w,
  },
  productDescriptionText: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Modal>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  contentContainer: {
    // flex: 1,
    paddingHorizontal: (10 / 360) * w,
    // borderColor: 'red',
    // borderWidth: 1,
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: theme.fontFamily.title,
    fontSize: (24 / 360) * w,
    lineHeight: (24 / 360) * w,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: (17 / 360) * w,
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
    height: (4 / 360) * w,
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
  totals: {
    textAlign: 'center',
    color: theme.primary,
    fontSize: (24 / 360) * w,
    fontFamily: theme.fontFamily.title,
    marginTop: (30 / 360) * w,
    marginBottom: (30 / 360) * w,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  playIcon: {
    width: 50,
    height: 50,
  },
});
