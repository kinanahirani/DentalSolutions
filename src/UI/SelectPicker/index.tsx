import React from 'react';
import {Dimensions, StyleSheet, Text, TextInput, View} from 'react-native';
import RNPickerSelect, {Item, PickerStyle} from 'react-native-picker-select';

import {theme} from '../theme';

type SelectPickerProps = {
  title: string;
  items: Item[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
};

//
const w = Dimensions.get('screen').width;

const SelectPicker: React.FC<SelectPickerProps> = ({
  title,
  items,
  value,
  onSelect,
  placeholder = '',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {items.find(i => i.value === value)?.label && (
        <TextInput
          //onChangeText={setFieldValue}
          value={items.find(i => i.value === value)?.label}
          placeholder={placeholder}
          style={styles.textInput}
        />
      )}

      <RNPickerSelect
        //useNativeAndroidPickerStyle={false}
        items={items}
        onValueChange={val => {
          onSelect(val);
          //setFieldValue(items.find(i => i.value === value)?.label as string);
        }}
        value={value}
        style={pickerSelectStyles}
        doneText={'Done'}
        //placeholder={{}}
      />
    </View>
  );
};

export default SelectPicker;

const pickerSelectStyles: PickerStyle = {
  inputIOSContainer: {
    backgroundColor: 'green',
    height: '100%',
  },
  inputAndroidContainer: {},
  viewContainer: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    start: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  chevronUp: {
    marginLeft: 0,
    marginStart: 11,
    //transform: [{translateY: 4}, {rotate: isRTL ? '45deg' : '-45deg'}],
  },
  chevronDown: {
    marginLeft: 0,
    marginStart: 22,
    //transform: [{translateY: -5}, {rotate: isRTL ? '-135deg' : '135deg'}],
  },
};

const styles = StyleSheet.create({
  container: {
    minHeight: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //borderRadius: 20,
    overflow: 'hidden',
    marginBottom: (20 / 360) * w,
  },
  title: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (20 / 360) * w,
    color: theme.primary,
    fontWeight: '700',
  },
  icon: {
    position: 'absolute',
    end: 25,
  },
  textInput: {
    //width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    color: theme.bluedark,
    fontFamily: theme.fontFamily.SFProTextBold,
    backgroundColor: theme.grey,
  },
});
