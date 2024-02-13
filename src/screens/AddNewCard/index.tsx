import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Dimensions, Switch, Text, View} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
import {Card, ResponseMessages} from '../../types';
import api from '../../helpers/api';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';

const w = Dimensions.get('screen').width;

const AddNewCard = () => {
  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const navigation = useNavigation();
  //
  const {t} = useTranslation();
  //
  const {
    params: {callback},
  } = useRoute<{
    params: {
      callback: (card: Card) => void;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const validateInputs = () => {
    let isValid = true;

    if (!cardNumber) {
      Alert.alert('Validation Error', 'Card number is required');
      isValid = false;
    } else if (!cardName) {
      Alert.alert('Validation Error', 'Name is required');
      isValid = false;
    } else if (!cardDate) {
      Alert.alert('Validation Error', 'Expiration date is required');
      isValid = false;
    } else {
      isValid = true;
    }
    return isValid;
  };

  //paymentFunction with payplus
  const paymentFunction = async () => {
    if (!validateInputs()) {
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
    storeCommon.setLoading(true);

    const resp: {data: Card[]} = await api(
      'payment/create-credit-card-token',
      'POST',
      {
        credit_card_number: cardNumber,
        card_holder_name: cardName,
        card_date_mmyy: cardDate,
        primary: isEnabled ? 1 : 0,
      },
      storeUser.token,
    );
    console.log('addcardRespone>>>', resp);

    analytics().logEvent('FIB_Add_credit_card', {});
    AppEventsLogger.logEvent('fb_Add_credit_card');
    appsFlyer.logEvent('af_Add_credit_card', {});

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      storeCommon.setLoading(false);
      return;
    }

    callback(resp);
    navigation.goBack();

    storeCommon.setLoading(false);
  };
  //paymentFunction with REAL tranzilla credits
  // const paymentFunction = async () => {
  //   const serialize = (obj: any, prefix: any = undefined): string => {
  //     var str = [],
  //       p;
  //     for (p in obj) {
  //       if (obj.hasOwnProperty(p)) {
  //         var k = prefix ? prefix + '[' + p + ']' : p,
  //           v = obj[p];
  //         str.push(
  //           v !== null && typeof v === 'object'
  //             ? serialize(v, k)
  //             : encodeURIComponent(k) + '=' + encodeURIComponent(v),
  //         );
  //       }
  //     }
  //     return str.join('&');
  //   };

  //   const fetchObj: RequestInit = {
  //     method: 'POST',
  //     headers: new Headers({
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     }),
  //   };

  //   // create token
  //   let body: Object = {
  //     supplier: 'protech', // 'terminal_name' should be replaced by actual terminal name
  //     // supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     ccno: cardNumber.replace(/\s/g, ''), // Test card number
  //     TranzilaPW: 'aB2MSrGL',
  //     // TranzilaPW: 'shtibeltest',
  //     TranzilaTK: '1',
  //   };

  //   // body: Object = {
  //   //   supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //   //   tranmode: 'A',
  //   //   ccno: cardNumber.replace(/\s/g, ''), // Test card number
  //   //   expdate: cardDate.replace('/', ''), // Card expiry date: mmyy
  //   //   sum: '0.10',
  //   //   currency: '2', // ILS
  //   //   cred_type: '1',
  //   //   mycvv: cardCVV,
  //   //   TranzilaPW: 'shtibeltest',
  //   //   TranzilaTK: '1',
  //   // };

  //   // fetchObj.body = serialize(body);
  //   // console.log('fetchObj', fetchObj);

  //   storeCommon.setLoading(true);
  //   let response: any = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   let html = await response.text();
  //   console.log('HTML', html);

  //   let object: {[key: string]: string} = html
  //     .split('&')
  //     .reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});

  //   if (!object?.TranzilaTK?.trim()) {
  //     storeCommon.setLoading(false);
  //     Alert.alert(t('Payment failed'), 'Credit card number invalid');
  //     return;
  //   }

  //   const TranzilaTK = object.TranzilaTK.trim();

  //   // charge with token
  //   body = {
  //     supplier: 'protech', // 'terminal_name' should be replaced by actual terminal name
  //     // supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     // tranmode: 'A',
  //     tranmode: 'V',
  //     TranzilaTK,
  //     expdate: cardDate.replace('/', ''), // Card expiry date: mmyy
  //     sum: '0.1',
  //     currency: '2', // USD
  //     // currency: '1', // ILS
  //     cred_type: '1',
  //     mycvv: cardCVV,
  //     TranzilaPW: 'aB2MSrGL',
  //     // TranzilaPW: 'shtibeltest',
  //   };

  //   response = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   html = await response.text();
  //   object = html.split('&').reduce((obj: any, key: string) => {
  //     const [subkey1, subkey2] = key.split('=');
  //     obj[subkey1] = subkey2;
  //     return obj;
  //   }, {});

  //   if (object.Response !== '000') {
  //     Alert.alert(t('Payment failed'), ResponseMessages[object.Response]);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   console.log('objectobjectobjectobject===>>>>', object);

  //   // const tranmode = 'D' + object.index;
  //   const tranmode = 'W';
  //   const authnr = object.ConfirmationCode;

  //   // cancelation with token
  //   body = {
  //     supplier: 'protech', // 'terminal_name' should be replaced by actual terminal name
  //     // supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     tranmode,
  //     authnr,
  //     TranzilaTK,
  //     currency: '2', // USD
  //     // CreditPass: '09agRrcY',
  //     TranzilaPW: 'aB2MSrGL',
  //     // TranzilaPW: 'shtibeltest',
  //     sum: '0.1',
  //     // CreditPass: 'hFc9punz',
  //     index: object.index,
  //     expdate: cardDate.replace('/', ''),
  //   };

  //   response = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   html = await response.text();
  //   const cancel: {[key: string]: string} = html
  //     .split('&')
  //     .reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});
  //   console.log('cancel', cancel);

  //   if (cancel.Response !== '000') {
  //     Alert.alert(t('Payment failed'), ResponseMessages[cancel.Response]);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   // send CreditCard data to the server
  //   const resp = await api(
  //     'ccards',
  //     'POST',
  //     {
  //       TranzilaTK,
  //       cardtype: object.cardtype,
  //       last: cardNumber
  //         .replace(/\s/g, '')
  //         .substring(cardNumber.replace(/\s/g, '').length - 5, 4),
  //       expdate: object.expdate,
  //       cvv: cardCVV,
  //       primary: isEnabled ? 1 : 0,
  //     },
  //     storeUser.token,
  //   );

  //   analytics().logEvent('FIB_Add_credit_card', {});
  //   AppEventsLogger.logEvent('fb_Add_credit_card');
  //   appsFlyer.logEvent('af_Add_credit_card', {});

  //   if (resp.error) {
  //     Alert.alert('Error', resp.error[0].message);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   callback(resp);
  //   navigation.goBack();

  //   storeCommon.setLoading(false);
  // };

  //paymentFunction with TEST tranzilla credits
  // const paymentFunction = async () => {
  //   const serialize = (obj: any, prefix: any = undefined): string => {
  //     var str = [],
  //       p;
  //     for (p in obj) {
  //       if (obj.hasOwnProperty(p)) {
  //         var k = prefix ? prefix + '[' + p + ']' : p,
  //           v = obj[p];
  //         str.push(
  //           v !== null && typeof v === 'object'
  //             ? serialize(v, k)
  //             : encodeURIComponent(k) + '=' + encodeURIComponent(v),
  //         );
  //       }
  //     }
  //     return str.join('&');
  //   };

  //   const fetchObj: RequestInit = {
  //     method: 'POST',
  //     headers: new Headers({
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     }),
  //   };

  //   // create token
  //   let body: Object = {
  //     supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     ccno: cardNumber.replace(/\s/g, ''), // Test card number
  //     TranzilaPW: 'shtibeltest',
  //     TranzilaTK: '1',
  //   };

  //   storeCommon.setLoading(true);
  //   let response: any = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   let html = await response.text();
  //   let object: {[key: string]: string} = html
  //     .split('&')
  //     .reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});
  //   console.log('TranzilaTK', object.TranzilaTK.trim());

  //   if (!object.TranzilaTK.trim()) {
  //     storeCommon.setLoading(false);
  //     Alert.alert(t('Payment failed'), 'Credit card number invalid');
  //     return;
  //   }

  //   const TranzilaTK = object.TranzilaTK.trim();

  //   // charge with token
  //   body = {
  //     supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     tranmode: 'A',
  //     TranzilaTK,
  //     expdate: cardDate.replace('/', ''), // Card expiry date: mmyy
  //     sum: '1',
  //     currency: '1', // ILS
  //     cred_type: '1',
  //     mycvv: cardCVV,
  //     TranzilaPW: 'shtibeltest',
  //   };

  //   response = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   html = await response.text();
  //   object = html.split('&').reduce((obj: any, key: string) => {
  //     const [subkey1, subkey2] = key.split('=');
  //     obj[subkey1] = subkey2;
  //     return obj;
  //   }, {});
  //   console.log('object', object);

  //   if (object.Response !== '000') {
  //     Alert.alert(t('Payment failed'), ResponseMessages[object.Response]);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   const tranmode = 'D' + object.index;
  //   const authnr = object.ConfirmationCode;

  //   // cancelation with token
  //   body = {
  //     supplier: 'shtibeltest', // 'terminal_name' should be replaced by actual terminal name
  //     tranmode,
  //     authnr,
  //     TranzilaTK,
  //     CreditPass: 'hFc9punz',
  //     TranzilaPW: 'shtibeltest',
  //   };

  //   response = await fetch(
  //     'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
  //     {
  //       ...fetchObj,
  //       body: serialize(body),
  //     },
  //   );

  //   html = await response.text();
  //   const cancel: {[key: string]: string} = html
  //     .split('&')
  //     .reduce((obj: any, key: string) => {
  //       const [subkey1, subkey2] = key.split('=');
  //       obj[subkey1] = subkey2;
  //       return obj;
  //     }, {});
  //   console.log('cancel', cancel);

  //   if (cancel.Response !== '000') {
  //     Alert.alert(t('Payment failed'), ResponseMessages[cancel.Response]);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   // send CreditCard data to the server
  //   const resp = await api(
  //     'ccards',
  //     'POST',
  //     {
  //       TranzilaTK,
  //       cardtype: object.cardtype,
  //       last: cardNumber
  //         .replace(/\s/g, '')
  //         .substring(cardNumber.replace(/\s/g, '').length - 5, 4),
  //       expdate: object.expdate,
  //       cvv: cardCVV,
  //       primary: isEnabled ? 1 : 0,
  //     },
  //     storeUser.token,
  //   );

  //   console.log('resp', resp);

  //   if (resp.error) {
  //     Alert.alert('Error', resp.error[0].message);
  //     storeCommon.setLoading(false);
  //     return;
  //   }

  //   navigation.goBack();

  //   storeCommon.setLoading(false);
  // };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
  }, []);

  return (
    <View style={theme.wrapper}>
      <Title
        label={t('Add card')}
        size="large"
        style={{marginBottom: (20 / 360) * w}}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        <Input
          label={t('Number')}
          value={cardNumber}
          onChangeText={e => setCardNumber(e.replace(/\s+/g, ''))}
          // onChangeText={e => setCardNumber(e)}
          mask={'[0000] [0000] [0000] [0000] [000]'}
          keyboardType={'numeric'}
        />
        <Input label={t('Name')} value={cardName} onChangeText={setCardName} />
        <Input
          label={t('MM/YY')}
          value={cardDate}
          // onChangeText={e => setCardDate(e.replace('/', ''))}
          onChangeText={e => setCardDate(e)}
          mask={'[00]{/}[00]'}
          style={{maxWidth: (150 / 360) * w}}
          keyboardType={'numeric'}
        />
        {/* <Input
          label={t('CVV')}
          value={cardCVV}
          onChangeText={setCardCVV}
          mask={'[0000]'}
          style={{maxWidth: (150 / 360) * w}}
          keyboardType={'numeric'}
        /> */}
        {storeUser.user && (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: theme.fontFamily.SFProTextBold,
                fontSize: (12 / 360) * w,
                lineHeight: (16 / 360) * w,
                color: theme.bluedark,
              }}>
              {t('Make Card Primary')}
            </Text>
            <Switch
              trackColor={{false: theme.grey, true: theme.green}}
              // thumbColor={isEnabled ? theme.primary : theme.white}
              thumbColor={theme.white}
              ios_backgroundColor="#EBEBEB"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        )}
      </View>
      <Button
        label="Save"
        size="large"
        color="primary"
        type="circle"
        onPress={paymentFunction}
      />
    </View>
  );
};

export default AddNewCard;
