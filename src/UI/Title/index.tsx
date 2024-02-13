import React from 'react';
import {Dimensions, StyleProp, StyleSheet, Text, TextStyle} from 'react-native';
import {theme} from '../theme';

const w = Dimensions.get('screen').width;

interface TitleProps {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<TextStyle>;
}

const Title = ({label, size = 'large', style}: TitleProps) => {
  const sizeTitle =
    size === 'large'
      ? (32 / 360) * w
      : size === 'medium'
      ? (18 / 360) * w
      : (12 / 360) * w;
  const lineHeightTitle =
    size === 'large'
      ? (32 / 360) * w
      : size === 'medium'
      ? (22 / 360) * w
      : (12 / 360) * w;

  const styles = StyleSheet.create({
    title: {
      color: theme.primary,
      fontSize: sizeTitle,
      lineHeight: lineHeightTitle,
      fontFamily: theme.fontFamily.title,
    },
  });

  return <Text style={[styles.title, style]}>{label}</Text>;
};

export default Title;
