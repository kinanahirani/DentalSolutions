import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../UI/Button';
import {theme} from '../../UI/theme';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  Card,
  CardTypes,
  ErrorType,
  Option,
  Order,
  Product,
  ResponseMessages,
} from '../../types';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {asCurrency} from '../../helpers/formatter';
import {getImage} from '../../helpers/functions';
import CommonStore from '../../store/CommonStore';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import FastImage from 'react-native-fast-image';

interface OrderResponce extends Order {
  error: ErrorType[];
}

const w = Dimensions.get('window').width;

const Step2 = ({order}: {order: Order}) => {
  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  console.log('order>>>>>>', JSON.stringify(order));

  //
  const {t} = useTranslation();

  //
  const {navigate} = useNavigation();

  //
  const [cardChecked, setCardChecked] = useState<number>();
  const [cards, setCards] = useState<Card[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  //
  const total =
    order.bundles.reduce((a, b) => a + b.price * b.quantity, 0) +
    order.products.reduce((a, b) => a + b.price * b.quantity, 0) -
    order.bonus +
    order.shipment_price;

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
  const getProducts = async () => {
    const resp: {data: Product[]} = await api(
      `products?per-page=50&${order.products
        .map(c => `filter[id][in][]=${c.product_id}`)
        .join('&')}`,
      'GET',
      {},
      storeUser.token,
    );
    setProducts(resp.data);
  };

  const paymentOrder = async () => {
    if (!cardChecked) {
      Alert.alert(t('Error'), 'Choose a payment method');
      return;
    }

    storeCommon.setLoading(true);
    let payment = null;
    /**
     *
     */
    if (cardChecked > 0) {
      const card = cards.find(c => c.id === cardChecked);
      console.log('card>108', card);

      if (!card) {
        storeCommon.setLoading(false);
        return;
      }
      const serialize = (obj: any, prefix: any = undefined): string => {
        var str = [],
          p;
        for (p in obj) {
          if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + '[' + p + ']' : p,
              v = obj[p];
            str.push(
              v !== null && typeof v === 'object'
                ? serialize(v, k)
                : encodeURIComponent(k) + '=' + encodeURIComponent(v),
            );
          }
        }
        return str.join('&');
      };
      const fetchObj: RequestInit = {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      };

      const json_purchase_data: {
        product_name: string;
        product_quantity: number;
        product_price: number;
      }[] = [];

      order.bundles.forEach(ob => {
        json_purchase_data.push({
          product_name: ob.title,
          product_quantity: ob.quantity,
          product_price: ob.price,
        });
      });

      order.products.forEach(op => {
        const product = products.find(p => p.id === op.product_id);
        if (!product) {
          return;
        }

        let product_name = product.title;
        let size_string = '';

        const size = options.find(o => o.id === op.variant[0].option_id);
        if (!size) {
          return;
        }
        const diam = options.find(o => o.id === op.variant[1]?.option_id);

        if (diam?.values?.find(v => v.id === op.variant[1].value_id)) {
          size_string +=
            diam.values
              .find(v => v.id === op.variant[1].value_id)
              ?.title.replace(',', '.') + '  x ';
        }
        if (size.values?.find(v => v.id === op.variant[0].value_id)) {
          size_string += size.values
            ?.find(v => v.id === op.variant[0].value_id)
            ?.title.replace(',', '.');
        }

        if (size_string) {
          product_name += ` (${size_string})`;
        }

        json_purchase_data.push({
          product_name,
          product_quantity: op.quantity,
          product_price: op.price,
        });
      });
      if (order.shipment_price) {
        json_purchase_data.push({
          product_name: 'Shipment',
          product_quantity: 1,
          product_price: order.shipment_price,
        });
      }
      if (order.bonus) {
        json_purchase_data.push({
          product_name: 'Credits',
          product_quantity: 1,
          product_price: order.bonus * -1,
        });
      }

      // New payment gateway
      const bodyData = {
        cc_token: card?.card_uid,
        card_holder_name: card?.card_holder_name,
        address: order.address.street + ' ' + order.address.house,
        city: order.address.zip + ', ' + order.address.city,
        contact:
          storeUser.user?.fname && storeUser.user?.lname
            ? `${storeUser.user?.fname} ${storeUser.user?.lname}`
            : `${order.address.fname} ${order.address.lname}`,
        cred_type: '1',
        currency: '2',
        email: storeUser.user?.email,
        json_purchase_data: encodeURIComponent(
          JSON.stringify(json_purchase_data),
        ),
        sum:
          order.products.reduce((a, b) => a + b.quantity * b.price, 0) +
          order.bundles.reduce((a, b) => a + b.quantity * b.price, 0) +
          order.shipment_price -
          order.bonus,
        supplier: 'protech',
        tranmode: 'A',
        country: order.address.country,
      };

      console.log('PAYMENT bodyData ==>>', bodyData);

      const response = await api(
        'payment/payment-order',
        'POST',
        bodyData,
        storeUser.token,
      );

      console.log('response ==>>', JSON.stringify(response));

      if (response.results && response.results.status == 'error') {
        storeCommon.setLoading(false);
        const errMsg = response.results.description.replace(/-/g, ' ');
        Alert.alert('Payment error', errMsg);
      } else {
        completeOrder(response.data);
        storeCommon.setLoading(false);
      }
    }
  };

  // paymentOrder with REAL tranzilla credits
  // const paymentOrder = async () => {
  //   if (!cardChecked) {
  //     Alert.alert(t('Error'), 'Choose a payment method');
  //     return;
  //   }

  //   storeCommon.setLoading(true);
  //   let payment = null;
  //   /**
  //    *
  //    */
  //   if (cardChecked > 0) {
  //     const card = cards.find(c => c.id === cardChecked);
  //     if (!card) {
  //       storeCommon.setLoading(false);
  //       return;
  //     }
  //     const serialize = (obj: any, prefix: any = undefined): string => {
  //       var str = [],
  //         p;
  //       for (p in obj) {
  //         if (obj.hasOwnProperty(p)) {
  //           var k = prefix ? prefix + '[' + p + ']' : p,
  //             v = obj[p];
  //           str.push(
  //             v !== null && typeof v === 'object'
  //               ? serialize(v, k)
  //               : encodeURIComponent(k) + '=' + encodeURIComponent(v),
  //           );
  //         }
  //       }
  //       return str.join('&');
  //     };
  //     const fetchObj: RequestInit = {
  //       method: 'POST',
  //       headers: new Headers({
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       }),
  //     };

  //     const json_purchase_data: {
  //       product_name: string;
  //       product_quantity: number;
  //       product_price: number;
  //     }[] = [];

  //     order.bundles.forEach(ob => {
  //       json_purchase_data.push({
  //         product_name: ob.title,
  //         product_quantity: ob.quantity,
  //         product_price: ob.price,
  //       });
  //     });

  //     order.products.forEach(op => {
  //       const product = products.find(p => p.id === op.product_id);
  //       if (!product) {
  //         return;
  //       }

  //       let product_name = product.title;
  //       let size_string = '';

  //       const size = options.find(o => o.id === op.variant[0].option_id);
  //       if (!size) {
  //         return;
  //       }
  //       const diam = options.find(o => o.id === op.variant[1]?.option_id);

  //       if (diam?.values?.find(v => v.id === op.variant[1].value_id)) {
  //         size_string +=
  //           diam.values
  //             .find(v => v.id === op.variant[1].value_id)
  //             ?.title.replace(',', '.') + '  x ';
  //       }
  //       if (size.values?.find(v => v.id === op.variant[0].value_id)) {
  //         size_string += size.values
  //           ?.find(v => v.id === op.variant[0].value_id)
  //           ?.title.replace(',', '.');
  //       }

  //       if (size_string) {
  //         product_name += ` (${size_string})`;
  //       }

  //       json_purchase_data.push({
  //         product_name,
  //         product_quantity: op.quantity,
  //         product_price: op.price,
  //       });
  //     });
  //     if (order.shipment_price) {
  //       json_purchase_data.push({
  //         product_name: 'Shipment',
  //         product_quantity: 1,
  //         product_price: order.shipment_price,
  //       });
  //     }
  //     if (order.bonus) {
  //       json_purchase_data.push({
  //         product_name: 'Credits',
  //         product_quantity: 1,
  //         product_price: order.bonus * -1,
  //       });
  //     }

  //     // console.log('json_purchase_data ==>>', json_purchase_data);
  //     // return;

  //     // charge with token
  //     const body = {
  //       supplier: 'protech', // 'terminal_name' should be replaced by actual terminal name
  //       // supplier: 'shtibeltest',
  //       tranmode: 'A',
  //       TranzilaTK: card.TranzilaTK,
  //       expdate: card.expdate, // Card expiry date: mmyy
  //       sum:
  //         order.products.reduce((a, b) => a + b.quantity * b.price, 0) +
  //         order.bundles.reduce((a, b) => a + b.quantity * b.price, 0) +
  //         order.shipment_price -
  //         order.bonus,
  //       currency: '2', // USD
  //       // currency: '1', // ILS
  //       cred_type: '1',
  //       mycvv: card.cvv,
  //       TranzilaPW: 'aB2MSrGL',
  //       // TranzilaPW: 'shtibeltest',
  //       email: storeUser.user?.email,
  //       contact:
  //         storeUser.user?.fname && storeUser.user?.lname
  //           ? `${storeUser.user?.fname} ${storeUser.user?.lname}`
  //           : `${order.address.fname} ${order.address.lname}`,

  //       // NEW FIELDS
  //       json_purchase_data: encodeURIComponent(
  //         JSON.stringify(json_purchase_data),
  //       ),
  //       // company: 'Dental Solutions LTD',
  //       address: order.address.street + ' ' + order.address.house,
  //       //  +
  //       // ' ' +
  //       // order.address.appartment
  //       city: order.address.zip + ', ' + order.address.city,
  //       // ilang: 'eng',
  //       // IMaam: 0,
  //     };

  //     console.log('PAYMENT BODY ==>>', body);

  //     const response = await fetch(
  //       'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //       {
  //         ...fetchObj,
  //         body: serialize(body),
  //       },
  //     );

  //     // console.log('response ==>>', response);

  //     const html = await response.text();
  //     const object = html.split('&').reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});

  //     if (object.Response !== '000') {
  //       Alert.alert(t('Payment failed'), ResponseMessages[object.Response]);
  //       storeCommon.setLoading(false);
  //       return;
  //     }

  //     payment = object;

  //     completeOrder(payment);
  //   }
  // };

  // paymentOrder with TEST tranzilla credits
  // const paymentOrder = async () => {
  //   if (!cardChecked) {
  //     Alert.alert(t('Error'), 'Choose a payment method');
  //     return;
  //   }

  //   storeCommon.setLoading(true);
  //   let payment = null;
  //   /**
  //    *
  //    */
  //   if (cardChecked > 0) {
  //     const card = cards.find(c => c.id === cardChecked);
  //     if (!card) {
  //       storeCommon.setLoading(false);
  //       return;
  //     }
  //     const serialize = (obj: any, prefix: any = undefined): string => {
  //       var str = [],
  //         p;
  //       for (p in obj) {
  //         if (obj.hasOwnProperty(p)) {
  //           var k = prefix ? prefix + '[' + p + ']' : p,
  //             v = obj[p];
  //           str.push(
  //             v !== null && typeof v === 'object'
  //               ? serialize(v, k)
  //               : encodeURIComponent(k) + '=' + encodeURIComponent(v),
  //           );
  //         }
  //       }
  //       return str.join('&');
  //     };
  //     const fetchObj: RequestInit = {
  //       method: 'POST',
  //       headers: new Headers({
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       }),
  //     };

  //     const json_purchase_data: {
  //       product_name: string;
  //       product_quantity: number;
  //       product_price: number;
  //     }[] = [];
  //     order.products.forEach(op => {
  //       const product = products.find(p => p.id === op.product_id);
  //       if (!product) {
  //         return;
  //       }

  //       let product_name = product.title;
  //       let size_string = '';

  //       const size = options.find(o => o.id === op.variant[0].option_id);
  //       if (!size) {
  //         return;
  //       }
  //       const diam = options.find(o => o.id === op.variant[1]?.option_id);

  //       if (diam?.values?.find(v => v.id === op.variant[1].value_id)) {
  //         size_string +=
  //           diam.values
  //             .find(v => v.id === op.variant[1].value_id)
  //             ?.title.replace(',', '.') + '  x ';
  //       }
  //       if (size.values?.find(v => v.id === op.variant[0].value_id)) {
  //         size_string += size.values
  //           ?.find(v => v.id === op.variant[0].value_id)
  //           ?.title.replace(',', '.');
  //       }

  //       if (size_string) {
  //         product_name += ` (${size_string})`;
  //       }

  //       json_purchase_data.push({
  //         product_name,
  //         product_quantity: op.quantity,
  //         product_price: op.price,
  //       });
  //     });
  //     if (order.shipment_price) {
  //       json_purchase_data.push({
  //         product_name: 'Shipment',
  //         product_quantity: 1,
  //         product_price: order.shipment_price,
  //       });
  //     }
  //     if (order.bonus) {
  //       json_purchase_data.push({
  //         product_name: 'Credits',
  //         product_quantity: 1,
  //         product_price: order.bonus * -1,
  //       });
  //     }

  //     // console.log('ORDER ==>>', order);

  //     // charge with token
  //     const summ =
  //       order.products.reduce((a, b) => a + b.quantity * b.price, 0) +
  //       order.bundles.reduce((a, b) => a + b.price * b.quantity, 0) +
  //       order.shipment_price -
  //       order.bonus;
  //     console.log('sum', summ);
  //     const body = {
  //       supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //       tranmode: 'A',
  //       TranzilaTK: card.TranzilaTK,
  //       expdate: card.expdate, // Card expiry date: mmyy
  //       sum: summ,
  //       currency: '1', // USD
  //       cred_type: '1',
  //       mycvv: card.cvv,
  //       TranzilaPW: 'shtibeltest',
  //     };

  //     console.log('PAYMENT BODY ==>>', body);

  //     const response = await fetch(
  //       'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //       {
  //         ...fetchObj,
  //         body: serialize(body),
  //       },
  //     );

  //     // console.log('response ==>>', response);

  //     const html = await response.text();
  //     const object = html.split('&').reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});
  //     console.log('object', object);
  //     console.log('objectResp', object.Response);

  //     if (object.Response !== '000') {
  //       Alert.alert(t('Payment failed'), ResponseMessages[object.Response]);
  //       storeCommon.setLoading(false);
  //       return;
  //     }

  //     payment = object;

  //     completeOrder(payment);
  //   }
  // };

  //
  const completeOrder = async (payment: any) => {
    console.log('completeOrder start');

    storeCommon.setLoading(true);
    const resp: OrderResponce = await api(
      'orders',
      'POST',
      {
        ...order,
        // shipment_price: order.shipment_type === ShipmentType.REGULAR ? 12 : 25,
        status: cardChecked || total === 0 ? 10 : 0,
        shipment_type: order.shipment_type,
        payment,
      },
      storeUser.token,
    );
    console.log(resp, '..resp in completeOrder673');

    analytics().logEvent('FIB_Complete_order', {});
    AppEventsLogger.logEvent('fb_Complete_order');
    appsFlyer.logEvent('af_Complete_order', {});

    if (resp.error) {
      storeCommon.setLoading(false);
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    console.log('ORDER', resp);
    storeCommon.setLoading(false);
    storeUser.getDefaultBundlesInCartState();

    Alert.alert(
      'Order created successfull',
      `Your order ${resp.id} was send succsessfully`,
    );
    storeUser.setCart([]);

    if (storeUser.user) {
      const userResp = await api('account', 'GET', {}, storeUser.token);

      if (resp.id) {
        storeUser.setUser(userResp);
      }
    }

    navigate('Home');
  };

  //
  useFocusEffect(
    useCallback(() => {
      if (storeUser.user) {
        const getCards = async () => {
          // const resp: {data: Card[]} = await api(
          //   'account/cards',
          //   'GET',
          //   {},
          //   storeUser.token,
          // );

          // console.log('CARDS', resp.data);
          // setCards(resp.data);

          // if (JSON.stringify(resp.data) !== JSON.stringify(cards)) {
          //   setCards(resp.data);
          // }
          // if (!cardChecked && resp.data[0]) {
          //   setCardChecked(resp.data[0].id);
          // }
          const resp: {data: Card[]} = await api(
            'payment/get-credit-card-token',
            'GET',
            {},
            storeUser.token,
          );
          console.log('getCard>>>>>>>', resp);
          setCards(resp);
          if (JSON.stringify(resp) !== JSON.stringify(cards)) {
            setCards(resp);
          }
          if (!cardChecked && resp[0]) {
            setCardChecked(resp[0].id);
          }
        };

        if (total) {
          getCards();
        }
      }
    }, []),
  );

  //
  useEffect(() => {
    if (total === 0) {
      completeOrder(null);
    }

    getProducts();
    getOptions();
  }, []);

  useEffect(() => {
    if (!storeUser.user && cards.length) {
      setCardChecked(cards[0].id);
    }
  }, [cards, storeUser.user]);

  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        padding: (24 / 360) * w,
        flexGrow: 1,
        paddingTop: 0,
      }}>
      {total > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: (20 / 360) * w,
          }}>
          <Text style={styles.infoTitle}>{t('Frequent Methods')}</Text>
          <Button
            label={t('+Add New Card')}
            type="circle"
            color="primarydark"
            invert
            style={{
              backgroundColor: 'rgba(43, 76, 118, 0.05)',
              paddingHorizontal: 20,
            }}
            size="medium"
            labelSize="large"
            onPress={() =>
              navigate('AddNewCard', {
                callback: (newCard: Card) => {
                  if (storeUser.user) {
                    setCards(state => [newCard, ...state]);
                  } else {
                    setCards(state => [newCard, ...state]);
                    setCardChecked(newCard.id);
                  }
                },
              })
            }
          />
        </View>
      )}
      <View style={{flex: 1}}>
        {/*<TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor:
                cardChecked === 0 ? theme.bluelight : theme.white,
            },
          ]}
          onPress={() => setCardChecked(0)}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FastImage
              source={
                cardChecked === 0
                  ? require('../../UI/images/checkCard_on.png')
                  : require('../../UI/images/checkCard_off.png')
              }
              resizeMode="contain"
              style={{
                width: (24 / 360) * w,
                height: (24 / 360) * w,
                marginEnd: (10 / 360) * w,
              }}
            />
            <View>
              <Text style={styles.cardName}>{t('Cash on Delivery')}</Text>
              <Text style={styles.cardNumber}>
                {t('Lorem Ipsum is simply dummy text')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>*/}
        {cards &&
          cards.map(card => (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor:
                    cardChecked === card.id ? theme.bluelight : theme.white,
                },
              ]}
              onPress={() => setCardChecked(card.id)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <FastImage
                  source={
                    cardChecked === card.id
                      ? require('../../UI/images/checkCard_on.png')
                      : require('../../UI/images/checkCard_off.png')
                  }
                  resizeMode="contain"
                  style={{
                    width: (24 / 360) * w,
                    height: (24 / 360) * w,
                    marginEnd: (10 / 360) * w,
                  }}
                />
                <View style={{flex: 1}}>
                  <Text style={styles.cardName}>{card.brand_name}</Text>
                  {/* <Text style={styles.cardName}>
                    {CardTypes[card.cardtype]}
                  </Text> */}
                  <Text style={styles.cardNumber}>
                    {/* •••• •••• •••• {card.TranzilaTK.slice(-4)} */}
                    •••• •••• •••• {card.last}
                  </Text>
                </View>
                <FastImage
                  source={getImage(card)}
                  resizeMode="contain"
                  style={{
                    maxWidth: (40 / 360) * w,
                    height: (21 / 360) * w,
                    // marginEnd: (10 / 360) * w,
                  }}
                />
              </View>
            </TouchableOpacity>
          ))}
        <View style={styles.total}>
          <Text style={styles.totalText}>{t('Total (USD)')}</Text>
          <Text style={styles.totalText}>
            {asCurrency(
              order.products.reduce((a, b) => a + b.quantity * b.price, 0) +
                order.bundles.reduce((a, b) => a + b.quantity * b.price, 0) +
                order.shipment_price -
                order.bonus,
            )}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: (32 / 360) * w,
        }}>
        <FastImage
          source={require('../../UI/images/cards/visa.png')}
          style={styles.secure}
          resizeMode="contain"
        />
        <FastImage
          source={require('../../UI/images/cards/mastercard.png')}
          style={styles.secure}
          resizeMode="contain"
        />
        <FastImage
          source={require('../../UI/images/cards/express.png')}
          style={styles.secure}
          resizeMode="contain"
        />
        <FastImage
          source={require('../../UI/images/pci-logo-1.png')}
          style={{width: `${(100 / 6.2) * 2}%`, height: 45}}
        />
      </View>
      <Button
        type="circle"
        color="primary"
        label={t('Complete Order')}
        // disabled={!cardChecked ? true : false}
        onPress={paymentOrder}
      />
    </ScrollView>
  );
};

export default Step2;

const styles = StyleSheet.create({
  infoTitle: {
    flex: 1,
    fontFamily: theme.fontFamily.regular,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
  card: {
    // flexGrow: 1,
    borderWidth: (1 / 360) * w,
    borderColor: '#A8C3EC',
    borderRadius: (6 / 360) * w,
    paddingHorizontal: (20 / 360) * w,
    paddingVertical: (10 / 360) * w,
    marginBottom: (10 / 360) * w,
  },
  cardName: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    marginBottom: (4 / 360) * w,
    color: theme.primary,
  },
  cardNumber: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    marginBottom: (4 / 360) * w,
    color: theme.primary,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: (10 / 360) * w,
    marginBottom: (10 / 360) * w,
  },
  totalText: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
  secure: {
    width: `${100 / 6.2}%`,
    height: 45,
  },
});
