import AsyncStorage from '@react-native-community/async-storage';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Input from '../Input';
import {theme} from '../theme';

//
const w = Dimensions.get('screen').width;

const InputSearch = ({
  setSearch,
  search,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) => {
  //
  const {t} = useTranslation();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  {
    console.log('>>>>>>>', searchHistory?.length);
  }

  return (
    <View style={styles.searchWrap}>
      {/* <FastImage
        style={styles.searchImg}
        source={require('../../UI/images/search.png')}
        resizeMode="contain"
      />
      <TextInput
        style={styles.inputSearch}
        placeholder={t('Search')}
        placeholderTextColor={theme.bluedark}
        onChangeText={setSearch}
        value={search}
      /> */}
      <Input
        placeholder={t('Search')}
        value={search}
        onChangeText={setSearch}
        icon={require('../../UI/images/search_icon.png')}
        onEndEditing={() => {
          AsyncStorage.getItem('searchHistory', (e, result) => {
            let messages: string[] = [];

            // If this is the first time, set up a new array
            if (result) {
              messages = JSON.parse(result);
            }

            // Save the messages
            AsyncStorage.setItem(
              'searchHistory',
              JSON.stringify(messages.reverse().slice(0, 9)),
            );
          });
        }}
        // icon={require('../../UI/images/search.png')}
        onFocus={() =>
          AsyncStorage.getItem('searchHistory', (e, res) => {
            setSearchHistory(JSON.parse(res || '[]'));
          })
        }
        onBlur={() => setSearchHistory([])}
        returnKeyType={'search'}
        search={!!searchHistory.length}
        // clearSearch={search.length}
        // onClearSearch={() => {
        //   setFilter(() => ({
        //     name: '',
        //     locality: '',
        //     tags: [],
        //     sort: BusinessSort.NEWEST_OLDER,
        //   }));
        //   setFilterString('');
        // }}
      />

      {!!searchHistory.length && (
        <View style={styles.searchHistory}>
          <ScrollView keyboardShouldPersistTaps="always">
            {searchHistory.map((item, index) => (
              <>
                <TouchableOpacity
                  onPress={() => {
                    // setFilter(f => ({
                    //   ...f,
                    //   name: item,
                    // }));
                  }}
                  activeOpacity={0.9}>
                  <View
                    style={[
                      styles.searchItem,
                      {
                        borderBottomLeftRadius:
                          searchHistory.length === index + 1 ? 8 : 0,
                        borderBottomRightRadius:
                          searchHistory.length === index + 1 ? 8 : 0,
                      },
                    ]}>
                    <Text style={styles.searchLastText}>{item}</Text>
                  </View>
                  {searchHistory.length !== index + 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#E2E9F3',
                      }}
                    />
                  )}
                </TouchableOpacity>
              </>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default InputSearch;

const styles = StyleSheet.create({
  searchWrap: {
    width: '100%',
    height: (56 / 360) * w,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: theme.bluelight,
    borderRadius: (12 / 360) * w,
    // paddingHorizontal: (15 / 360) * w,
    marginBottom: (35 / 360) * w,
  },
  inputSearch: {
    flex: 1,
    height: (44 / 360) * w,
    fontFamily: theme.fontFamily.regular,
    color: theme.bluedark,
  },
  searchImg: {
    width: (24 / 360) * w,
    height: (20 / 360) * w,
    marginEnd: (10 / 360) * w,
  },
  searchHistory: {
    maxHeight: 210,
    position: 'absolute',
    // zIndex: 10,
    width: '100%',
    top: 56,
    shadowColor: '#000',
    // overflow: 'hidden',
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,

    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  searchItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
  },
  searchLastText: {
    fontSize: 16,
    color: theme.black,
    fontFamily: theme.fontFamily.regular,
    letterSpacing: 0.15,
    lineHeight: 20,
    opacity: 0.5,
  },
});
