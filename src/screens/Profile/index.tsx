import React, {useContext, useState} from 'react';
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
import UserStore from '../../store/UserStore';
import {ErrorType, User} from '../../types';
import api from '../../helpers/api';
import CommonStore from '../../store/CommonStore';
import Dropbox from '../../UI/Dropbox';
import FastImage from 'react-native-fast-image';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';

const w = Dimensions.get('screen').width;

interface UserAnswer extends User {
  error: ErrorType[];
}

const Profile = () => {
  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const {t} = useTranslation();

  //
  const {reset} = useNavigation();

  //
  const [user, setUser] = useState<User>(
    JSON.parse(JSON.stringify(storeUser.user)),
  );

  const [type, setType] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //
  const saveProfile = async () => {
    if (oldPassword && newPassword) {
      if (newPassword !== resetPassword) {
        Alert.alert('', "Passwords doesn't match");
        return;
      }
    }

    storeCommon.setLoading(true);

    const resp: UserAnswer = await api(
      'account',
      'PUT',
      {
        ...user,
        password: oldPassword,
        new_password: newPassword,
      },
      storeUser.token,
    );

    storeCommon.setLoading(false);

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    console.log('resp ==>> ', resp);
    storeUser.setUser(resp);
    Alert.alert('', 'Profile saved successfull');
  };

  //
  const deleteAccount = async () => {
    storeCommon.setLoading(true);

    const resp: UserAnswer = await api(
      'account',
      'DELETE',
      {},
      storeUser.token,
    );

    storeCommon.setLoading(false);

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    setShowDeleteModal(false);

    storeUser.setToken(null);
    storeUser.setUser(null);
    storeUser.setCart([]);
    GoogleSignin.signOut();

    reset({
      index: 0,
      routes: [{name: 'Welcome'}],
    });
  };

  return (
    <>
      <ScrollView>
        <View style={[theme.wrapper]}>
          <Title
            label={t('Profile')}
            size="large"
            style={{marginBottom: (20 / 360) * w}}
          />
          <Input
            label={t('E-mail')}
            value={user.email}
            onChangeText={email => setUser(u => ({...u, email}))}
          />
          <Dropbox value={user.type.toString()} />
          <Input
            label={t('First Name*')}
            value={user.fname}
            onChangeText={fname => setUser(u => ({...u, fname}))}
          />
          <Input
            label={t('Last Name*')}
            value={user.lname}
            onChangeText={lname => setUser(u => ({...u, lname}))}
          />
          {(user.facebook_id || user.apple_id || user.google_id) && (
            <>
              <Title
                label={t('Profile Connections')}
                style={{
                  fontSize: (14 / 360) * w,
                  lineHeight: (20 / 360) * w,
                  fontFamily: theme.fontFamily.regular,
                  marginBottom: (20 / 360) * w,
                  width: '100%',
                }}
              />
              {[
                {
                  option: 'facebook',
                  value: user.facebook_id,
                },
                {
                  option: 'apple',
                  value: user.apple_id,
                },
                {
                  option: 'google',
                  value: user.google_id,
                },
              ]
                .filter(s => s.value)
                .map(soc => (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: (33 / 360) * w,
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <FastImage
                        source={
                          soc.option === 'google'
                            ? require('../../UI/images/google.png')
                            : soc.option === 'apple'
                            ? require('../../UI/images/appleID.png')
                            : require('../../UI/images/facebook.png')
                        }
                        resizeMode="contain"
                        style={{
                          width: (36 / 360) * w,
                          height: (36 / 360) * w,
                          marginEnd: (15 / 360) * w,
                        }}
                      />

                      <Text style={styles.connections}>
                        {t(
                          soc.option === 'google'
                            ? 'Google'
                            : soc.option === 'apple'
                            ? 'AppleID'
                            : 'Facebook',
                        )}
                      </Text>
                    </View>
                    <Button
                      label={t('Disconnect')}
                      size="small"
                      labelSize="small"
                      color="grey"
                      redButton
                      onPress={() =>
                        setUser(state => ({
                          ...state,
                          [soc.option + '_id']: null,
                        }))
                      }
                    />
                  </View>
                ))}
            </>
          )}

          <View style={{marginBottom: (30 / 360) * w}}>
            <Title
              label={t('Change password')}
              style={{
                fontSize: (14 / 360) * w,
                lineHeight: (20 / 360) * w,
                fontFamily: theme.fontFamily.regular,
                marginBottom: (20 / 360) * w,
                width: '100%',
              }}
            />
            <Input
              label={t('Old password')}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <Input
              label={t('New password')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Input
              label={t('Reset password')}
              value={resetPassword}
              onChangeText={setResetPassword}
              secureTextEntry
            />
          </View>
          <Button
            label="Save"
            size="large"
            color="primary"
            type="circle"
            style={{marginBottom: (50 / 360) * w}}
            onPress={saveProfile}
          />

          <Button
            label="Delete account"
            size="large"
            color="red"
            type="circle"
            style={{marginBottom: (50 / 360) * w, backgroundColor: 'red'}}
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
        }}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalWrapper}
            onPress={() => {
              setShowDeleteModal(false);
            }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {
                  'Your account will be removed immediately.\n\n\nAre you sure you want to delete your account?'
                }
              </Text>
              <View style={styles.modalBtnsCont}>
                <Button
                  type="circle"
                  label={t('No')}
                  color="primary"
                  style={{marginBottom: 40}}
                  onPress={() => setShowDeleteModal(false)}
                />
                <Button
                  type="circle"
                  label={t('Yes, delete account')}
                  color="red"
                  onPress={deleteAccount}
                />
                <View style={{height: 40}} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default Profile;

const styles = StyleSheet.create({
  connections: {
    fontFamily: theme.fontFamily.SFProTextBold,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
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
    // height: (340 / 360) * w,
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
