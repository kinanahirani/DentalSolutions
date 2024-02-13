import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
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
import {RadioButton} from 'react-native-paper';
import ShippingSpeed from '../../UI/ShippingSpeed';
import {useNavigation} from '@react-navigation/native';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Address, Order, Shipment, ShipmentType} from '../../types';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('window').width;

const Step1 = ({
  setStep,
  address_id,
  setOrder,
  order,
  shipment_type,
}: {
  setStep: Dispatch<SetStateAction<number>>;
  address_id: number;
  setOrder: Dispatch<SetStateAction<Order>>;
  shipment_type: ShipmentType;
  order: Order;
}) => {
  //
  const storeUser = useContext(UserStore);

  //
  const {navigate} = useNavigation();

  //
  const {t, i18n} = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  //
  const getAddresses = async () => {
    const resp: {data: Address[]} = await api(
      'addresses',
      'GET',
      {},
      storeUser.token,
    );
    if (storeUser.user) {
      setAddresses(resp.data);
    } else {
      setOrder(order => ({
        ...order,
        address_id: resp.data[0].id,
        address: resp.data[0],
      }));
    }
  };
  //
  const getShipments = async () => {
    const resp: {data: any} = await api(
      'shipments',
      'GET',
      {},
      storeUser.token,
    );
    setShipments(resp.data);
  };

  //
  useEffect(() => {
    if (storeUser.user) {
      getAddresses();
    }
    getShipments();
  }, []);

  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        paddingVertical: (24 / 360) * w,
        flexGrow: 1,
        paddingTop: 0,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: (20 / 360) * w,
          paddingHorizontal: (24 / 360) * w,
        }}>
        <Text style={styles.infoTitle}>
          {addresses.length > 0 ? t('Saved Address') : ' '}
        </Text>
        <Button
          label={t('+Add New Address')}
          type="circle"
          color="primarydark"
          invert
          style={{
            backgroundColor: 'rgba(43, 76, 118, 0.05)',
            paddingHorizontal: 20,
          }}
          size="medium"
          labelSize="large"
          onPress={() => {
            navigate('AddNewAddress', {
              callback: (newAddress: Address) => {
                setAddresses(state => [newAddress, ...state]);
                if (storeUser.user) {
                  setOrder(order => ({...order, address_id: newAddress.id}));
                } else {
                  setOrder(order => ({
                    ...order,
                    address_id: newAddress.id,
                    address: newAddress,
                  }));
                }
              },
            });
          }}
        />
      </View>
      <View style={{flex: 1, paddingHorizontal: (24 / 360) * w}}>
        {addresses.map(address => (
          <TouchableOpacity
            style={[
              styles.addressCard,
              {
                backgroundColor:
                  address_id === address.id ? theme.bluelight : theme.white,
              },
            ]}
            onPress={() =>
              setOrder(order => ({
                ...order,
                address_id: address.id,
                address: address,
              }))
            }>
            <View style={styles.addressType}>
              <FastImage
                source={
                  address.title.includes('Home')
                    ? require('../../UI/images/home_address.png')
                    : require('../../UI/images/office_address.png')
                }
                // source={require('../../UI/images/office_blue.png')}
                resizeMode="contain"
                style={{
                  width: (20 / 360) * w,
                  height: (20 / 360) * w,
                  marginEnd: (10 / 360) * w,
                }}
              />
              <Text style={styles.addressTypeLabel}>{address.title}</Text>
            </View>
            <Text style={styles.addressName}>
              {address.fname} {address.lname}
            </Text>
            <Text style={[styles.addressInfo, {marginBottom: (10 / 360) * w}]}>
              {address.phone}
            </Text>
            <Text style={styles.addressInfo}>
              {address.house} {address.street}
              {'\n'}
              {address.zip} {address.city}, {address.state}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!address_id && !!shipments && shipments.length > 0 && (
        <ShippingSpeed
          orderTotal={
            storeUser.cart.reduce((a, b) => a + b.price * b.quantity, 0) +
            storeUser.bundlesInCart.reduce(
              (a, b) => a + b.price * b.quantity,
              0,
            )
          }
          setOrder={setOrder}
          shipment_type={shipment_type}
          shipments={shipments}
        />
      )}
      <Button
        type="circle"
        color="primary"
        label={t('Confirm')}
        style={{marginHorizontal: (24 / 360) * w}}
        onPress={() => {
          if (!address_id && !order?.address) {
            Alert.alert(
              t('Error'),
              'Choose your delivery address and shipping speed',
            );
          } else if (address_id && !shipment_type) {
            Alert.alert(t('Error'), 'Choose your shipping speed');
          } else {
            setStep(step => step + 1);
          }
        }}
      />
    </ScrollView>
  );
};

export default Step1;

const styles = StyleSheet.create({
  infoTitle: {
    flex: 1,
    fontFamily: theme.fontFamily.regular,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.primary,
  },
  addressCard: {
    borderWidth: (1 / 360) * w,
    borderColor: theme.blue,
    borderRadius: (6 / 360) * w,
    paddingHorizontal: (20 / 360) * w,
    paddingVertical: (10 / 360) * w,
    marginBottom: (10 / 360) * w,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: (10 / 360) * w,
  },
  addressTypeLabel: {
    fontFamily: theme.fontFamily.SFProDisplayBold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  addressName: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (10 / 360) * w,
  },
  addressInfo: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
});
