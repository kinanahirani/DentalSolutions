import React, {useState} from 'react';
import {Dimensions, Image, StyleSheet, TextInput, View} from 'react-native';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const Search = () => {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.searchWrapper}>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search"
        keyboardType="default"
      />
      <FastImage
        resizeMode="contain"
        style={styles.searchIcon}
        source={require('../images/search.png')}
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchWrapper: {
    height: (56 / 360) * w,
    // backgroundColor: theme.lightgrey,
    borderRadius: (100 / 360) * w,
    paddingStart: (50 / 360) * w,
    marginBottom: (35 / 360) * w,
  },
  searchInput: {
    fontSize: (16 / 360) * w,
    fontWeight: '700',
    height: (56 / 360) * w,
    fontFamily: theme.fontFamily.SFProTextRegular,
    color: theme.primary,
    // textAlign: 'left',
    // backgroundColor: 'transparent',
    zIndex: 5,
  },
  searchIcon: {
    position: 'absolute',
    width: (24 / 360) * w,
    height: (24 / 360) * w,
    top: (15 / 360) * w,
    start: 15,
  },
});
