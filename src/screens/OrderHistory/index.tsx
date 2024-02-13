import {useNavigation} from '@react-navigation/native';
import React, {useContext, useLayoutEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Button from '../../UI/Button';
import UserStore from '../../store/UserStore';
import {useEffect} from 'react';
import {Order, OrderStatus} from '../../types';
import api from '../../helpers/api';
import {useState} from 'react';
import {asCurrency, asDate} from '../../helpers/formatter';

const w = Dimensions.get('screen').width;

export const ORDER_STATUS_NAMES = {
  [OrderStatus.CANCELED]: 'Canceled',
  [OrderStatus.ABORTED]: 'Aborted',
  [OrderStatus.NEW]: 'New',
  [OrderStatus.HOLD]: 'Hold',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.PROGRESS]: 'Progress',
  [OrderStatus.SENDING]: 'Sending',
  [OrderStatus.SENT]: 'Sent',
  [OrderStatus.DELIVERED]: 'Delivered',
};

const OrderHistory = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const navigation = useNavigation();

  //
  const {t} = useTranslation();

  //
  const [orders, setOrders] = useState<Order[]>([]);

  //
  const getOrders = async () => {
    const resp: {data: Order[]; total: number} = await api(
      'orders?sort=-id&page=1',
      'GET',
      {},
      storeUser.token,
    );

    setOrders(state => [...state, ...resp.data]);
  };

  //
  useEffect(() => {
    getOrders();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
  }, []);

  // const reorder = order => {
  //   storeUser.setCart([]);

  //   if (order.products && order.products.length > 0) {
  //     storeUser.setCart(order.products);
  //   }

  //   if (order.bundles && order.bundles.length > 0) {
  //     order.bundles.forEach(bundle => {
  //       storeUser.addBundleToCartForReorder(bundle);
  //     });
  //   }

  //   navigation.navigate('Cart');
  // };
  const reorder = order => {
    const currentCartItems = storeUser.cart;

    if (order.products && order.products.length > 0) {
      const updatedCartItems = [...currentCartItems, ...order.products];
      storeUser.setCart(updatedCartItems);
    }

    if (order.bundles && order.bundles.length > 0) {
      order.bundles.forEach(bundle => {
        storeUser.addBundleToCartForReorder(bundle);
      });
    }
    navigation.navigate('Cart');
  };

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.whiteBG} />
      <FlatList
        contentContainerStyle={styles.wrapper}
        data={orders}
        ListHeaderComponent={
          <Title
            label={t('Order history')}
            size="large"
            style={{marginBottom: (20 / 360) * w}}
          />
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
              navigation.navigate('Order', {
                order_id: item.id,
              });
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: (10 / 360) * w,
              }}>
              <Title label={'#' + item.id} size="medium" />
              <Button
                label={t('+ Reorder')}
                size="small"
                labelSize="small"
                color="grey"
                onPress={() => reorder(item)}
                // onPress={() => {
                //   storeUser.setCart( item.products );
                //   navigation.navigate('Cart');
                // }}
              />
            </View>

            {/* <View style={styles.orderCardInfo} /> */}
            <Text style={styles.orderCardInfo}>
              <Text>
                {t('Date: ')}
                {asDate(new Date(item.created_at * 1000))}
              </Text>
              {'\n'}
              <Text>
                {t('Ship to: ')} {item.address.fname} {item.address.lname}
              </Text>
              {'\n'}
              <Text>
                {t('Order total: ')}
                {asCurrency(item.total + item.shipment_price)}
              </Text>
              {'\n'}
              {item.status !== undefined && (
                <Text>
                  {t('Status: ')}
                  {ORDER_STATUS_NAMES[item.status]}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
};

export default OrderHistory;

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
  orderCard: {
    borderWidth: (1 / 360) * w,
    borderColor: theme.blue,
    borderRadius: (6 / 360) * w,
    padding: (20 / 360) * w,
    marginBottom: (20 / 360) * w,
  },
  orderCardInfo: {
    flexDirection: 'column',
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
});
