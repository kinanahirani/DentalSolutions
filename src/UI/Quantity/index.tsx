import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('window').width;

const Quantity = () => {
  const [productAmount, setProductAmount] = useState(1);

  return (
    <View style={styles.quantityBlock}>
      <View style={styles.quantityButtonContainer}>
        <TouchableOpacity
          onPress={() => setProductAmount(productAmount - 1)}
          disabled={productAmount <= 1 ? true : false}
          style={styles.quantityButton}>
          <FastImage
            source={require('../../UI/images/minus.png')}
            resizeMode="contain"
            style={{width: (10 / 360) * w, height: (10 / 360) * w}}
          />
        </TouchableOpacity>
      </View>
      <Text numberOfLines={1} style={styles.quantityNumber}>
        {productAmount}
      </Text>
      <View style={styles.quantityButtonContainer}>
        <TouchableOpacity
          onPress={() => setProductAmount(productAmount + 1)}
          style={styles.quantityButton}>
          <FastImage
            source={require('../../UI/images/plus_blue.png')}
            resizeMode="contain"
            style={{width: (10 / 360) * w, height: (10 / 360) * w}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Quantity;

const styles = StyleSheet.create({
  quantityBlock: {
    width: (88 / 360) * w,
    height: (32 / 360) * w,
    borderRadius: (20 / 360) * w,
    backgroundColor: theme.grey,
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'stretch',
    alignContent: 'stretch',
  },
  quantityButtonContainer: {
    flexGrow: 1,
  },
  quantityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  quantityNumber: {
    fontFamily: theme.fontFamily.SFProTextBold,
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    padding: 0,
    textAlignVertical: 'center',
  },
});
