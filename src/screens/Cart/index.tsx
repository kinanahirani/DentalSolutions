import {useIsFocused, useNavigation} from '@react-navigation/native';
import {autorun, toJS} from 'mobx';
import {Observer} from 'mobx-react';
import React, {
  ReactChild,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api, {IMAGES_URL} from '../../helpers/api';
import {asCurrency} from '../../helpers/formatter';
import UserStore from '../../store/UserStore';
import {
  Bundle,
  ErrorType,
  Option,
  OrderBundle,
  OrderProduct,
  Product,
  Shipment,
} from '../../types';
import Bonus from '../../UI/Bonus';
import Button from '../../UI/Button';
import Divider from '../../UI/Divider';
import ProductCard from '../../UI/ProductCard';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import DiscountTooltip from './DiscountTooltip';
import CommonStore from '../../store/CommonStore';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const Cart = () => {
  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const {t} = useTranslation();

  //
  const {navigate} = useNavigation();
  //
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [bonus, setBonus] = useState('0');
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [currentEdit, setCurrentEdit] = useState<{
    key: number;
    current: string;
  }>();
  //
  const freeFrom = useMemo(() => {
    let free;

    if (!!shipments && shipments.length > 0) {
      const filtArr = shipments
        .map(item => Number(item.free_from))
        .filter(item => item > 0);
      console.log(filtArr);
      if (filtArr.length > 0) {
        free = Math.min(...filtArr);
      }
    }

    return free;
  }, [shipments]);
  //
  const getOptions = async () => {
    const resp: {data: Option[]} = await api(
      'options?per-page=50&expand=values',
      'GET',
      {},
    );
    setOptions(resp.data);
  };
  //
  const getShipments = async () => {
    const resp: {data: Shipment[]} = await api(
      'shipments',
      'GET',
      {},
      storeUser.token,
    );
    setShipments(resp.data);
  };
  //
  // const getProducts = async () => {
  //   storeCommon.setLoading(true);
  //   setIsProductsLoaded(false);
  //   const resp: {data: Product[]} = await api(
  //     `products?per-page=50&${storeUser.cart
  //       .map(c => `filter[id][in][]=${c.product_id}`)
  //       .join('&')}`,
  //     'GET',
  //     {},
  //     storeUser.token,
  //   );
  //   storeCommon.setLoading(false);
  //   console.log('getProducts', JSON.stringify(resp));

  //   setProducts(resp.data);
  //   setIsProductsLoaded(true);
  // };

  // const getBundles = async () => {
  //   setIsProductsLoaded(false);
  //   const resp: {data: Bundle[]} = await api(
  //     `bundles?per-page=50&${storeUser.cart
  //       .map(c => `filter[id][in][]=${c.product_id}`)
  //       .join('&')}`,
  //     'GET',
  //     {},
  //     storeUser.token,
  //   );
  //   console.log('getBundles', JSON.stringify(resp));
  //   setBundles(resp.data);
  //   setIsProductsLoaded(true);
  // };

  const getProducts = async () => {
    storeCommon.setLoading(true);
    setIsProductsLoaded(false);
    try {
      const resp = await api(
        `products?per-page=50&${storeUser.cart
          .map(c => `filter[id][in][]=${c.product_id}`)
          .join('&')}`,
        'GET',
        {},
        storeUser.token,
      );
      if (resp.data) {
        // Logic to remove products from the cart that are no longer in the database
        const validProductIds = new Set(resp.data.map(product => product.id));
        const updatedCart = storeUser.cart.filter(item =>
          validProductIds.has(item.product_id),
        );
        if (JSON.stringify(updatedCart) !== JSON.stringify(storeUser.cart)) {
          storeUser.setCart(updatedCart);
        }
        // storeUser.setCart(updatedCart);

        setProducts(resp.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      storeCommon.setLoading(false);
      setIsProductsLoaded(true);
    }
  };

  const getBundles = async () => {
    setIsProductsLoaded(false);
    try {
      const resp = await api(
        `bundles?per-page=50&${storeUser.cart
          .map(c => `filter[id][in][]=${c.product_id}`)
          .join('&')}`,
        'GET',
        {},
        storeUser.token,
      );

      if (resp.data) {
        setBundles(resp.data);
        storeUser.updateBundlesInCart(resp.data);
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setIsProductsLoaded(true);
    }
  };
  //
  const getSimilarProducts = async () => {
    if (products.map(p => p.similars).flat().length === 0) {
      setSimilarProducts([]);
      return;
    }
    const resp: {data: Product[]; error?: ErrorType[]} = await api(
      `products?per-page=10000&${[
        ...new Set(products.map(p => p.similars).flat()),
      ]
        .map(id => `filter[id][in][]=${id}`)
        .join('&')}`,
      'GET',
      {},
      storeUser.token,
    );

    if (resp.error) {
      return;
    }
    setSimilarProducts(resp.data);
  };
  //
  const changeQty = useCallback(
    (
      orderProduct: OrderProduct,
      cart: OrderProduct[],
      current: number,
      prices: number[],
      totalQuantity: number,
      quantity: number,
    ) => {
      if (quantity === -1) {
        if (orderProduct.quantity === 1) {
          storeUser.setCart(
            recalculateCart(storeUser.cart.filter((c, i) => i !== current)),
          );
          return;
        }
      }
      cart[current].quantity += quantity;
      cart[current].price =
        prices.length === 3
          ? totalQuantity + quantity < 10 // subtract 1 from total quant
            ? prices[0]
            : totalQuantity + quantity < 100 // subtract 1 from total quant
            ? prices[1]
            : prices[2]
          : // another way if we have 6 prices option
          totalQuantity + quantity < 10
          ? prices[0]
          : totalQuantity + quantity < 20
          ? prices[1]
          : totalQuantity + quantity < 30
          ? prices[2]
          : totalQuantity + quantity < 50
          ? prices[3]
          : totalQuantity + quantity < 100
          ? prices[4]
          : prices[5];

      storeUser.setCart(recalculateCart(cart));
    },
    [],
  );
  //
  const recalculateCart = useCallback((cart: OrderProduct[]) => {
    //const quantity = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    const quantity = cart.reduce((acc, curr) => {
      if (Object.keys(acc)?.includes(curr.product_id.toString())) {
        acc[curr.product_id.toString()] += curr.quantity;
      } else {
        acc[curr.product_id.toString()] = curr.quantity;
      }
      return acc;
    }, {} as {[key: string]: number});

    const newCart: OrderProduct[] = cart.map(orderedProduct => {
      if (orderedProduct.prices && orderedProduct.prices.length === 3) {
        return {
          ...orderedProduct,
          price:
            quantity[orderedProduct.product_id] < 10
              ? orderedProduct.prices[0]
              : quantity[orderedProduct.product_id] < 100
              ? orderedProduct.prices[1]
              : orderedProduct.prices[2],
        };
      }

      if (orderedProduct.prices && orderedProduct.prices.length === 6) {
        return {
          ...orderedProduct,
          price:
            quantity[orderedProduct.product_id] < 10
              ? orderedProduct.prices[0]
              : quantity[orderedProduct.product_id] < 20
              ? orderedProduct.prices[1]
              : quantity[orderedProduct.product_id] < 30
              ? orderedProduct.prices[2]
              : quantity[orderedProduct.product_id] < 50
              ? orderedProduct.prices[3]
              : quantity[orderedProduct.product_id] < 100
              ? orderedProduct.prices[4]
              : orderedProduct.prices[5],
        };
      }

      return orderedProduct;
    });

    return newCart;
  }, []);
  //
  const renderItem = useCallback(
    (props: ListRenderItemInfo<OrderProduct | OrderBundle>) => {
      const orderProduct = props.item as OrderProduct;
      const orderBundle = props.item as OrderBundle;
      const current = props.index;

      // const bundleSize = bundles.find(
      //   o => o.id === orderProduct.products[0].variant[0].option_id,
      // );
      // if (!bundleSize) {
      //   // if (isFocused) {
      //   //   storeUser.setCart(
      //   //     storeUser.cart.filter((c, i) => i !== current),
      //   //   );
      //   // }
      //   return <></>;
      // }
      // console.log('bundleSize>>>', bundleSize);

      if (orderBundle.bundle_id) {
        console.log('options>>', JSON.stringify(options));
        const bundle = bundles.find(b => b.id === orderBundle.bundle_id);

        console.log('bundle>>', JSON.stringify(bundle?.products));

        if (!bundle) {
          return <></>;
        }

        console.log('bundles state', JSON.stringify(bundles));
        console.log('orderBundle bundle', JSON.stringify(orderBundle));

        // const bundleSize = bundles.find(o => o.id === orderBundle.products[0].variant[0].option_id);
        // console.log('bundleSize>>>', bundleSize);
        // if (!bundleSize) {
        //   console.log('if in the bundle');

        //   return <></>;
        // }

        // const bundleSize = options.filter(s => {
        //   return orderBundle.products.some(a =>
        //     a.variant.some(v => v.option_id === s.id),
        //   );
        // });
        const bundleSize = {
          ...orderBundle,
          products: orderBundle.products.map(p => {
            return {
              ...p,
              variant: p.variant[0],
            };
          }),
        };
        const size: Option[] = options.filter(o =>
          bundleSize.products.find(b => b.variant.option_id === o.id),
        );
        let S = [];
        size.map(b => {
          b.values.map(a => {
            S.push(a);
          });
        });
        S = S.filter(a =>
          bundleSize.products.find(b => b.variant.value_id === a.id),
        );

        // .map(d => {
        //   return d.values.filter(v =>
        //     bundleSize.products.find(p => p.variant.value_id === v.id),
        //   );
        // })
        // const bundleDiam = options.filter(b => {
        //   return orderBundle.products.some(a =>
        //     a.variant.some(v => v.option_id === b.id),
        //   );
        // });

        const bundleDiam = {
          ...orderBundle,
          products: orderBundle.products.map(p => {
            return {
              ...p,
              variant: p.variant[1],
            };
          }),
        };
        const diam =
          options &&
          options?.length > 0 &&
          options?.filter(o =>
            bundleDiam?.products?.find(b => b.variant?.option_id === o?.id),
          );
        let D = [];
        diam &&
          diam.length > 0 &&
          diam.map(b => {
            b.values.map(a => {
              D.push(a);
            });
          });
        D = D.filter(a =>
          bundleDiam.products.find(b => b?.variant?.value_id === a?.id),
        );

        // const abc = bundleDiam.map(d =>
        //   // d.values?.map(a => console.log('valueLog', a)),
        //   console.log('bundleDlog', d),
        // );
        // console.log('abcabc>>', abc);

        // // const bundleDiam = bundles.find(b => b.id === orderBundle.products[0].variant[1].option_id);
        // console.log('diam bundle', JSON.stringify(bundleDiam));

        // const size = options.find(
        //   o => o.id === orderBundle.products[0].variant[0].option_id,
        // );
        // const diam = options.find(
        //   o => o.id === orderBundle.products[0].variant[1]?.option_id,
        // );

        return (
          <View
            style={[
              styles.product,
              {
                backgroundColor: '#a1ffba20',
                padding: 5,
                borderRadius: 6,
              },
            ]}>
            <View style={styles.productImage}>
              <FastImage
                source={{
                  uri: bundle.images[0]
                    .replace('https://api.dental.local', IMAGES_URL)
                    .replace('/uploads/', '/uploads/400/'),
                }}
                resizeMode="cover"
                style={{
                  width: (70 / 360) * w,
                  height: (70 / 360) * w,
                }}
              />
            </View>
            <View
              style={{
                marginEnd: (10 / 360) * w,
                flex: 1,
              }}>
              <Text style={[styles.productTitle, {minHeight: 75}]}>
                {orderProduct.title}
              </Text>
              {/* <Text style={styles.productSize}> */}
              {/* {diam?.values
                  ?.find(v => v.id === orderBundle.products[0].variant[1].value_id)
                  ?.title.replace(',', '.')}
                {!!diam && '  x '}
                {size.values
                  ?.find(v => v.id === orderBundle.products[0].variant[0].value_id)
                  ?.title.replace(',', '.')} */}
              {/* {bundleDiam.map(d => (
                  <Text>{d?.title}</Text>
                ))} */}
              {/* {bundleDiam.map(d =>
                  d.values
                    ?.find(
                      a =>
                        a.id ===
                        orderBundle.products.map(b =>
                          b.variant.map(c => c.value_id),
                        ),
                    )
                    ?.title.replace(',', '.'),
                )}
              </Text> */}
              <Text style={styles.productSize}>
                {D.map((v, index) => (
                  <>
                    <Text>{v.title.replace(',', '.')}</Text>
                    {index < D.length - 1 && ', '}
                  </>
                ))}
                {!!diam && '  x '}
                {S.map((v, index) => (
                  <>
                    <Text>{v.title.replace(',', '.')}</Text>
                    {index < S.length - 1 && ', '}
                  </>
                ))}
                {/* {bundleDiam.map(diam => (
                  <React.Fragment key={diam.id}>
                    {diam.values
                      ?.filter(value =>
                        orderBundle.products.some(product =>
                          product.variant.some(
                            variant => variant.value_id === value.id,
                          ),
                        ),
                      )
                      .map(value => (
                        <Text key={value.id}>
                          {value.title.replace(',', '.')}
                          {!!diam && ' x '}
                        </Text>
                      ))}
                  </React.Fragment>
                ))}
                {bundleSize.map(diam => (
                  <React.Fragment key={diam.id}>
                    {diam.values
                      ?.filter(value =>
                        orderBundle.products.some(product =>
                          product.variant.some(
                            variant => variant.value_id === value.id,
                          ),
                        ),
                      )
                      .map(value => (
                        <Text key={value.id}>
                          {value.title.replace(',', '.')}
                          {!!diam && ' x '}
                        </Text>
                      ))}
                  </React.Fragment>
                ))} */}
                {/* .{' '}
                <Text style={styles.productSize}>
                  {bundleDiam.map((diam, index) => (
                    <React.Fragment key={diam.id}>
                      {diam.values
                        ?.filter(value =>
                          orderBundle.products.some(product =>
                            product.variant.some(
                              variant => variant.value_id === value.id,
                            ),
                          ),
                        )
                        .map((value, subIndex, array) => (
                          <React.Fragment key={value.id}>
                            <Text>
                              {`${value.title.replace(',', '.')} X `}
                              {subIndex === array.length - 1
                                ? `${value.title.replace(',', '.')}`
                                : `${value.title.replace(',', '.')}, `}
                            </Text>
                          </React.Fragment>
                        ))}
                      {index < bundleDiamlength - 1 && ', '}
                    </React.Fragment>
                  ))}
                  {bundleSize.map((diam, index) => (
                    <React.Fragment key={diam.id}>
                      {diam.values
                        ?.filter(value =>
                          orderBundle.products.some(product =>
                            product.variant.some(
                              variant => variant.value_id === value.id,
                            ),
                          ),
                        )
                        .map((value, subIndex, array) => (
                          <React.Fragment key={value.id}>
                            <Text>
                              {`${value.title.replace(',', '.')} X `}
                              {subIndex === array.length - 1
                                ? `${value.title.replace(',', '.')}`
                                : `${value.title.replace(',', '.')}, `}
                            </Text>
                          </React.Fragment>
                        ))}
                      {index < bundleSize.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </Text> */}
                {/* {size.map(b => {
                  return (
                    <>
                      {[...(b.values || [])]?.map(v => (
                        <Text>{v.title}</Text>
                      ))}
                    </>
                  );
                })} */}
                {/* {diam.map(a => {
                  return a.values
                    ?.find(b =>
                      bundleDiam.products.some(
                        c => c.variant.value_id === b.id,
                      ),
                    )
                    ?.title.replace(',', '.');
                })} */}
                {/* {size.map(a => {
                  return a.values
                    ?.find(b =>
                      bundleSize.products.some(
                        c => c.variant.value_id === b.id,
                      ),
                    )
                    ?.title.replace(',', '.');
                })} */}
                {/* {D.map((v, index) => (
                  <React.Fragment key={v.id}>
                    <Text>{v.title.replace(',', '.')}</Text>
                    {index < D.length - 1 && ', '}
                  </React.Fragment>
                ))}
                {!!diam && ' x '}
                {S.map((v, index) => (
                  <React.Fragment key={v.id}>
                    <Text>{v.title.replace(',', '.')}</Text>
                    {index < S.length - 1 && ', '}
                  </React.Fragment>
                ))} */}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
              <Button
                icon={require('../../UI/images/close_blue.png')}
                size="small"
                color="white"
                style={{
                  height: (30 / 360) * w,
                  width: (30 / 360) * w,
                }}
                onPress={() => {
                  storeUser.deleteBundleFromCart(orderProduct.bundle_id);
                }}
              />
              <Text
                style={[
                  styles.productSize,
                  {
                    textAlign: 'right',
                    fontFamily: theme.fontFamily.bold,
                    marginBottom: (5 / 360) * w,
                    fontSize: (16 / 360) * w,
                    marginTop: 'auto',
                  },
                ]}>
                {asCurrency(orderProduct.quantity * orderProduct.price)}
              </Text>
            </View>
          </View>
        );
      }

      const product = products.find(p => p.id === orderProduct.product_id);

      const getSku = () => {
        const sameDiamProd = product?.variants.find(
          p =>
            p.option_id === orderProduct.variant[0].option_id &&
            p.value_id === orderProduct.variant[0].value_id,
        );
        if (!sameDiamProd) {
          return;
        }
        const sameSizeProd = sameDiamProd.variants?.find(
          p =>
            p.option_id === orderProduct.variant[1].option_id &&
            p.value_id === orderProduct.variant[1].value_id,
        );
        if (!sameSizeProd) {
          return;
        }
        return sameSizeProd.sku;
      };

      //console.log('prod_var', product?.variants.find(p=>p.option_id===orderProdu));
      if (!product) {
        // if (isFocused) {
        //   storeUser.setCart(
        //     storeUser.cart.filter((c, i) => i !== current),
        //   );
        // }
        return <></>;
      }
      console.log('orderProduct productdata', JSON.stringify(orderProduct));
      console.log('option >>', JSON.stringify(options));

      const size = options.find(
        o => o.id === orderProduct.variant[0].option_id,
      );
      if (!size) {
        // if (isFocused) {
        //   storeUser.setCart(
        //     storeUser.cart.filter((c, i) => i !== current),
        //   );
        // }
        return <></>;
      }
      const diam = options.find(
        o => o.id === orderProduct.variant[1]?.option_id,
      );
      const vsize = product.variants.find(
        (o: any) =>
          o.option_id === orderProduct.variant[0].option_id &&
          o.value_id === orderProduct.variant[0].value_id,
      );

      const prices =
        vsize?.prices ||
        vsize?.variants?.find(
          v =>
            v.option_id === orderProduct.variant[1].option_id &&
            v.value_id === orderProduct.variant[1].value_id,
        )?.prices;
      // console.log('prices', prices);
      if (!prices) {
        // if (isFocused) {
        //   storeUser.setCart(
        //     storeUser.cart.filter((c, i) => i !== current),
        //   );
        // }
        return <></>;
      }
      const cart: OrderProduct[] = JSON.parse(JSON.stringify(storeUser.cart));

      const totalQuantity: number = cart.reduce(
        (acc, curr) => acc + curr.quantity,
        0,
      );

      const sameProductsQuantity = cart
        .filter(item => item.product_id === orderProduct.product_id)
        .reduce((acc, curr) => acc + curr.quantity, 0);

      return (
        <View>
          <View style={styles.product}>
            <View style={styles.productImage}>
              <FastImage
                source={{
                  uri: product.images[0]
                    .replace('https://api.dental.local', IMAGES_URL)
                    .replace('/uploads/', '/uploads/400/'),
                }}
                resizeMode="cover"
                style={{
                  width: (70 / 360) * w,
                  height: (70 / 360) * w,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'column',
                marginEnd: (10 / 360) * w,
                flex: 1,
              }}>
              <Text style={[styles.productTitle, {minHeight: 45}]}>
                {product.title}
              </Text>
              <Text style={styles.productSize}>{getSku()}</Text>
              <Text style={styles.productSize}>
                {diam?.values
                  ?.find(v => v.id === orderProduct.variant[1].value_id)
                  ?.title.replace(',', '.')}
                {!!diam && '  x '}
                {size.values
                  ?.find(v => v.id === orderProduct.variant[0].value_id)
                  ?.title.replace(',', '.')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.grey + '8f',
                  borderRadius: (16 / 360) * w,
                  alignSelf: 'flex-start',
                  marginTop: 'auto',
                }}>
                <TouchableOpacity
                  style={{
                    width: (40 / 360) * w,
                    height: (32 / 360) * w,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    if (orderProduct) {
                      changeQty(
                        orderProduct,
                        cart,
                        current,
                        prices,
                        totalQuantity,
                        -1,
                      );
                    }

                    // if (orderProduct.quantity === 1) {
                    //   storeUser.setCart(
                    //     storeUser.cart.filter(
                    //       (c, i) => i !== current,
                    //     ),
                    //   );
                    // } else {
                    //   cart[current].quantity -= 1;
                    //   cart[current].price =
                    //     prices.length === 3
                    //       ? totalQuantity - 1 < 10 // subtract 1 from total quant
                    //         ? prices[0]
                    //         : totalQuantity - 1 < 100 // subtract 1 from total quant
                    //         ? prices[1]
                    //         : prices[2]
                    //       : // another way if we have 6 prices option
                    //       totalQuantity - 1 < 10
                    //       ? prices[0]
                    //       : totalQuantity - 1 < 20
                    //       ? prices[1]
                    //       : totalQuantity - 1 < 30
                    //       ? prices[2]
                    //       : totalQuantity - 1 < 50
                    //       ? prices[3]
                    //       : totalQuantity - 1 < 100
                    //       ? prices[4]
                    //       : prices[5];

                    //   storeUser.setCart(recalculateCart(cart));
                    // }
                  }}>
                  <Image
                    resizeMode="contain"
                    source={require('../../UI/images/minus.png')}
                    style={{width: (10 / 360) * w}}
                  />
                </TouchableOpacity>
                {/* <Text style={{color: theme.primary}}>
                {orderProduct.quantity}
              </Text> */}
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
                    maxWidth: 70,
                  }}
                  maxLength={6}
                  keyboardType="number-pad"
                  value={
                    currentEdit !== undefined
                      ? currentEdit.key === props.index
                        ? currentEdit.current
                        : orderProduct.quantity.toString()
                      : orderProduct.quantity.toString()
                  }
                  onChangeText={value => {
                    setCurrentEdit({
                      key: props.index,
                      current: value.replace(/[^0-9]/g, ''),
                    });
                    if (Number.isNaN(parseInt(value, 10))) {
                      return;
                    }
                    if (orderProduct) {
                      changeQty(
                        orderProduct,
                        cart,
                        current,
                        prices,
                        totalQuantity,
                        parseInt(value, 10) - orderProduct.quantity,
                      );
                    }
                  }}
                  onBlur={() => {
                    setCurrentEdit(undefined);
                  }}
                  onFocus={() =>
                    setCurrentEdit({
                      key: props.index,
                      current: orderProduct.quantity.toString(),
                    })
                  }
                  //selection={{
                  //  start: orderProduct.quantity.toString().length,
                  //  end: orderProduct.quantity.toString().length,
                  //}}
                />

                <TouchableOpacity
                  style={{
                    width: orderProduct ? (40 / 360) * w : (52 / 360) * w,
                    height: (32 / 360) * w,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    if (orderProduct) {
                      changeQty(
                        orderProduct,
                        cart,
                        current,
                        prices,
                        totalQuantity,
                        1,
                      );
                    }
                    // cart[current].quantity += 1;
                    // cart[current].price =
                    //   prices.length === 3
                    //     ? totalQuantity + 1 < 10 // add 1 to total quant
                    //       ? prices[0]
                    //       : totalQuantity + 1 < 100 // add 1 to total quant
                    //       ? prices[1]
                    //       : prices[2]
                    //     : // another way if we have 6 prices option
                    //     totalQuantity + 1 < 10
                    //     ? prices[0]
                    //     : totalQuantity + 1 < 20
                    //     ? prices[1]
                    //     : totalQuantity + 1 < 30
                    //     ? prices[2]
                    //     : totalQuantity + 1 < 50
                    //     ? prices[3]
                    //     : totalQuantity + 1 < 100
                    //     ? prices[4]
                    //     : prices[5];

                    // storeUser.setCart(recalculateCart(cart));
                  }}>
                  <Image
                    resizeMode="contain"
                    source={require('../../UI/images/plus_blue.png')}
                    style={{width: (10 / 360) * w}}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
              <Button
                icon={require('../../UI/images/close_blue.png')}
                size="small"
                color="white"
                style={{
                  height: (30 / 360) * w,
                  width: (30 / 360) * w,
                }}
                onPress={() => {
                  // filtering the card after deletion
                  const filteredCart: OrderProduct[] = cart.filter(
                    (c, index) => index !== current,
                  );

                  storeUser.setCart(recalculateCart(filteredCart));
                }}
              />
              <Text
                style={[
                  styles.productSize,
                  {
                    textAlign: 'right',
                    fontFamily: theme.fontFamily.bold,
                    marginBottom: (5 / 360) * w,
                    fontSize: (16 / 360) * w,
                    marginTop: 'auto',
                  },
                ]}>
                {asCurrency(orderProduct.quantity * orderProduct.price)}
              </Text>
            </View>
          </View>
          <DiscountTooltip
            priceBeforeDiscount={prices[0]}
            priceAfterDiscount={prices[1]}
            discountLimit={10}
            productTotalQuantity={sameProductsQuantity}
          />
          <DiscountTooltip
            priceBeforeDiscount={prices[1]}
            priceAfterDiscount={prices[2]}
            discountLimit={20}
            productTotalQuantity={sameProductsQuantity}
          />
          <DiscountTooltip
            priceBeforeDiscount={prices[2]}
            priceAfterDiscount={prices[3]}
            discountLimit={30}
            productTotalQuantity={sameProductsQuantity}
          />
          <DiscountTooltip
            priceBeforeDiscount={prices[3]}
            priceAfterDiscount={prices[4]}
            discountLimit={50}
            productTotalQuantity={sameProductsQuantity}
          />
          <DiscountTooltip
            priceBeforeDiscount={prices[4]}
            priceAfterDiscount={prices[5]}
            discountLimit={100}
            productTotalQuantity={sameProductsQuantity}
          />
        </View>
      );
    },
    [
      bundles,
      changeQty,
      currentEdit,
      options,
      products,
      recalculateCart,
      storeUser,
    ],
  );

  useEffect(() => {
    getProducts();
    getBundles();
    // storeUser.setShowCartBubble(false);
  }, [isFocused]);
  //
  useEffect(() => {
    getOptions();
    getShipments();
    // storeUser.setShowCartBubble(false);
  }, []);
  //
  useEffect(() => {
    autorun(() => {
      if (storeUser.cart.length) {
        getProducts();
      }
    });
  }, []);

  useEffect(() => {
    getSimilarProducts();
  }, [products]);

  //
  useEffect(() => {
    if (isFocused && storeUser.cart.length) {
      console.log('CART RECALCULATED');
      storeUser.setCart(recalculateCart(storeUser.cart));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // console.log('currentEdit', currentEdit);

  return (
    <View style={styles.wrapper}>
      {options.length > 0 && (products.length > 0 || isProductsLoaded) && (
        <Observer>
          {() => {
            const total =
              storeUser.cart.reduce((a, b) => a + b.price * b.quantity, 0) +
              storeUser.bundlesInCart.reduce(
                (a, b) => a + b.price * b.quantity,
                0,
              );

            if (!Number.isNaN(parseFloat(bonus.replace(',', '.')))) {
              if (parseFloat(bonus.replace(',', '.')) > total) {
                setBonus(total.toString());
              }
            }

            // console.log('totaltotaltotal', total);

            console.log('storeUser.cart', JSON.stringify(storeUser.cart));
            console.log(
              'storeUser.bundlesInCart',
              JSON.stringify(storeUser.bundlesInCart),
            );

            return (
              <FlatList
                contentContainerStyle={{padding: 24, flexGrow: 1}}
                // keyboardShouldPersistTaps="always"
                data={[...storeUser.cart, ...storeUser.bundlesInCart]}
                extraData={products}
                // renderItem={props => {
                //   const orderProduct = props.item;
                //   const current = props.index;
                //   if (orderProduct.bundle_id) {
                //     const bundle = bundles.find(
                //       b => b.id === orderProduct.bundle_id,
                //     );
                //     if (!bundle) {
                //       return <></>;
                //     }

                //     return (
                //       <View
                //         style={[
                //           styles.product,
                //           {
                //             backgroundColor: '#a1ffba20',
                //             padding: 5,
                //             borderRadius: 6,
                //           },
                //         ]}>
                //         <View style={styles.productImage}>
                //           <Image
                //             source={{
                //               uri: bundle.images[0]
                //                 .replace('https://api.dental.local', IMAGES_URL)
                //                 .replace('/uploads/', '/uploads/400/'),
                //             }}
                //             resizeMode="cover"
                //             style={{
                //               width: (70 / 360) * w,
                //               height: (70 / 360) * w,
                //             }}
                //           />
                //         </View>
                //         <View
                //           style={{
                //             marginEnd: (10 / 360) * w,
                //             flex: 1,
                //           }}>
                //           <Text style={[styles.productTitle, {minHeight: 75}]}>
                //             {orderProduct.title}
                //           </Text>
                //         </View>
                //         <View
                //           style={{
                //             flexDirection: 'column',
                //             justifyContent: 'space-between',
                //             alignItems: 'flex-end',
                //           }}>
                //           <Button
                //             icon={require('../../UI/images/close_blue.png')}
                //             size="small"
                //             color="white"
                //             style={{
                //               height: (30 / 360) * w,
                //               width: (30 / 360) * w,
                //             }}
                //             onPress={() => {
                //               storeUser.deleteBundleFromCart(
                //                 orderProduct.bundle_id,
                //               );
                //             }}
                //           />
                //           <Text
                //             style={[
                //               styles.productSize,
                //               {
                //                 textAlign: 'right',
                //                 fontFamily: theme.fontFamily.bold,
                //                 marginBottom: (5 / 360) * w,
                //                 fontSize: (16 / 360) * w,
                //                 marginTop: 'auto',
                //               },
                //             ]}>
                //             {asCurrency(
                //               orderProduct.quantity * orderProduct.price,
                //             )}
                //           </Text>
                //         </View>
                //       </View>
                //     );
                //   }
                //   const product = products.find(
                //     p => p.id === orderProduct.product_id,
                //   );

                //   const getSku = () => {
                //     const sameDiamProd = product?.variants.find(
                //       p =>
                //         p.option_id === orderProduct.variant[0].option_id &&
                //         p.value_id === orderProduct.variant[0].value_id,
                //     );
                //     if (!sameDiamProd) {
                //       return;
                //     }
                //     const sameSizeProd = sameDiamProd.variants?.find(
                //       p =>
                //         p.option_id === orderProduct.variant[1].option_id &&
                //         p.value_id === orderProduct.variant[1].value_id,
                //     );
                //     if (!sameSizeProd) {
                //       return;
                //     }
                //     return sameSizeProd.sku;
                //   };

                //   //console.log('prod_var', product?.variants.find(p=>p.option_id===orderProdu));
                //   if (!product) {
                //     // if (isFocused) {
                //     //   storeUser.setCart(
                //     //     storeUser.cart.filter((c, i) => i !== current),
                //     //   );
                //     // }
                //     return <></>;
                //   }
                //   const size = options.find(
                //     o => o.id === orderProduct.variant[0].option_id,
                //   );
                //   if (!size) {
                //     // if (isFocused) {
                //     //   storeUser.setCart(
                //     //     storeUser.cart.filter((c, i) => i !== current),
                //     //   );
                //     // }
                //     return <></>;
                //   }
                //   const diam = options.find(
                //     o => o.id === orderProduct.variant[1]?.option_id,
                //   );
                //   const vsize = product.variants.find(
                //     (o: any) =>
                //       o.option_id === orderProduct.variant[0].option_id &&
                //       o.value_id === orderProduct.variant[0].value_id,
                //   );

                //   const prices =
                //     vsize?.prices ||
                //     vsize?.variants?.find(
                //       v =>
                //         v.option_id === orderProduct.variant[1].option_id &&
                //         v.value_id === orderProduct.variant[1].value_id,
                //     )?.prices;
                //   // console.log('prices', prices);
                //   if (!prices) {
                //     // if (isFocused) {
                //     //   storeUser.setCart(
                //     //     storeUser.cart.filter((c, i) => i !== current),
                //     //   );
                //     // }
                //     return <></>;
                //   }
                //   const cart: OrderProduct[] = JSON.parse(
                //     JSON.stringify(storeUser.cart),
                //   );

                //   const totalQuantity: number = cart.reduce(
                //     (acc, curr) => acc + curr.quantity,
                //     0,
                //   );

                //   const sameProductsQuantity = cart
                //     .filter(item => item.product_id === orderProduct.product_id)
                //     .reduce((acc, curr) => acc + curr.quantity, 0);

                //   return (
                //     <View>
                //       <View style={styles.product}>
                //         <View style={styles.productImage}>
                //           <Image
                //             source={{
                //               uri: product.images[0]
                //                 .replace('https://api.dental.local', IMAGES_URL)
                //                 .replace('/uploads/', '/uploads/400/'),
                //             }}
                //             resizeMode="cover"
                //             style={{
                //               width: (70 / 360) * w,
                //               height: (70 / 360) * w,
                //             }}
                //           />
                //         </View>
                //         <View
                //           style={{
                //             flexDirection: 'column',
                //             marginEnd: (10 / 360) * w,
                //             flex: 1,
                //           }}>
                //           <Text style={[styles.productTitle, {minHeight: 45}]}>
                //             {product.title}
                //           </Text>
                //           <Text style={styles.productSize}>{getSku()}</Text>
                //           <Text style={styles.productSize}>
                //             {diam?.values
                //               ?.find(
                //                 v => v.id === orderProduct.variant[1].value_id,
                //               )
                //               ?.title.replace(',', '.')}
                //             {!!diam && '  x '}
                //             {size.values
                //               ?.find(
                //                 v => v.id === orderProduct.variant[0].value_id,
                //               )
                //               ?.title.replace(',', '.')}
                //           </Text>
                //           <View
                //             style={{
                //               flexDirection: 'row',
                //               alignItems: 'center',
                //               justifyContent: 'center',
                //               backgroundColor: theme.grey + '8f',
                //               borderRadius: (16 / 360) * w,
                //               alignSelf: 'flex-start',
                //               marginTop: 'auto',
                //             }}>
                //             <TouchableOpacity
                //               style={{
                //                 width: (40 / 360) * w,
                //                 height: (32 / 360) * w,
                //                 alignItems: 'center',
                //                 justifyContent: 'center',
                //               }}
                //               onPress={() => {
                //                 if (orderProduct) {
                //                   changeQty(
                //                     orderProduct,
                //                     cart,
                //                     current,
                //                     prices,
                //                     totalQuantity,
                //                     -1,
                //                   );
                //                 }

                //                 // if (orderProduct.quantity === 1) {
                //                 //   storeUser.setCart(
                //                 //     storeUser.cart.filter(
                //                 //       (c, i) => i !== current,
                //                 //     ),
                //                 //   );
                //                 // } else {
                //                 //   cart[current].quantity -= 1;
                //                 //   cart[current].price =
                //                 //     prices.length === 3
                //                 //       ? totalQuantity - 1 < 10 // subtract 1 from total quant
                //                 //         ? prices[0]
                //                 //         : totalQuantity - 1 < 100 // subtract 1 from total quant
                //                 //         ? prices[1]
                //                 //         : prices[2]
                //                 //       : // another way if we have 6 prices option
                //                 //       totalQuantity - 1 < 10
                //                 //       ? prices[0]
                //                 //       : totalQuantity - 1 < 20
                //                 //       ? prices[1]
                //                 //       : totalQuantity - 1 < 30
                //                 //       ? prices[2]
                //                 //       : totalQuantity - 1 < 50
                //                 //       ? prices[3]
                //                 //       : totalQuantity - 1 < 100
                //                 //       ? prices[4]
                //                 //       : prices[5];

                //                 //   storeUser.setCart(recalculateCart(cart));
                //                 // }
                //               }}>
                //               <Image
                //                 resizeMode="contain"
                //                 source={require('../../UI/images/minus.png')}
                //                 style={{width: (10 / 360) * w}}
                //               />
                //             </TouchableOpacity>
                //             {/* <Text style={{color: theme.primary}}>
                //               {orderProduct.quantity}
                //             </Text> */}
                //             <TextInput
                //               style={{
                //                 fontSize: 14,
                //                 lineHeight: 16,
                //                 fontFamily: theme.fontFamily.regular,
                //                 margin: 0,
                //                 padding: 0,
                //                 // borderWidth: 1,
                //                 height: (32 / 360) * w,
                //                 textAlign: 'center',
                //                 minWidth: 20,
                //                 color: theme.primary,
                //                 maxWidth: 70,
                //               }}
                //               maxLength={6}
                //               keyboardType="number-pad"
                //               value={
                //                 currentEdit !== undefined
                //                   ? currentEdit.key === props.index
                //                     ? currentEdit.current
                //                     : orderProduct.quantity.toString()
                //                   : orderProduct.quantity.toString()
                //               }
                //               onChangeText={value => {
                //                 setCurrentEdit({
                //                   key: props.index,
                //                   current: value.replace(/[^0-9]/g, ''),
                //                 });
                //                 if (Number.isNaN(parseInt(value, 10))) {
                //                   return;
                //                 }
                //                 if (orderProduct) {
                //                   changeQty(
                //                     orderProduct,
                //                     cart,
                //                     current,
                //                     prices,
                //                     totalQuantity,
                //                     parseInt(value, 10) - orderProduct.quantity,
                //                   );
                //                 }
                //               }}
                //               onBlur={() => {
                //                 setCurrentEdit(undefined);
                //               }}
                //               onFocus={() =>
                //                 setCurrentEdit({
                //                   key: props.index,
                //                   current: orderProduct.quantity.toString(),
                //                 })
                //               }
                //               //selection={{
                //               //  start: orderProduct.quantity.toString().length,
                //               //  end: orderProduct.quantity.toString().length,
                //               //}}
                //             />

                //             <TouchableOpacity
                //               style={{
                //                 width: orderProduct
                //                   ? (40 / 360) * w
                //                   : (52 / 360) * w,
                //                 height: (32 / 360) * w,
                //                 alignItems: 'center',
                //                 justifyContent: 'center',
                //               }}
                //               onPress={() => {
                //                 if (orderProduct) {
                //                   changeQty(
                //                     orderProduct,
                //                     cart,
                //                     current,
                //                     prices,
                //                     totalQuantity,
                //                     1,
                //                   );
                //                 }
                //                 // cart[current].quantity += 1;
                //                 // cart[current].price =
                //                 //   prices.length === 3
                //                 //     ? totalQuantity + 1 < 10 // add 1 to total quant
                //                 //       ? prices[0]
                //                 //       : totalQuantity + 1 < 100 // add 1 to total quant
                //                 //       ? prices[1]
                //                 //       : prices[2]
                //                 //     : // another way if we have 6 prices option
                //                 //     totalQuantity + 1 < 10
                //                 //     ? prices[0]
                //                 //     : totalQuantity + 1 < 20
                //                 //     ? prices[1]
                //                 //     : totalQuantity + 1 < 30
                //                 //     ? prices[2]
                //                 //     : totalQuantity + 1 < 50
                //                 //     ? prices[3]
                //                 //     : totalQuantity + 1 < 100
                //                 //     ? prices[4]
                //                 //     : prices[5];

                //                 // storeUser.setCart(recalculateCart(cart));
                //               }}>
                //               <Image
                //                 resizeMode="contain"
                //                 source={require('../../UI/images/plus_blue.png')}
                //                 style={{width: (10 / 360) * w}}
                //               />
                //             </TouchableOpacity>
                //           </View>
                //         </View>
                //         <View
                //           style={{
                //             flexDirection: 'column',
                //             justifyContent: 'space-between',
                //             alignItems: 'flex-end',
                //           }}>
                //           <Button
                //             icon={require('../../UI/images/close_blue.png')}
                //             size="small"
                //             color="white"
                //             style={{
                //               height: (30 / 360) * w,
                //               width: (30 / 360) * w,
                //             }}
                //             onPress={() => {
                //               // filtering the card after deletion
                //               const filteredCart: OrderProduct[] = cart.filter(
                //                 (c, index) => index !== current,
                //               );

                //               storeUser.setCart(recalculateCart(filteredCart));
                //             }}
                //           />
                //           <Text
                //             style={[
                //               styles.productSize,
                //               {
                //                 textAlign: 'right',
                //                 fontFamily: theme.fontFamily.bold,
                //                 marginBottom: (5 / 360) * w,
                //                 fontSize: (16 / 360) * w,
                //                 marginTop: 'auto',
                //               },
                //             ]}>
                //             {asCurrency(
                //               orderProduct.quantity * orderProduct.price,
                //             )}
                //           </Text>
                //         </View>
                //       </View>
                //       <DiscountTooltip
                //         priceBeforeDiscount={prices[0]}
                //         priceAfterDiscount={prices[1]}
                //         discountLimit={10}
                //         productTotalQuantity={sameProductsQuantity}
                //       />
                //       <DiscountTooltip
                //         priceBeforeDiscount={prices[1]}
                //         priceAfterDiscount={prices[2]}
                //         discountLimit={20}
                //         productTotalQuantity={sameProductsQuantity}
                //       />
                //       <DiscountTooltip
                //         priceBeforeDiscount={prices[2]}
                //         priceAfterDiscount={prices[3]}
                //         discountLimit={30}
                //         productTotalQuantity={sameProductsQuantity}
                //       />
                //       <DiscountTooltip
                //         priceBeforeDiscount={prices[3]}
                //         priceAfterDiscount={prices[4]}
                //         discountLimit={50}
                //         productTotalQuantity={sameProductsQuantity}
                //       />
                //       <DiscountTooltip
                //         priceBeforeDiscount={prices[4]}
                //         priceAfterDiscount={prices[5]}
                //         discountLimit={100}
                //         productTotalQuantity={sameProductsQuantity}
                //       />
                //     </View>
                //   );
                // }}
                renderItem={renderItem}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      width: '100%',
                      backgroundColor: theme.grey,
                      marginVertical: (16 / 360) * w,
                    }}
                  />
                )}
                ListFooterComponent={
                  <>
                    {storeUser.cart.length + storeUser.bundlesInCart.length >
                      0 && (
                      <>
                        {similarProducts.length > 0 && (
                          <View
                            style={{
                              marginTop: (20 / 360) * w,
                              marginHorizontal: -24,
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
                                label={t('Related product')}
                                size="medium"
                                style={{color: theme.bluedark}}
                              />
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
                        {/* <View style={{height: 20}} /> */}
                        {!!storeUser.user?.credits && (
                          <Bonus
                            bonus={bonus}
                            setBonus={setBonus}
                            max={total}
                          />
                        )}

                        <Divider />
                        {!!freeFrom && total > 100 ? (
                          <Text
                            style={{
                              color: theme.primary,
                              fontSize: (18 / 375) * w,
                              marginBottom: (16 / 375) * w,
                              textAlign: 'center',
                            }}>
                            {t(`Free shipping after $${freeFrom}`)}
                          </Text>
                        ) : (
                          <></>
                        )}
                        <View style={styles.finallyPrice}>
                          <View style={styles.finallyPriceItem}>
                            <Text style={styles.finallyPriceItemText}>
                              {t('Subtotal')}
                            </Text>
                            <Text style={styles.finallyPriceItemText}>
                              {asCurrency(total)}
                            </Text>
                          </View>
                          {!!(!Number.isNaN(parseFloat(bonus.replace(',', '.')))
                            ? parseFloat(bonus.replace(',', '.'))
                            : 0) && (
                            <View style={styles.finallyPriceItem}>
                              <Text style={styles.finallyPriceItemText}>
                                {t('Credits')}
                              </Text>
                              <Text style={styles.finallyPriceItemText}>
                                -
                                {asCurrency(
                                  !Number.isNaN(
                                    parseFloat(bonus.replace(',', '.')),
                                  )
                                    ? parseFloat(bonus.replace(',', '.'))
                                    : 0,
                                )}
                              </Text>
                            </View>
                          )}
                          <View style={styles.finallyPriceItem}>
                            <Text style={styles.finallyPriceItemTotal}>
                              {t('Total (USD)')}
                            </Text>
                            <Text style={styles.finallyPriceItemTotal}>
                              {asCurrency(
                                total -
                                  (!Number.isNaN(
                                    parseFloat(bonus.replace(',', '.')),
                                  )
                                    ? parseFloat(bonus.replace(',', '.'))
                                    : 0),
                              )}
                            </Text>
                          </View>
                        </View>
                        <View style={{height: 20}} />
                        <Button
                          type="circle"
                          label={t('Go to checkout')}
                          color="primary"
                          onPress={() => {
                            !!storeUser.user?.credits &&
                            (Number.isNaN(
                              parseFloat(bonus.replace(',', '.')),
                            ) ||
                              parseFloat(bonus.replace(',', '.')) <= 0)
                              ? setModalVisible(true)
                              : navigate('Checkout', {
                                  bonus: !Number.isNaN(
                                    parseFloat(bonus.replace(',', '.')),
                                  )
                                    ? parseFloat(bonus.replace(',', '.'))
                                    : 0,
                                });
                          }}
                        />
                      </>
                    )}
                  </>
                }
                ListEmptyComponent={() => (
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      source={require('../../UI/images/tabs/cart_black.png')}
                      style={{marginBottom: 50}}
                    />
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        color: theme.primary,
                        fontSize: 36,
                      }}>
                      Cart is empty
                    </Text>
                  </View>
                )}
              />
            );
          }}
        </Observer>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalWrapper}
            onPress={() => {
              setModalVisible(false);
            }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {'You have ' +
                  asCurrency(storeUser.user?.credits || 0) +
                  ' credits.  Do you want to use it?'}
              </Text>
              <View style={styles.modalBtnsCont}>
                <Button
                  type="circle"
                  label={t('Yes')}
                  color="primary"
                  style={{marginBottom: 10}}
                  onPress={() => {
                    const total =
                      storeUser.cart.reduce(
                        (a, b) => a + b.price * b.quantity,
                        0,
                      ) +
                      storeUser.bundlesInCart.reduce(
                        (a, b) => a + b.price * b.quantity,
                        0,
                      );
                    setBonus(
                      Math.min(storeUser.user?.credits || 0, total).toString(),
                    );
                    setModalVisible(false);
                  }}
                />
                <Button
                  type="circle"
                  label={t('No')}
                  color="primary"
                  onPress={() => {
                    setModalVisible(false);
                    navigate('Checkout', {
                      bonus: !Number.isNaN(parseFloat(bonus.replace(',', '.')))
                        ? parseFloat(bonus.replace(',', '.'))
                        : 0,
                    });
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    marginTop: (12 / 360) * w,
    // paddingHorizontal: (24 / 360) * w,
  },
  product: {
    flexDirection: 'row',
  },
  productImage: {
    width: (88 / 360) * w,
    height: (88 / 360) * w,
    backgroundColor: theme.bluelight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (12 / 360) * w,
    marginEnd: (12 / 360) * w,
  },
  productTitle: {
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
    color: theme.primary,
    marginBottom: (8 / 360) * w,
  },
  productSize: {
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
    color: theme.primary,
    // flex: 1,
  },
  productPrice: {
    fontFamily: theme.fontFamily.SFProTextBold,
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    paddingVertical: 6,
  },
  finallyPrice: {
    width: '100%',
  },
  finallyPriceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingHorizontal: (18 / 360) * w,
    marginTop: 'auto',
  },
  finallyPriceItemText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
  finallyPriceItemTotal: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: w - (32 / 360) * w,
    height: (240 / 360) * w,
    backgroundColor: 'white',
    paddingHorizontal: (16 / 360) * w,
    alignItems: 'center',
    borderRadius: (12 / 360) * w,
  },
  modalText: {
    marginTop: (32 / 360) * w,
    fontFamily: theme.fontFamily.bold,
    fontSize: (16 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
    textAlign: 'center',
  },
  modalBtnsCont: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: (32 / 360) * w,
    width: '100%',
  },
});
