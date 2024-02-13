import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import {theme} from '../theme';
import Button from '../Button';

const w = Dimensions.get('screen').width;

const CheckUpdate = () => {
  //
  const {t} = useTranslation();
  //
  const [url, setUrl] = useState<string | null>(null);

  //

  //
  const checkUpdate = async () => {
    try {
      const versionData = await VersionCheck.needUpdate({
        depth: 2,
      });

      const currentVersion = +versionData.currentVersion.split('.').join('');
      const latestVersion = +versionData.latestVersion.split('.').join('');

      if (currentVersion < latestVersion) {
        setUrl(versionData.storeUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkUpdate();
  }, []);

  return (
    <Modal visible={!!url} transparent={true}>
      <View style={styles.modalOverlay} />
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.carouselDesc}>
            {t('The application is outdated. Please update')}
          </Text>
          {/* <TouchableOpacity
            style={styles.btnsUpdate}
            onPress={() => {
              if (url) {
                Linking.openURL(url);
              }
            }}>
            <Text style={styles.btnUpdateText}>{t('Update')}</Text>
          </TouchableOpacity> */}
          <View>
            <Button
              block
              label={t('Update')}
              color="primary"
              type="circle"
              onPress={() => {
                if (url) {
                  Linking.openURL(url);
                }
              }}
              style={{marginTop: 20}}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CheckUpdate;

const styles = StyleSheet.create({
  modalCenteredView: {
    top: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: (16 / 360) * w,
  },
  modalView: {
    position: 'relative',
    backgroundColor: theme.white,
    borderRadius: 8,
    width: '100%',
    padding: (24 / 360) * w,
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  btnsUpdate: {
    backgroundColor: theme.white,
    borderColor: theme.blue,
    borderWidth: 1,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    marginTop: 40,
  },
  btnUpdateText: {
    fontSize: (14 / 360) * w,
    lineHeight: (24 / 360) * w,
    letterSpacing: -0.3,
    color: theme.blue,
    textAlign: 'center',
  },
  carouselDesc: {
    fontSize: (14 / 360) * w,
    lineHeight: (24 / 360) * w,
    letterSpacing: -0.3,
    color: theme.primary,
    textAlign: 'center',
    opacity: 0.7,
  },
});
