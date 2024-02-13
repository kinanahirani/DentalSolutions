import React from 'react';
import {Dimensions, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {theme} from '../theme';

const w = Dimensions.get('window').width;

interface DividerProps {
  color?: 'primary' | 'white' | 'grey' | 'blue' | 'bluelight';
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
}

const Divider = ({
  color = 'grey',
  style = {},
  vertical = false,
}: DividerProps) => {
  const styles = StyleSheet.create({
    divider: {
      width: vertical === true ? (1 / 360) * w : '100%',
      height: vertical === true ? '100%' : (1 / 360) * w,
      backgroundColor: theme[color],
      marginVertical: (16 / 360) * w,
    },
  });

  return <View style={[styles.divider, style]} />;
};

export default Divider;
