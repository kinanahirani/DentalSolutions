import React from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('window').width;

interface ButtonProps {
  onPress: () => void;
  label?: string;
  icon?: ImageSourcePropType;
  invert?: boolean;
  color?:
    | 'primary'
    | 'white'
    | 'grey'
    | 'blue'
    | 'halpOpaque'
    | 'primarydark'
    | 'red';
  size?: 'small' | 'medium' | 'large';
  type?: 'square' | 'circle' | 'text';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  block?: boolean;
  border?: boolean;
  iconSize?: 'large' | 'small';
  labelSize?: 'large' | 'small';
  redButton?: boolean;
}

const Button = ({
  label,
  icon /* = require('./phone.png')*/,
  onPress,
  invert = false,
  color = 'primary',
  size = 'large',
  type,
  style = {},
  disabled = false,
  block = false,
  border = false,
  iconSize = 'small',
  labelSize,
  redButton = false,
}: ButtonProps) => {
  const sizeBtn =
    size === 'large'
      ? (54 / 360) * w
      : size === 'medium'
      ? (44 / 360) * w
      : (32 / 360) * w;

  const styles = StyleSheet.create({
    wrapper: {
      width: block ? '100%' : label ? 'auto' : sizeBtn,
      paddingHorizontal:
        type === 'text'
          ? 0
          : labelSize === 'small'
          ? (12 / 360) * w
          : ((label ? 30 : 0) / 360) * w,
      height: type === 'text' ? 'auto' : sizeBtn,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius:
        type === 'square'
          ? (12 / 360) * w
          : type === 'circle'
          ? (100 / 360) * w
          : type === 'text'
          ? 0
          : (100 / 360) * w,
      backgroundColor:
        invert || type === 'text'
          ? 'transparent'
          : theme[color] + (disabled ? '33' : ''),
      borderWidth: border ? (1 / 360) * w : 0,
      borderColor: theme.blue,
      // opacity: disabled ? 0.5 : 1,
      flexDirection: 'row',
    },
    label: {
      // textTransform: 'uppercase',
      fontFamily: redButton
        ? labelSize === 'small'
          ? theme.fontFamily.bold
          : theme.fontFamily.regular
        : theme.fontFamily.bold,
      // color: invert ? theme[color] : 'white',
      color: redButton
        ? theme.red
        : color === 'primary' || color === 'blue'
        ? invert
          ? theme[color]
          : theme.white
        : color === 'white' || color === 'grey'
        ? invert
          ? theme.primary
          : theme.blue
        : invert
        ? theme[color]
        : theme.white,
      fontSize: redButton
        ? labelSize === 'small'
          ? (11 / 360) * w
          : (20 / 360) * w
        : type === 'text'
        ? (14 / 360) * w
        : labelSize === 'small'
        ? (11 / 360) * w
        : (16 / 360) * w,
      // letterSpacing: 1,
      lineHeight: redButton
        ? labelSize === 'small'
          ? (16 / 360) * w
          : (28 / 360) * w
        : type === 'text'
        ? (17 / 360) * w
        : labelSize === 'small'
        ? (14 / 360) * w
        : (19 / 360) * w,
    },
    icon: {
      width: iconSize === 'small' ? (20 / 360) * w : '100%',
      height: iconSize === 'small' ? (20 / 360) * w : '100%',
      marginStart: label ? (10 / 360) * w : 0,
    },
  });

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      {color === 'primary' ? (
        <LinearGradient
          colors={['#1A3C68', '#12C3F4']}
          start={{x: 0.0, y: 0}}
          end={{x: 1.5, y: 0}}
          style={[styles.wrapper, style]}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {!!icon && (
            <FastImage source={icon} style={styles.icon} resizeMode="contain" />
          )}
        </LinearGradient>
      ) : (
        <View style={[styles.wrapper, style]}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {!!icon && (
            <FastImage source={icon} style={styles.icon} resizeMode="contain" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
