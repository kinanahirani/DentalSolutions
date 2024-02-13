import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';

import api from '../../helpers/api';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import {Credit} from '../../types';
import UserStore from '../../store/UserStore';
import {asCurrency, asDate} from '../../helpers/formatter';
import {observer} from 'mobx-react';
import {autorun} from 'mobx';

const w = Dimensions.get('screen').width;

const Credits = () => {
  //
  const {t} = useTranslation();

  //
  const storeUser = useContext(UserStore);

  //
  const [creditsHistory, setCreditsHistory] = useState<Credit[]>([]);

  //
  const [ordersData, setOrdersData] = useState({count: 0, amount: 0});

  //
  useEffect(() => {
    autorun(() => {
      if (storeUser.user?.credits) {
        const setCredits = async () => {
          const resp = await api(
            'credits?sort=-id',
            'GET',
            {},
            storeUser.token,
          );

          if (resp.error) {
            return;
          }

          setCreditsHistory(resp.data);
        };

        setCredits();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //
  //accoun expand orders_count / orders_amount

  //
  useEffect(() => {
    const getOrderCount = async () => {
      const resp = await api(
        'account?expand=orders_count,orders_amount',
        'GET',
        {},
        storeUser.token,
      );

      setOrdersData({amount: resp.orders_amount, count: resp.orders_count});
    };

    getOrderCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //
  const headerComponent = observer(() => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: (20 / 360) * w,
        }}>
        <Title label={t('Credits')} size="large" />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Title label={t('$')} size="medium" />
          <Title
            label={(
              Math.floor((storeUser.user?.credits || 0) * 100) / 100
            ).toString()}
            size="large"
          />
        </View>
      </View>
      <View style={styles.userCredits}>
        <View style={styles.userCreditsItem}>
          <Text style={styles.userCreditsItemText}>
            {t('Available for use')}
          </Text>
          <Text style={styles.userCreditsItemText}>
            {asCurrency(storeUser.user?.credits || 0)}
          </Text>
        </View>
        {/*<View style={styles.userCreditsItem}>
          <Text style={styles.userCreditsItemText}>{t('Overall balance')}</Text>
          <Text style={styles.userCreditsItemText}>$12</Text>
        </View>*/}
        <View style={styles.userCreditsItem}>
          <Text style={styles.userCreditsItemText}>
            {t('Number of purchases')}
          </Text>
          <Text style={styles.userCreditsItemText}>{ordersData.count}</Text>
        </View>
        <View style={styles.userCreditsItem}>
          <Text style={styles.userCreditsItemText}>{t('Purchases worth')}</Text>
          <Text style={styles.userCreditsItemText}>
            {asCurrency(ordersData.amount)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: (14 / 360) * w,
          lineHeight: (20 / 360) * w,
          color: theme.primary,
          marginBottom: (15 / 360) * w,
        }}>
        {t('History')}
      </Text>
    </>
  ));

  //
  const renderItem: ListRenderItem<Credit> = ({
    item: {created_at, amount, comment, type},
  }) => (
    <View style={styles.creditHistoryItem}>
      <View style={styles.creditHistoryItemInfo}>
        <Text style={styles.creditHistoryItemInfoText}>
          {t('Date of operation')}
        </Text>
        <Text style={styles.creditHistoryItemInfoText}>
          {asDate(new Date(created_at * 1000))}
        </Text>
      </View>
      <View style={styles.creditHistoryItemInfo}>
        <Text style={styles.creditHistoryItemInfoText}>{comment}</Text>
        <Text
          style={[
            styles.creditHistoryItemInfoText,
            {color: type === 1 ? theme.primary : theme.red},
          ]}>
          {type === 1 ? asCurrency(amount) : `- ${asCurrency(amount)}`}
        </Text>
      </View>
    </View>
  );

  //
  return (
    <View style={[theme.wrapper, {padding: 0}]}>
      <FlatList
        style={{paddingTop: 24, paddingHorizontal: 24}}
        data={creditsHistory}
        ListHeaderComponent={headerComponent}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderBottomWidth: (1 / 360) * w,
              borderColor: theme.grey,
            }}
          />
        )}
      />
    </View>
  );
};

export default Credits;

const styles = StyleSheet.create({
  userCredits: {
    padding: (20 / 360) * w,
    backgroundColor: theme.bluelight,
    borderRadius: (12 / 360) * w,
    marginBottom: (30 / 360) * w,
  },

  userCreditsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: (10 / 360) * w,
  },
  userCreditsItemText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  creditHistoryItem: {
    paddingVertical: (12 / 360) * w,
  },
  creditHistoryItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: (10 / 360) * w,
  },
  creditHistoryItemInfoText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
});
