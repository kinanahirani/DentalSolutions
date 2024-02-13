import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import {FAQ as FaqType} from '../../types';
import api from '../../helpers/api';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const FAQ = () => {
  //
  const {navigate} = useNavigation();
  //
  const {t} = useTranslation();

  //
  const [questions, setQuestions] = useState<FaqType[]>([]);

  //
  const getQuestions = async () => {
    const resp: FaqType[] = await api('api/faq', 'GET');

    setQuestions(resp);
  };

  //
  useEffect(() => {
    getQuestions();
  }, []);

  return (
    <View style={theme.wrapper}>
      <Title
        label={t('FAQ')}
        size="large"
        style={{marginBottom: (20 / 360) * w}}
      />
      <FlatList
        data={questions}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigate('FAQItem', {
                faq: item,
              })
            }>
            <Text style={styles.title}>{item.question}</Text>
            <FastImage
              source={require('../../UI/images/chevron.png')}
              resizeMode="contain"
              style={{
                width: (24 / 360) * w,
                height: (24 / 360) * w,
              }}
            />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <Title
            label={t('General question')}
            size="small"
            style={{
              marginBottom: (15 / 360) * w,
              fontFamily: theme.fontFamily.regular,
            }}
          />
        }
      />
    </View>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.grey,
    paddingVertical: (20 / 360) * w,
  },
  title: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (20 / 360) * w,
    lineHeight: (28 / 360) * w,
    color: theme.bluedark,
    flex: 1,
  },
});
