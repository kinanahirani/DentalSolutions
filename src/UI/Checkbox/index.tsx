import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

interface CheckboxProps {
  label: string;
  disabled?: boolean;
  checked: boolean;
  setChecked: (value: boolean) => void;
  isBorderBottom?: boolean;
  desc?: string;
  style?: StyleProp<ViewStyle>;
}

const Checkbox = ({
  label,
  disabled = false,
  checked,
  setChecked,
  isBorderBottom,
  desc,
  style = {},
}: CheckboxProps) => {
  const {t} = useTranslation();

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.container, style]}
      hitSlop={{
        top: (15 / 360) * w,
        bottom: (15 / 360) * w,
        right: (15 / 360) * w,
        left: (15 / 360) * w,
      }}
      onPress={() => {
        setChecked(!checked);
      }}>
      <FastImage
        style={styles.image}
        source={
          checked
            ? require('../../UI/images/checkOn.png')
            : require('../../UI/images/checkOff.png')
        }
      />

      <View style={{flex: 1}}>
        <Text style={styles.label}>
          {t(label)}
          {!!desc && <Text style={styles.descText}>{t(desc)}</Text>}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    // opacity: disabled ? 0.5 : 1,
    // borderBottomWidth: isBorderBottom ? 1 : 0,
    // borderBottomColor: theme.borderGray,
  },
  label: {
    fontSize: (12 / 360) * w,
    fontFamily: theme.fontFamily.SFProTextRegular,
    textAlign: 'left',
    color: theme.grey,
    // marginTop: -2,
  },
  image: {
    width: (24 / 360) * w,
    height: (24 / 360) * w,
    marginEnd: (8 / 360) * w,
  },
  descText: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    color: theme.primary,
    fontSize: (12 / 360) * w,
  },
});
