import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useMemo, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Title from '../../UI/Title';
import InputSearch from '../InputSearch';
import RNPickerSelect from 'react-native-picker-select';

//
const w = Dimensions.get('screen').width;

const Filter = () => {
  //
  const {t, i18n} = useTranslation();

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={() => (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => bottomSheetModalRef.current?.close()}
          />
        </View>
      )}
      handleComponent={() => {
        return (
          <View style={[styles.handleComponent]}>
            <View style={styles.handleComponentInner} />
          </View>
        );
      }}>
      <View style={styles.contentContainer}>
        <Title
          label={t('Filter')}
          size="medium"
          style={{marginBottom: (25 / 360) * w}}
        />
        <InputSearch />
        <View style={styles.sortItem}>
          <Text>Sort buy</Text>
          <RNPickerSelect
            onValueChange={value => console.log(value)}
            placeholder={false}
            items={[
              {label: 'JavaScript', value: 'JavaScript'},
              {label: 'TypeScript', value: 'TypeScript'},
              {label: 'Python', value: 'Python'},
              {label: 'Java', value: 'Java'},
              {label: 'C++', value: 'C++'},
              {label: 'C', value: 'C'},
            ]}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default Filter;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    paddingVertical: (30 / 360) * w,
  },
  filter: {
    marginStart: (15 / 375) * w,
  },
  container: {
    flex: 1,
    padding: (24 / 360) * w,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: (25 / 375) * w,
  },
  handleComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: (10 / 375) * w,
    paddingBottom: (30 / 375) * w,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  handleComponentInner: {
    height: (4 / 375) * w,
    borderRadius: (2 / 375) * w,
    width: (44 / 375) * w,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(18, 18, 29, 0.1)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(18, 18, 29, 0.6)',
  },
  sortItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: (2 / 360) * w,
  },
});
