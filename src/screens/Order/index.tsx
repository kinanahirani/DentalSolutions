import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Divider from '../../UI/Divider';
import AccordionView from '../../UI/Accordion';
import UserStore from '../../store/UserStore';
import {Option, Order as ProductsOrder, Shipment} from '../../types';
import api from '../../helpers/api';
import {asCurrency} from '../../helpers/formatter';
import {useHeaderHeight} from '@react-navigation/elements';
import {ORDER_STATUS_NAMES} from '../OrderHistory';
import Button from '../../UI/Button';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const Order = () => {
  //
  const {
    params: {order_id},
  } = useRoute<{
    params: {
      order_id: number;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();

  //
  const headerHeight = useHeaderHeight();

  //
  const [order, setOrder] = useState<ProductsOrder>();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  //
  const getOrder = async () => {
    const resp: ProductsOrder = await api(
      `orders/${order_id}?expand=catalog_products`,
      'GET',
      {},
      storeUser.token,
    );

    setOrder(resp);
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
  useEffect(() => {
    getOrder();
    getOptions();
    getShipments();
  }, []);

  return (
    <>
      <View
        style={{
          height: headerHeight,
        }}
      />
      <View style={[theme.wrapper, {padding: 0}]}>
        <ScrollView contentContainerStyle={{padding: (24 / 360) * w}}>
          {!!order && !!options.length && (
            <>
              <Title
                label={'#' + order.id}
                size="large"
                style={{marginBottom: (4 / 360) * w}}
              />
              {order.status !== undefined && (
                <Text style={styles.productSize}>
                  {t('Status: ')}
                  {ORDER_STATUS_NAMES[order.status]}
                </Text>
              )}
              <Divider />
              <Title
                label={t('Items order')}
                size="small"
                style={{marginBottom: (20 / 360) * w}}
              />
              {order.products.map(op => {
                const product = order.catalog_products?.find(
                  p => p.id === op.product_id,
                );
                if (!product) {
                  return <></>;
                }
                const size = options.find(
                  o => o.id === op.variant[0].option_id,
                );
                if (!size) {
                  return <></>;
                }
                const diam = options.find(
                  o => o.id === op.variant[1]?.option_id,
                );
                return (
                  <>
                    <View style={styles.product}>
                      <View style={styles.productImage}>
                        <FastImage
                          source={
                            product.images[0]
                              ? {uri: product.images[0]}
                              : require('../../UI/images/carousel.png')
                          }
                          resizeMode="cover"
                          style={{width: 70, height: 70}}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'column',
                          flex: 1,
                        }}>
                        <Text style={styles.productTitle}>
                          {t('Product name: ')}
                          {product.title}
                        </Text>
                        <View
                          style={{flex: 1, justifyContent: 'space-between'}}>
                          <Text style={styles.productSize}>
                            {diam?.values
                              ?.find(v => v.id === op.variant[1].value_id)
                              ?.title.replace(',', '.')}
                            {!!diam && '  x '}
                            {size.values
                              ?.find(v => v.id === op.variant[0].value_id)
                              ?.title.replace(',', '.')}
                          </Text>
                          <Text style={styles.productSize}>
                            {t('Q-ty: ')}
                            {op.quantity}
                          </Text>
                          <Text style={styles.productSize}>
                            {t('Price: ')}
                            {asCurrency(op.quantity * op.price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Divider />
                  </>
                );
              })}
              {order.bundles &&
                order.bundles.map(item => {
                  return (
                    <>
                      <View style={styles.bundleProduct}>
                        <View
                          style={{
                            flexDirection: 'column',
                            flex: 1,
                          }}>
                          <Text style={styles.bundleProductTitle}>
                            {t('Bundle') + ': '}
                            {item.title}
                          </Text>
                          <View
                            style={{flex: 1, justifyContent: 'space-between'}}>
                            <Text style={styles.productSize}>
                              {t('Q-ty: ')}
                              {item.quantity}
                            </Text>
                            <Text style={styles.productSize}>
                              {t('Price: ')}
                              {asCurrency(item.quantity * item.price)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.bundleItemProductWrapper}>
                        {item.products.map(pr => {
                          const product = order.catalog_products?.find(
                            p => p.id === pr.product_id,
                          );
                          if (!product) {
                            return <></>;
                          }
                          const size = options?.find(
                            o => o.id === pr.variant[0].option_id,
                          );
                          const diam = options?.find(
                            o => o.id === pr.variant[1]?.option_id,
                          );
                          return (
                            <View style={styles.bundleItemProduct}>
                              <View style={styles.productImage}>
                                <FastImage
                                  source={
                                    product.images[0]
                                      ? {uri: product.images[0]}
                                      : require('../../UI/images/carousel.png')
                                  }
                                  resizeMode="cover"
                                  style={{width: 70, height: 70}}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  flex: 1,
                                }}>
                                <Text style={styles.productTitle}>
                                  {t('Product name: ')}
                                  {product.title}
                                </Text>
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text style={styles.productSize}>
                                    {diam?.values
                                      ?.find(
                                        v => v.id === pr.variant[1].value_id,
                                      )
                                      ?.title.replace(',', '.')}
                                    {!!diam && '  x '}
                                    {size?.values
                                      ?.find(
                                        v => v.id === pr.variant[0].value_id,
                                      )
                                      ?.title.replace(',', '.')}
                                  </Text>
                                  <Text style={styles.productSize}>
                                    {t('Q-ty: ')}
                                    {pr.quantity}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                      <Divider />
                    </>
                  );
                })}

              <View style={styles.finallyPriceItem}>
                <Text style={styles.finallyPriceItemTotal}>
                  {t('Total (USD)')}
                </Text>
                <Text style={styles.finallyPriceItemTotal}>
                  {asCurrency(order.total)}
                </Text>
              </View>

              {order.carrier && (
                <>
                  <Divider style={{marginTop: 0}} />
                  <View style={styles.finallyPriceItem}>
                    <Text style={[styles.finallyPriceItemTotal]}>
                      {`Carrier: ${order.carrier}`}
                    </Text>
                  </View>
                </>
              )}
              {order.ups && (
                <>
                  <View style={styles.finallyPriceItem}>
                    <Text style={[styles.finallyPriceItemTotal]}>
                      {`Tracking number: ${order.ups}`}
                    </Text>
                  </View>
                </>
              )}
              {order.shipping_url && (
                <>
                  <View style={styles.finallyPriceItem}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onPress={() => {
                        if (order.shipping_url) {
                          try {
                            Linking.openURL(order.shipping_url);
                          } catch (e: any) {
                            Alert.alert(e);
                          }
                        }
                      }}>
                      <Text style={[styles.finallyPriceItemTotal]}>
                        {'URL of order tracking website'}
                      </Text>
                      <Button
                        label={t('open link')}
                        size="small"
                        labelSize="small"
                        color="grey"
                        onPress={() => {
                          if (order.shipping_url) {
                            try {
                              Linking.openURL(order.shipping_url);
                            } catch (e: any) {
                              Alert.alert(e);
                            }
                          }
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <View
                style={{
                  marginHorizontal: -(30 / 360) * w,
                  marginBottom: (50 / 360) * w,
                }}>
                <AccordionView shipments={shipments} />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default Order;

const styles = StyleSheet.create({
  product: {
    flexDirection: 'row',
  },
  bundleProduct: {
    flexDirection: 'row',
    marginBottom: 10,
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
    marginBottom: 8,
  },
  bundleProductTitle: {
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    fontFamily: theme.fontFamily.bold,
    color: theme.primary,
    marginBottom: 8,
  },
  productSize: {
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
    color: theme.primary,
    flex: 1,
  },
  productPrice: {
    fontFamily: theme.fontFamily.SFProTextBold,
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    paddingVertical: (6 / 360) * w,
  },
  finallyPrice: {
    width: '100%',
  },
  finallyPriceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: (16 / 360) * w,
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
  bundleItemProduct: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bundleItemProductWrapper: {
    marginStart: 20,
  },
});
