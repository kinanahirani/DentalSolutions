import React, {useContext} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Observer} from 'mobx-react';
import CommonStore from '../../store/CommonStore';

const Loader = () => {
  const storeCommon = useContext(CommonStore);

  return (
    <Observer>
      {() =>
        storeCommon.loading ? (
          <View style={styles.view}>
            <ActivityIndicator
              size={storeCommon.size || 'large'}
              color={storeCommon.color || '#fff'}
            />
          </View>
        ) : (
          <></>
        )
      }
    </Observer>
  );
};

export default Loader;
const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
