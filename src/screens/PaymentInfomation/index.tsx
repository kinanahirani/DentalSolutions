import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Button from '../../UI/Button';
import Title from '../../UI/Title';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Card, CardTypes} from '../../types';
import {getImage} from '../../helpers/functions';
import FastImage from 'react-native-fast-image';
import CommonStore from '../../store/CommonStore';

const w = Dimensions.get('screen').width;

const PaymentInfomation = () => {
  //
  const {t} = useTranslation();

  //
  const navigation = useNavigation();
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);
  const isFocused = useIsFocused();

  const [cards, setCards] = useState<Card[]>([]);

  console.log(cards);

  // const getCards = async () => {
  //   const resp: {data: Card[]} = await api(
  //     'account/cards',
  //     'GET',
  //     {},
  //     storeUser.token,
  //   );

  //   setCards(resp.data);
  // };

  // const deleteCard = async (id: number) => {
  //   storeCommon.setLoading(true);
  //   await api(
  //     `account/cards/${id}`,
  //     'PUT',
  //     {
  //       status: 0,
  //     },
  //     storeUser.token,
  //   );
  //   storeCommon.setLoading(false);

  //   getCards();
  // };

  const getCards = async () => {
    const resp: {data: Card[]} = await api(
      'payment/get-credit-card-token',
      'GET',
      {},
      storeUser.token,
    );
    console.log('getCard>>>>>>>', resp);
    setCards(resp);
    if (JSON.stringify(resp) !== JSON.stringify(cards)) {
      setCards(resp);
    }
  };

  const deleteCard = async (id: number) => {
    storeCommon.setLoading(true);
    await api(
      'payment/remove-credit-card',
      'PUT',
      {
        card_id: id,
        status: 0,
      },
      storeUser.token,
    );
    storeCommon.setLoading(false);

    getCards();
  };

  useEffect(() => {
    getCards();
  }, [isFocused]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            icon={require('../../UI/images/plus.png')}
            color="grey"
            size="medium"
            onPress={() => {
              navigation.navigate('AddNewCard', {
                // stackType: 'Withdraw',
                callback: () => {},
              });
            }}
          />
        );
      },
    });
  }, []);

  return (
    // <View style={[theme.wrapper, {padding: 0}]}>
    <ScrollView contentContainerStyle={{padding: (24 / 360) * w}}>
      <Title
        label={t('My cards')}
        size="large"
        style={{marginBottom: (20 / 360) * w}}
      />
      {cards &&
        cards.map(card => (
          <View style={styles.card} key={card.created_at}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: (40 / 360) * w,
              }}>
              <FastImage
                source={getImage(card)}
                resizeMode="contain"
                style={{
                  maxWidth: (40 / 360) * w,
                  height: (25 / 360) * w,
                  marginEnd: (12 / 360) * w,
                }}
              />
              {/* <Text style={styles.cardName}>{CardTypes[card.cardtype]}</Text> */}
              <Text style={styles.cardName}>{card.brand_name}</Text>
            </View>
            <FastImage
              source={require('../../UI/images/chip.png')}
              resizeMode="contain"
              style={{
                width: (41 / 360) * w,
                height: (29 / 360) * w,
                marginBottom: (40 / 360) * w,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.cardInfo}>
                ****&nbsp;&nbsp;****&nbsp;&nbsp;****&nbsp;&nbsp;
                {/* {card.TranzilaTK.slice(-4)} */}
                {card.last}
              </Text>
              <Text style={styles.cardInfo}>
                {card.expdate.slice(0, 2)}/{card.expdate.slice(-2)}
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(t('Are you sure?'), '', [
                    {
                      text: t('Delete'),
                      onPress: () => {
                        deleteCard(card.id);
                      },
                      style: 'destructive',
                    },
                    {
                      text: t('Cancel'),
                      style: 'default',
                    },
                  ])
                }>
                <FastImage
                  source={require('../../UI/images/trash_red_2.png')}
                  style={{width: 24, height: 24}}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
    // </View>
  );
};

export default PaymentInfomation;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.white,
    borderRadius: (8 / 360) * w,
    padding: (24 / 360) * w,
    marginBottom: (16 / 360) * w,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10.27,
    elevation: 10,
  },
  cardName: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (18 / 360) * w,
    lineHeight: (22 / 360) * w,
    color: theme.primary,
  },
  cardInfo: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (16 / 360) * w,
    lineHeight: (24 / 360) * w,
    color: theme.primary,
  },
});
