import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import {Address, ErrorType} from '../../types';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {useHeaderHeight} from '@react-navigation/elements';
import Dropbox from '../../UI/Dropbox';
import FastImage from 'react-native-fast-image';

interface AddressResponce extends Address {
  error: ErrorType[];
}

const w = Dimensions.get('screen').width;

const emptyAddress: Address = {
  id: 0,
  title: '',
  fname: '',
  lname: '',
  city: '',
  street: '',
  house: '',
  appartment: '',
  state: '',
  country: '',
  zip: '',
  phone: '',
};

const availableItems = [
  {label: 'Home Address', value: 'Home Address'},
  {label: 'Office Address', value: 'Office Address'},
];

const AddNewAddress = () => {
  //
  const {
    params: {callback, editableAddress},
  } = useRoute<{
    params: {
      editableAddress?: Address;
      callback: (address: Address) => void;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const storeUser = useContext(UserStore);

  //
  const navigation = useNavigation();

  //
  const {t, i18n} = useTranslation();

  //
  const headerHeight = useHeaderHeight();

  //
  const [address, setAddress] = useState<Address>(
    editableAddress || emptyAddress,
  );
  const [modalVisible, setModalVisible] = useState(false);

  //
  const saveAddress = async () => {
    const resp: AddressResponce = await api(
      address.id ? `addresses/${address.id}` : 'addresses',
      address.id ? 'PUT' : 'POST',
      address,
      storeUser.token,
    );

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    callback(resp);
    navigation.goBack();
  };
  //
  const deleteAddress = async () => {
    const resp: AddressResponce = await api(
      `addresses/${address.id}`,
      'PUT',
      {
        status: 0,
      },
      storeUser.token,
    );

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    callback(resp);
    setModalVisible(false);
    navigation.goBack();
  };

  //
  useEffect(() => {
    navigation.setOptions({
      headerRight: editableAddress?.id
        ? () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  // deleteAddress()
                  setModalVisible(true);
                }}>
                <FastImage
                  style={{width: 24, height: 24}}
                  source={require('../../UI/images/trash_red.png')}
                />
              </TouchableOpacity>
            );
          }
        : false,
    });
  }, []);

  return (
    <>
      <View
        style={{
          height: headerHeight,
        }}
      />
      <View style={[theme.wrapper, {padding: 0, flex: 1}]}>
        <ScrollView
          contentContainerStyle={{padding: (24 / 360) * w}}
          keyboardShouldPersistTaps="always">
          <Title
            label={t('Add new address')}
            size="large"
            style={{marginBottom: (20 / 360) * w}}
          />
          {storeUser.user ? (
            <Dropbox
              items={availableItems}
              value={address.title}
              setValue={title => setAddress(a => ({...a, title}))}
            />
          ) : (
            <Input
              keyboardType="email-address"
              label={t('Email*')}
              value={address.email || ''}
              onChangeText={email => setAddress(a => ({...a, email}))}
            />
          )}
          <Input
            label={t('First Name*')}
            value={address.fname}
            onChangeText={fname => setAddress(a => ({...a, fname}))}
          />
          <Input
            label={t('Last Name*')}
            value={address.lname}
            onChangeText={lname => setAddress(a => ({...a, lname}))}
          />
          <Input
            label={t('Street Name*')}
            value={address.street}
            onChangeText={street => setAddress(a => ({...a, street}))}
          />
          <Input
            label={t('House / Apartment number *')}
            value={address.house}
            onChangeText={house => setAddress(a => ({...a, house}))}
          />
          <Input
            label={t('City *')}
            value={address.city}
            onChangeText={city => setAddress(a => ({...a, city}))}
          />
          <Input
            label={t('State / Province *')}
            value={address.state}
            onChangeText={state => setAddress(a => ({...a, state}))}
          />
          <Input
            label={t('Country *')}
            value={address.country}
            onChangeText={country => setAddress(a => ({...a, country}))}
          />
          <Input
            label={t('Zip-code *')}
            value={address.zip}
            onChangeText={zip => setAddress(a => ({...a, zip}))}
            keyboardType={'default'}
          />
          <Input
            label={t('Phone number *')}
            value={address.phone}
            onChangeText={phone => setAddress(a => ({...a, phone}))}
            keyboardType={'phone-pad'}
          />
          <Button
            label="Save"
            size="large"
            color="primary"
            type="circle"
            // style={{marginBottom: (50 / 360) * w}}
            onPress={saveAddress}
          />
        </ScrollView>
      </View>
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
                {t(
                  'Are you sure you want to delete this address?\n\nThis action can not be rolled back',
                )}
              </Text>
              <View style={styles.modalBtnsCont}>
                <View style={{flex: 1}}>
                  <Button
                    block
                    type="circle"
                    label={t('Yes')}
                    color="primary"
                    style={{marginBottom: 10}}
                    onPress={deleteAddress}
                  />
                </View>
                <View style={{width: 20}} />
                <View style={{flex: 1}}>
                  <Button
                    block
                    invert
                    border
                    type="circle"
                    label={t('No')}
                    color="white"
                    onPress={() => {
                      setModalVisible(false);
                    }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default AddNewAddress;

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: (32 / 360) * w,
    width: '100%',
  },
});
