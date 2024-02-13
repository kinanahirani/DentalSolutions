import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    color: theme.primary,
    fontSize: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
  },
  inputAndroid: {
    backgroundColor: 'transparent',
    color: theme.primary,
    fontSize: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
  },
  placeholder: {
    color: theme.bluedark,
    fontSize: (16 / 360) * w,
    fontFamily: theme.fontFamily.regular,
  },
});

export const exampleItems = [
  {label: 'Dental clinic', value: '1'},
  {label: 'Dealer', value: '10'},
  {label: 'Distributor', value: '100'},
];

interface DropboxProps {
  items?: {label: string; value: string}[];
  value: string;
  setValue?: (v: string) => void;
}

const Dropbox = ({items, value, setValue}: DropboxProps) => {
  const {t, i18n} = useTranslation();

  return (
    <View style={styles.typeSelect}>
      <RNPickerSelect
        disabled={!setValue}
        value={value}
        onValueChange={setValue || (() => {})}
        placeholder={{
          label: t('Title*'),
          value: 'null',
        }}
        items={items ? items : exampleItems}
        style={pickerSelectStyles}
        Icon={() => (
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: Platform.OS === 'ios' ? 0 : (14 / 360) * w,
              backgroundColor: theme.white,
              paddingHorizontal: 10,
            }}>
            <FastImage
              source={require('../../UI/images/chevron-down.png')}
              resizeMode="contain"
              style={{width: 24, height: 24}}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelect: {
    backgroundColor: theme.white,
    borderRadius: (50 / 360) * w,
    height: (56 / 360) * w,
    justifyContent: 'center',
    marginBottom: (16 / 360) * w,
    paddingHorizontal: Platform.OS === 'ios' ? (30 / 360) * w : (20 / 360) * w,
    borderWidth: (1 / 360) * w,
    borderColor: theme.grey,
  },
});

export default Dropbox;
