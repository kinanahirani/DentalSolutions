import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Button from '../../UI/Button';
import {Address} from '../../types';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const ShippingDetails = () => {
  //
  const storeUser = useContext(UserStore);

  //
  const navigation = useNavigation();

  //
  const {t, i18n} = useTranslation();

  //
  const [addresses, setAddresses] = useState<Address[]>([]);

  //
  const getAddresses = async () => {
    const resp: {data: Address[]} = await api(
      'addresses',
      'GET',
      {},
      storeUser.token,
    );
    setAddresses(resp.data);
  };

  //
  useEffect(() => {
    getAddresses();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Button
              icon={require('../../UI/images/plus.png')}
              color="grey"
              size="medium"
              onPress={() => {
                navigation.navigate('AddNewAddress', {
                  callback: (newAddress: Address) =>
                    setAddresses(state => [newAddress, ...state]),
                });
              }}
            />
          </View>
        );
      },
    });
  }, []);

  return (
    <View style={[theme.wrapper, {padding: 0}]}>
      <ScrollView style={{padding: (24 / 360) * w}}>
        <Title
          label={t('Shipping details')}
          size="large"
          style={{marginBottom: (20 / 360) * w}}
        />

        {addresses.map(address => (
          <View style={styles.addressCard}>
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
              <Button
                label="Change"
                size="small"
                labelSize="small"
                color="grey"
                onPress={() => {
                  navigation.navigate('AddNewAddress', {
                    editableAddress: address,
                    callback: (newAddress: Address) => {
                      if (newAddress.status === 10) {
                        setAddresses(state =>
                          state.map(a =>
                            a.id === newAddress.id ? newAddress : a,
                          ),
                        );
                      } else {
                        setAddresses(state =>
                          state.filter(a => a.id !== newAddress.id),
                        );
                      }
                    },
                  });
                }}
              />
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
              {address.zip} {address.city}, {address.state}, {address.country}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ShippingDetails;

const styles = StyleSheet.create({
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
    flex: 1,
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
