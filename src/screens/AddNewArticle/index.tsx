import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {ForumPost, PostStatus, TypeFile} from '../../helpers/types';
import ImageUploader from '../../UI/ImageUploader';
import Input from '../../UI/Input';
import Title from '../../UI/Title';
import Button from '../../UI/Button';
import {theme} from '../../UI/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
import {Article, ArticleStatus} from '../../types';
import {validator} from '../../helpers/validator';
import api from '../../helpers/api';

const w = Dimensions.get('screen').width;

const AddNewArticle = () => {
  //
  const {t} = useTranslation();

  //
  const navigation = useNavigation();

  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);
  //
  const {
    params: {post_id, onGoBack},
  } = useRoute<{
    params: {
      post_id?: string;
      onGoBack: (post: Article) => void;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  const [post, setPost] = useState<Article>({
    id: 0,
    created_at: 0,
    title: '',
    description: '',
    topic: '',
    photo: null,
    status: ArticleStatus.NEED_MODERATION,
    myLike_id: null,
    likes: 0,
    user_id: storeUser.user?.id || 0,
    comments_count: 0,
  } as Article);

  //
  const sendPost = async () => {
    storeCommon.setLoading(true);

    const resp = await api(
      `forums${post_id ? `/${post_id}` : ''}`,
      post_id ? 'PUT' : 'POST',
      post,
      storeUser.token,
    );
    storeCommon.setLoading(false);

    if (resp.error) {
      Alert.alert('Error', resp.error[0].message);
      return;
    }

    console.log('forumResp', resp);
    // onGoBack(resp);

    Alert.alert('', t('Your post will be available after moderation'));
    navigation.goBack();
  };

  //
  const getData = async () => {
    storeCommon.setLoading(true);

    const resp: Article = await api(
      `forums/${post_id}`,
      'GET',
      {},
      storeUser.token,
    );
    storeCommon.setLoading(false);

    // console.log('post', resp);
    setPost(resp);
  };

  //
  useEffect(() => {
    if (post_id) {
      getData();
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: false,
    });
  }, []);

  return (
    <>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.whiteBG} />
      <ScrollView contentContainerStyle={styles.wrapper}>
        <Title label={t('Add new post')} style={{marginBottom: 20}} />
        {/* <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        multiline
        placeholder={t('Make comment')}
      /> */}
        <View style={{flex: 1}}>
          <Input
            label={t('Title')}
            value={post.title}
            onChangeText={title =>
              setPost(p => ({
                ...p,
                title,
              }))
            }
          />
          {/* {console.log('post title >>>>>>>', post)} */}
          <Input
            label={t('Type')}
            value={post.topic}
            onChangeText={topic =>
              setPost(p => ({
                ...p,
                topic,
              }))
            }
          />
          <Input
            label={t('Text')}
            value={post.description}
            onChangeText={description =>
              setPost(p => ({
                ...p,
                description:
                  description.length > 500 ? p.description : description,
              }))
            }
            multiline
          />
          <ImageUploader
            setValue={images =>
              setPost(p => ({
                ...p,
                photo: images[0],
              }))
            }
            value={post.photo ? [post.photo] : []}
            title={t('Upload image')}
            max={1}
          />
        </View>
        <Button
          label={t('Public')}
          color="primary"
          type="circle"
          onPress={sendPost}
        />
      </ScrollView>
    </>
  );
};

export default AddNewArticle;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.white,
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    padding: (24 / 360) * w,
  },
  whiteBG: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },
});
