import React, {useContext, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {theme} from '../theme';
import {useTranslation} from 'react-i18next';
import ModalPopup from '../ModalPopup';
import Button from '../Button';
import CommonStore from '../../store/CommonStore';
import {check, request, PERMISSIONS} from 'react-native-permissions';
import FastImage from 'react-native-fast-image';

// import ImagePicker from 'react-native-image-picker';
// import ImageResizer from 'react-native-image-resizer';
// import ImgToBase64 from 'react-native-image-base64';
// import {IMAGE_URL} from '../../helpers/API';
// import TitleMedium from '../TitleMedium';

const w = Dimensions.get('screen').width;

interface ImageUploaderProps {
  value: string[];
  setValue: (value: string[]) => void;
  max?: number;
  title?: string;
}

const ImageUploader = ({
  value,
  setValue,
  max = 1,
  title,
}: ImageUploaderProps) => {
  //
  const storeCommon = useContext(CommonStore);
  //
  const {t} = useTranslation();

  //
  const [modalVisible, setModalVisible] = useState(false);
  //
  const vatPhotoHandler = (response: ImagePickerResponse) => {
    if (response.assets) {
      // setValue('data:image/png;base64,' + response.assets[0].base64);
      setValue(
        max === 1
          ? ['data:image/png;base64,' + response.assets[0].base64]
          : [
              ...value,
              ...response.assets.map(
                asset => 'data:image/png;base64,' + asset.base64,
              ),
            ],
      );
    }
  };

  return (
    <>
      <View style={styles.inputWrap}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.upload}>
            <Text style={styles.uploadText}>{title}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.uploadImagesView}
          onPress={() => setModalVisible(true)}>
          {value.map((item, index) => (
            <View style={styles.uploadView} key={`image-${index}`}>
              <FastImage
                style={styles.uploadFileImage}
                source={{
                  uri:
                    item.slice(0, 4) === 'data' ? item : /*IMAGE_URL + */ item,
                }}
              />
            </View>
          ))}
        </TouchableOpacity>
      </View>
      <ModalPopup visible={modalVisible} onClose={() => setModalVisible(false)}>
        <>
          <TouchableOpacity
            onPress={async () => {
              setModalVisible(false);
              try {
                const checked = await check(
                  Platform.select({
                    android: PERMISSIONS.ANDROID.CAMERA,
                    ios: PERMISSIONS.IOS.CAMERA,
                    default: PERMISSIONS.IOS.CAMERA,
                  }),
                );
                if (checked === 'granted') {
                  launchCamera(
                    {
                      mediaType: 'photo',
                      maxWidth: 1600,
                      maxHeight: 800,
                      includeBase64: true,
                      saveToPhotos: false,
                    },
                    vatPhotoHandler,
                  );
                } else {
                  const grants = await request(
                    Platform.select({
                      android: PERMISSIONS.ANDROID.CAMERA,
                      ios: PERMISSIONS.IOS.CAMERA,
                      default: PERMISSIONS.IOS.CAMERA,
                    }),
                  );
                  if (grants === 'granted') {
                    launchCamera(
                      {
                        mediaType: 'photo',
                        maxWidth: 1600,
                        maxHeight: 800,
                        includeBase64: true,
                        saveToPhotos: false,
                      },
                      vatPhotoHandler,
                    );
                  } else {
                    storeCommon.setAlert({
                      type: 'Info',
                      dscr: 'Camera access denied',
                    });
                  }
                }
              } catch (err) {
                console.warn(err);
              }
            }}
            style={[
              styles.viewWrapBorder,
              {
                borderBottomColor: theme.white,
              },
            ]}>
            <Text
              style={[
                styles.menuText,
                {
                  color: theme.white,
                },
              ]}>
              {t('Launch camera') + '...'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setModalVisible(false);
              try {
                const checked = await check(
                  Platform.select({
                    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
                    default: PERMISSIONS.IOS.PHOTO_LIBRARY,
                  }),
                );

                if (checked === 'granted') {
                  launchImageLibrary(
                    {
                      mediaType: 'photo',
                      maxWidth: 1600,
                      maxHeight: 800,
                      includeBase64: true,
                    },
                    vatPhotoHandler,
                  );
                } else {
                  const grants = await request(
                    Platform.select({
                      android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
                      default: PERMISSIONS.IOS.PHOTO_LIBRARY,
                    }),
                  );
                  if (grants === 'granted') {
                    launchImageLibrary(
                      {
                        mediaType: 'photo',
                        maxWidth: 1600,
                        maxHeight: 800,
                        includeBase64: true,
                      },
                      vatPhotoHandler,
                    );
                  } else {
                    storeCommon.setAlert({
                      type: 'Info',
                      dscr: 'Camera access denied',
                    });
                  }
                }
              } catch (err) {
                console.warn(err);
              }
            }}
            style={[
              styles.viewWrapBorder,
              {
                borderBottomWidth: 0,
              },
            ]}>
            <Text
              style={[
                styles.menuText,
                {
                  color: theme.white,
                },
              ]}>
              {t('Select from gallery') + '...'}
            </Text>
          </TouchableOpacity>
          <Button
            label={t('Cancel')}
            onPress={() => {
              setModalVisible(false);
            }}
          />
        </>
      </ModalPopup>
    </>
  );
};

export default ImageUploader;

const styles = StyleSheet.create({
  inputWrap: {
    marginBottom: 8,
  },

  upload: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: (12 / 360) * w,
    borderStyle: 'dashed',
    borderWidth: (1 / 360) * w,
    borderColor: theme.blue,
    height: (110 / 360) * w,
  },
  uploadText: {
    fontSize: (16 / 360) * w,
    color: theme.blue,
    fontFamily: theme.fontFamily.bold,
  },
  uploadImagesView: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
  },
  uploadView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  uploadFileImage: {
    width: '100%',
    height: (110 / 360) * w,
    borderRadius: (12 / 360) * w,
  },
  uploadFileDelete: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  viewWrapBorder: {
    borderBottomWidth: 1,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuText: {
    fontSize: (16 / 375) * w,
    fontFamily: theme.fontFamily.regular,
    textAlign: 'left',
  },
  modalWrap: {
    padding: 30,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
