import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {useContext} from 'react';
// import {useTranslation} from 'react-i18next';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
// import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Address, Order, ShipmentType} from '../../types';
import {theme} from '../../UI/theme';
import Step1 from './Step1';
import Step2 from './Step2';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';
import api from '../../helpers/api';

const w = Dimensions.get('window').width;

export interface StepProps {
  // successCallback: () => void;
  step?: number;
}

const Checkout = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const {
    params: {bonus},
  } = useRoute<{
    params: {bonus: number};
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const navigation = useNavigation();

  //
  const [step, setStep] = useState(1);
  // @ts-ignore
  const [order, setOrder] = useState<Order>({
    id: 0,
    products: storeUser.cart,
    bundles: storeUser.bundlesInCart,
    address_id: 0,
    shipment_type: ShipmentType.NO_SHIPMENT,
    bonus,
  });

  console.log('========>>>>>>>>>>>>>>', order);

  //
  useEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
    analytics().logEvent('FIB_Start_checkout', {});
    AppEventsLogger.logEvent('fb_Start_checkout');
    appsFlyer.logEvent('af_Start_checkout', {});
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.stepsBlock}>
        {['Shipping details', 'Payment'].map((title, s) => (
          <>
            <View
              style={{
                position: 'relative',
                flex: 1,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.title,
                  color: step === s + 1 ? theme.primary : theme.grey,
                  fontSize: (14 / 360) * w,
                }}>
                {title}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: (2 / 360) * w,
                  backgroundColor: step > s ? '#00876E' : theme.bluelight,
                  marginTop: 10,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -3,
                  width: (8 / 360) * w,
                  height: (8 / 360) * w,
                  borderRadius: (4 / 360) * w,
                  backgroundColor: step > s ? '#00876E' : theme.bluelight,
                }}
              />
            </View>
          </>
        ))}
      </View>
      {step === 1 && (
        <Step1
          setStep={setStep}
          address_id={order.address_id}
          setOrder={setOrder}
          shipment_type={order.shipment_type}
        />
      )}
      {step === 2 && <Step2 order={order} />}
    </View>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    marginTop: (12 / 360) * w,
    // padding: (24 / 360) * w,
  },
  stepsBlock: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: (24 / 360) * w,
    // marginBottom: (20 / 360) * w,
  },
});
