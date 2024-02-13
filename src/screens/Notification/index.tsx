import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';
import Divider from '../../UI/Divider';
import UserStore from '../../store/UserStore';
import {Bundle, Message} from '../../types';
import api from '../../helpers/api';
import {asDate} from '../../helpers/formatter';
import CommonStore from '../../store/CommonStore';

const w = Dimensions.get('screen').width;

const Notification = () => {
  //
  const navigation = useNavigation();
  //
  const {t} = useTranslation();

  //
  const storeCommon = useContext(CommonStore);
  const storeUser = useContext(UserStore);

  //
  const [messages, setMessages] = useState<Message[]>([]);

  //
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const resp = await api('messages?sort=-id', 'GET', {}, storeUser.token);
        // console.log('messages ==>>', resp);
        setMessages(resp.data);
      })();
    }, []),
  );

  //

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
  }, []);

  return (
    <View style={[theme.wrapper, {padding: 0}]}>
      <FlatList
        contentContainerStyle={{padding: (24 / 360) * w}}
        data={messages}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={async () => {
              console.log('onPress item: ', item);

              if (item.message_text) {
                navigation.navigate('MessageScreen', {message_id: item.id});
              } else if (item.product_id) {
                storeCommon.setLoading(true);
                const resp = await api(
                  `products/${item.product_id}`,
                  'GET',
                  {},
                  storeUser.token,
                );
                storeCommon.setLoading(false);

                navigation.navigate('ProductScreen', {product: resp});
              } else if (item.bundle_id) {
                storeCommon.setLoading(true);
                const resp = await api(
                  `bundles/${item.bundle_id}`,
                  'GET',
                  {},
                  storeUser.token,
                );
                storeCommon.setLoading(false);
                storeUser.setPromotionMode(true);
                storeUser.setCurrentBundle(resp as Bundle);
                navigation.navigate('BundleScreen', {id: item.bundle_id});
              }
            }}
            disabled={!item.message_text && !item.product_id && !item.bundle_id}
            style={styles.message}>
            <Text style={styles.messageTitle}>{item.title}</Text>
            <Text style={styles.messageDate}>
              {asDate(new Date(item.created_at * 1000))}
            </Text>
            <Text style={styles.messageDesc}>{item.text}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={
          <Title
            label={t('Notification')}
            size="large"
            style={{marginBottom: (20 / 360) * w}}
          />
        }
      />
      {/* <ScrollView style={{padding: (24 / 360) * w}}>
        <Title
          label={t('Notification')}
          size="large"
          style={{marginBottom: (20 / 360) * w}}
        />
        <View style={styles.message}>
          <Text style={styles.messageTitle}>Title</Text>
          <Text style={styles.messageDate}>22/10/2021</Text>
          <Text style={styles.messageDesc}>
            The platform-switched Laser-Lok collar creates a connective tissue
            attachment and retains{' '}
          </Text>
        </View>
        <Divider />
        <View style={styles.message}>
          <Text style={styles.messageTitle}>Title</Text>
          <Text style={styles.messageDate}>22/10/2021</Text>
          <Text style={styles.messageDesc}>
            The platform-switched Laser-Lok collar creates a connective tissue
            attachment and retains{' '}
          </Text>
        </View>
        <Divider />
        <View style={styles.message}>
          <Text style={styles.messageTitle}>Title</Text>
          <Text style={styles.messageDate}>22/10/2021</Text>
          <Text style={styles.messageDesc}>
            The platform-switched Laser-Lok collar creates a connective tissue
            attachment and retains{' '}
          </Text>
        </View>
      </ScrollView> */}
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTitle: {
    flex: 1,
    marginEnd: (10 / 360) * w,
    fontFamily: theme.fontFamily.SFProDisplayBold,
    fontSize: (16 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  messageDate: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
  },
  messageDesc: {
    width: '100%',
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginTop: (12 / 360) * w,
  },
});
