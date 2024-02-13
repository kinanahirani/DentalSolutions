import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, StyleSheet, View} from 'react-native';
import api from '../../helpers/api';
import CommonStore from '../../store/CommonStore';
import UserStore from '../../store/UserStore';
import {Article} from '../../types';
import Button from '../../UI/Button';
import Input from '../../UI/Input';
import {theme} from '../../UI/theme';
import Title from '../../UI/Title';

const AddNewComment = () => {
  //
  const {
    params: {post_id, callback},
  } = useRoute<{
    params: {
      post_id: number;
      callback: () => void;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const {t} = useTranslation();
  const {goBack, setOptions} = useNavigation();

  //
  const [comment, setComment] = useState('');

  //
  const sendComment = async () => {
    storeCommon.setLoading(true);

    const resp = await api(
      'forum-comments',
      'POST',
      {
        post_id,
        text: comment,
      },
      storeUser.token,
    );
    storeCommon.setLoading(false);

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    // console.log('forumResp', resp);
    callback();
    goBack();
  };

  useLayoutEffect(() => {
    setOptions({
      headerRight: false,
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <Title label={t('Write a comment')} style={{marginBottom: 20}} />
      <View style={{flex: 1}}>
        <Input
          inputStyles={{margin: 10}}
          label={t('Make comment')}
          value={comment}
          onChangeText={setComment}
          multiline
          autoFocus
        />
      </View>

      <Button
        label={t('Send')}
        color="primary"
        type="circle"
        onPress={sendComment}
      />
    </View>
  );
};

export default AddNewComment;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    marginTop: 12,
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    backgroundColor: 'white',
  },
});
