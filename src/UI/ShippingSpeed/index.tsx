import React, {Dispatch, SetStateAction} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';
import {useTranslation} from 'react-i18next';
import Button from '../Button';
import {Order, Shipment, ShipmentType} from '../../types';
import {ScrollView} from 'react-native-gesture-handler';

const w = Dimensions.get('window').width;

const ShippingSpeed = ({
  shipments,
  shipment_type,
  orderTotal,
  setOrder,
}: {
  shipments: Shipment[];
  shipment_type: ShipmentType;
  orderTotal: number;
  setOrder: Dispatch<SetStateAction<Order>>;
}) => {
  //
  const {t} = useTranslation();

  return (
    <>
      <Text style={styles.shippingSpeedTitle}>
        {t('Select your shipping speed')}
      </Text>
      <View style={styles.shippingSpeedBlock}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{
            paddingLeft: (24 / 360) * w,
          }}>
          {shipments.map(item => (
            <Button
              key={item.id}
              type="circle"
              invert={shipment_type === item.id ? false : true}
              style={{
                width: (150 / 360) * w,
                paddingHorizontal: 0,
                marginRight: 10,
              }}
              label={`${
                orderTotal > Number(item.free_from)
                  ? ''
                  : `${Number(item.price)}$ `
              }${t(item.label)} `}
              color="blue"
              border
              onPress={() => {
                setOrder(order => ({
                  ...order,
                  shipment_type: item.id,
                  shipment_price:
                    orderTotal > Number(item.free_from)
                      ? 0
                      : Number(item.price),
                }));
              }}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default ShippingSpeed;

const styles = StyleSheet.create({
  shippingSpeedBlock: {
    // width: '100%',
    // borderWidth: 2,
    borderColor: 'purple',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: (40 / 360) * w,
  },
  shippingSpeedTitle: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    marginVertical: (15 / 360) * w,
    color: theme.primary,
    paddingHorizontal: (24 / 360) * w,
  },
});
