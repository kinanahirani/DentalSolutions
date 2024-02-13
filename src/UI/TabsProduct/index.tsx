import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

interface TabsProps {
  value: string;
  setValue: (value: string) => void;
}

const tabs = [
  {value: 'tile', icon: require('../../UI/images/tile.png')},
  {value: 'list', icon: require('../../UI/images/list.png')},
];

const TabsProduct = () => {
  //
  //
  const [currentTab, setCurrentTab] = useState(tabs[0].value);

  return (
    <View style={styles.tabsProduct}>
      {tabs.map(item => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.tabsProductItem,
            // value === item.value
            //   ? styles.tabsProductItemActive
            //   : styles.tabsProductItemNotActive,
          ]}
          onPress={() => setCurrentTab(item.value)}>
          <FastImage
            style={[
              styles.tabsProductIcon,
              // {opacity: value === item.value ? 1 : 0.3},
            ]}
            source={item.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabsProduct;

const styles = StyleSheet.create({
  tabsProduct: {
    flexDirection: 'row',
    backgroundColor: theme.grey,
    borderRadius: (4 / 360) * w,
    padding: (2 / 360) * w,
    marginEnd: (15 / 360) * w,
  },
  tabsProductItem: {
    width: (24 / 360) * w,
    height: (24 / 360) * w,
    padding: (5 / 360) * w,
    borderRadius: (4 / 360) * w,
  },
  tabsProductIcon: {
    width: (14 / 360) * w,
    height: (14 / 360) * w,
  },
  tabsProductItemActive: {
    backgroundColor: theme.white,
  },
  tabsProductItemNotActive: {
    backgroundColor: 'transparent',
  },
});
