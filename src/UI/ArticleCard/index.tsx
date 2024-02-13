import {useNavigation} from '@react-navigation/native';
import React, {Dispatch, SetStateAction, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {IMAGES_URL} from '../../helpers/api';
import {asPrice} from '../../helpers/formatter';
import UserStore from '../../store/UserStore';
import {Article} from '../../types';
import ButtonFavorite from '../ButtonFavorite';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

const ArticleCard = ({
  item,
  setItems,
  setLike,
  deletePost,
}: {
  item: Article;
  setItems: Dispatch<SetStateAction<Article[]>>;
  setLike?: (
    object_id: number,
    myLike_id: number | null,
    callback: (myLike_id: number | null) => void,
  ) => void;
  deletePost?: (id: number) => void;
}) => {
  //
  const {navigate} = useNavigation();
  //
  const {t} = useTranslation();

  //
  const storeUser = useContext(UserStore);
  // {
  //   console.log('>>>>', item.photo);
  // }
  return (
    // <View
    //   style={{
    //     position: 'relative',
    //     // marginEnd: 15,
    //     flex: 1,
    //   }}>
    //   <TouchableOpacity
    //     style={styles.topItemsItem}
    //     onPress={() => {
    //       navigate('Article', {
    //         article,
    //       });
    //     }}>
    //     <View style={styles.topItemsItemImage}>
    //       <FastImage
    //         source={{
    //           uri: article.images[0].replace(
    //             'https://api.dental.local',
    //             IMAGES_URL,
    //           ),
    //         }}
    //         resizeMode="cover"
    //         style={{width: (120 / 360) * w, height: (85 / 360) * w}}
    //       />
    //     </View>
    //     <Text style={styles.topItemsItemTitle}>{article.title}</Text>
    //     <Text style={styles.topItemsItemCategory}>
    //       {product.categories[0].title}
    //     </Text>
    //     <Text style={styles.topItemsItemPrice}>{asPrice(product)}</Text>
    //   </TouchableOpacity>

    //   <ButtonFavorite id={product.id} size="small" position="absolute" />
    // </View>
    <TouchableOpacity
      style={styles.forumItem}
      onPress={() => {
        navigate('Article', {
          postData: item,
          onGoBack: (post: Article) => {
            setItems(i => i.map(p => (p.id === item.id ? post : p)));
          },
          deletePost,
          setLike,
          setListItems: setItems,
        });
      }}>
      {/* {!!item.photo && ( */}
      <FastImage
        // source={{
        //   uri: item.photo.replace('https://api.dental.local', IMAGES_URL),
        // }}
        source={
          item.photo
            ? {
                uri: item.photo
                  .replace('https://api.dental.local', IMAGES_URL)
                  .replace('/uploads/', '/uploads/800/'),
              }
            : require('../../UI/images/forum_1.png')
        }
        style={styles.forumItemImage}
        resizeMode="cover"
      />
      {/* )} */}
      <View style={styles.shadowBox} />
      <View style={styles.forumInfo}>
        <Text style={styles.articleCatdTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.articleCatdDesc}>
          {item.description}
        </Text>
      </View>
      <View style={styles.typeContainer}>
        <Text style={styles.forumItemType}>{item.topic}</Text>
        {/* <Like
            icon={
              like
                ? require('../../UI/images/like_on_white.png')
                : require('../../UI/images/like_off_white.png')
            }
          /> */}
        {!!item.likes && (
          <>
            <FastImage
              source={require('../../UI/images/like_off_white.png')}
              resizeMode="contain"
              style={{
                width: (14 / 360) * w,
                height: (14 / 360) * w,
                // marginEnd: (20 / 360) * w,
              }}
            />
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                color: 'white',
                paddingStart: 5,
              }}>
              {item.likes}
            </Text>
          </>
        )}
        {!!item.comments_count && (
          <>
            <FastImage
              source={require('../../UI/images/comment_white.png')}
              resizeMode="contain"
              style={{
                width: (14 / 360) * w,
                height: (14 / 360) * w,
                marginStart: (20 / 360) * w,
              }}
            />
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                color: 'white',
                paddingStart: 5,
              }}>
              {item.comments_count}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ArticleCard;

const styles = StyleSheet.create({
  forumItem: {
    // flex: 1,
    height: (210 / 360) * w,
    borderRadius: (12 / 360) * w,
    marginBottom: (16 / 360) * w,
    // borderColor: 'red',
    // borderWidth: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  forumItemImage: {
    flex: 1,
    width: '100%',
  },
  shadowBox: {
    backgroundColor:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%);',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  forumInfo: {
    backgroundColor: theme.white,
    paddingVertical: (10 / 360) * w,
    paddingHorizontal: (20 / 360) * w,
    maxHeight: (85 / 360) * w,
  },
  articleCatdTitle: {
    fontFamily: theme.fontFamily.bold,
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (7 / 360) * w,
  },
  articleCatdDesc: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (7 / 360) * w,
  },
  typeContainer: {
    paddingHorizontal: (15 / 360) * w,
    width: '100%',
    position: 'absolute',
    top: (15 / 360) * w,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forumItemType: {
    paddingHorizontal: (6 / 360) * w,
    paddingVertical: (4 / 360) * w,
    backgroundColor: 'rgba(94, 167, 255, 0.1)',
    fontFamile: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.white,
    borderRadius: (8 / 360) * w,
    justifyContent: 'center',
    marginEnd: 'auto',
  },
});
