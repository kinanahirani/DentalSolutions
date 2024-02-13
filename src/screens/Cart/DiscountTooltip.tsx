import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {theme} from '../../UI/theme';

type DiscountTooltipProps = {
  priceBeforeDiscount: number | null;
  priceAfterDiscount: number | null;
  discountLimit: number;
  productTotalQuantity: number;
};

const DiscountTooltip: React.FC<DiscountTooltipProps> = ({
  priceBeforeDiscount,
  priceAfterDiscount,
  discountLimit,
  productTotalQuantity,
}) => {
  return priceBeforeDiscount &&
    priceAfterDiscount &&
    priceBeforeDiscount > priceAfterDiscount &&
    (productTotalQuantity === discountLimit - 2 ||
      productTotalQuantity === discountLimit - 1) ? (
    <View style={styles.wrapper}>
      <View style={styles.tooltip}>
        <Text style={styles.tooltipText}>
          {`From ${discountLimit} units saving $${
            discountLimit * priceBeforeDiscount -
            discountLimit * priceAfterDiscount
          }`}
        </Text>
      </View>
      <View style={styles.whiteTriangle} />
    </View>
  ) : (
    <></>
  );
};

export default DiscountTooltip;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },
  tooltip: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: 'white',

    //  shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  tooltipText: {
    fontFamily: theme.fontFamily.regular,
    color: '#00876E',
    fontSize: 13,
  },
  whiteTriangle: {
    position: 'absolute',
    left: '50%',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
});
