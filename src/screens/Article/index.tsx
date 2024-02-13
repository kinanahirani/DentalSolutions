import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import {useTranslation} from 'react-i18next';
import Button from '../../UI/Button';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Article as ArticleType, Comment} from '../../types';
import api, {IMAGES_URL} from '../../helpers/api';
import {asDate, asDateTime} from '../../helpers/formatter';
import UserStore from '../../store/UserStore';
import {toJS} from 'mobx';
import FastImage from 'react-native-fast-image';
//
const w = Dimensions.get('screen').width;

const Article = () => {
  //
  const {
    params: {postData, setLike, onGoBack},
  } = useRoute<{
    params: {
      postData: ArticleType;
      setLike: (
        object_id: number,
        myLike_id: number | null,
        callback: (myLike_id: number | null) => void,
      ) => void;
      onGoBack: (post: ArticleType) => void;
      // deletePost,
      // setLike,
      // setListItems: setItems,
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const storeUser = useContext(UserStore);

  //
  const {t} = useTranslation();

  //
  const navigation = useNavigation();

  //
  const [post, setPost] = useState<ArticleType>(
    JSON.parse(JSON.stringify(postData)),
  );
  const [comments, setComments] = useState<Comment[]>([]);

  //
  const getComments = async () => {
    const resp: {data: Comment[]} = await api(
      `forum-comments?per-page=50&sort=-created_at&filter[post_id]=${post.id}`,
      'GET',
      {},
      storeUser.token,
    );
    setComments(resp.data);
  };

  //
  useEffect(() => {
    getComments();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{post.topic}</Text>
        </View>
      ),
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageBlock}>
        <FastImage
          source={
            post.photo
              ? {
                  uri: post.photo.replace(
                    'https://api.dental.local',
                    IMAGES_URL,
                  ),
                }
              : require('../../UI/images/forum_1.png')
          }
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <View
        style={{
          backgroundColor: theme.white,
          borderTopStartRadius: (24 / 360) * w,
          borderTopEndRadius: (24 / 360) * w,
          paddingVertical: (30 / 360) * w,
          borderWidth: 1,
          borderColor: theme.white,
          flex: 1,
          marginTop: (220 / 360) * w,
        }}>
        <ScrollView style={{paddingHorizontal: (24 / 360) * w}}>
          <Title
            label={post.title}
            size="large"
            style={{
              fontFamily: theme.fontFamily.bold,
              marginBottom: (10 / 360) * w,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              marginBottom: (24 / 360) * w,
              alignItems: 'center',
            }}>
            <Text style={styles.articleInfoText}>
              {asDate(new Date(post.created_at * 1000))}
            </Text>
            <TouchableOpacity
              style={styles.likeArticle}
              onPress={() => {
                if (!storeUser.user) {
                  return;
                }
                setLike(post.id, post.myLike_id, id => {
                  setPost(p => ({
                    ...p,
                    likes: p.likes + 1 * (id ? 1 : -1),
                    myLike_id: id,
                  }));
                  onGoBack({
                    ...post,
                    likes: post.likes + 1 * (id ? 1 : -1),
                    myLike_id: id,
                  });
                });
              }}>
              <FastImage
                source={require('../../UI/images/like_off_blue.png')}
                resizeMode="contain"
                style={{
                  width: (15 / 360) * w,
                  height: (15 / 360) * w,
                  marginEnd: (8 / 360) * w,
                }}
              />
              <Text style={styles.articleInfoText}>{post.likes}</Text>
            </TouchableOpacity>
            <View style={styles.likeArticle}>
              <FastImage
                source={require('../../UI/images/comment_blue.png')}
                resizeMode="contain"
                style={{
                  width: (15 / 360) * w,
                  height: (15 / 360) * w,
                  marginEnd: (8 / 360) * w,
                }}
              />
              <Text style={styles.articleInfoText}>{post.comments_count}</Text>
            </View>
          </View>
          <Text style={styles.articleText}>{post.description}</Text>
          {/* </ScrollView> */}

          {!!storeUser.user && (
            <Button
              type="circle"
              color="primary"
              label={t('Write a comment')}
              onPress={() => {
                navigation.navigate('AddNewComment', {
                  post_id: postData.id,
                  callback: () => {
                    console.log('New comment success');
                    getComments();
                    setPost(p => ({
                      ...p,
                      comments_count: post.comments_count + 1,
                    }));

                    onGoBack({
                      ...post,
                      comments_count: post.comments_count + 1,
                    });
                  },
                });
              }}
            />
          )}

          {!!comments.length &&
            comments.map(comment => (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.grey,
                    marginVertical: 20,
                  }}
                />
                <View key={comment.id}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        color: theme.primary,
                      }}>
                      {comment.user.fname !== 'null' ? comment.user.fname : ''}
                      {comment.user.lname !== 'null' ? comment.user.lname : ''}
                    </Text>
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.regular,
                        color: theme.primarydark,
                      }}>
                      {asDateTime(new Date(comment.created_at * 1000))}
                    </Text>
                  </View>
                  <Text style={styles.articleText}>{comment.text}</Text>
                </View>
              </>
            ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Article;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  imageBlock: {
    width: '100%',
    height: (250 / 360) * w,
    position: 'absolute',
    top: 0,
  },
  articleInfoText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginEnd: (15 / 360) * w,
  },
  likeArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    // marginEnd: 15,
  },
  articleText: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (30 / 360) * w,
  },
  typeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(94, 167, 255, 0.1)',
    position: 'absolute',
  },
  typeText: {
    color: theme.blue,
    fontSize: 16,
    fontFamily: theme.fontFamily.SFProTextBold,
  },
});
