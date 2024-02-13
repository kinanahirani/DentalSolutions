import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {theme} from '../../UI/theme';
import InputSearch from '../../UI/InputSearch';
import Button from '../../UI/Button';
import {Article, ArticleStatus} from '../../types';
import ArticleCard from '../../UI/ArticleCard';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
// import ForumItem from './ForumItem';

//
const w = Dimensions.get('screen').width;

const Forum = () => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '65%'], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  //
  const {t} = useTranslation();
  //
  const navigation = useNavigation();

  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  // const [items, setItems] = useState<ForumPost[]>([]);

  //
  // const [like, setLike] = useState(false);
  const [items, setItems] = useState<Article[]>([]);
  const [perPage] = useState(10);
  let [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  //
  let {params} = useRoute<{
    params?: {
      post_id?: string;
    };
    key: string;
    name: string;
    path?: string | undefined;
  }>();

  //
  const getData = async (withLoader = true) => {
    if (page === 1) {
      storeCommon.setLoading(withLoader);
    }

    // console.log('filterString', filterString);
    const resp: {data: Article[]; total: number} = await api(
      `forums?per-page=${perPage}&page=${page}`,
      'GET',
      {},
      storeUser.token,
    );
    storeCommon.setLoading(false);
    if (page === 1) {
      setItems(resp.data);
    } else {
      setItems([...items, ...resp.data]);
    }

    setTotal(resp.total);
    setRefreshing(false);
  };

  //
  const setLike = async (
    object_id: number,
    myLike_id: number | null,
    callback: (myLike_id: number | null) => void,
  ) => {
    let id = myLike_id;
    if (myLike_id) {
      await api(`forums/unlike/${myLike_id}`, 'DELETE', {}, storeUser.token);
      id = null;
    } else {
      const resp = await api(
        'forums/like',
        'POST',
        {object_id},
        storeUser.token,
      );
      id = resp.id;
    }

    callback(id);
  };

  //
  const deletePost = async (id: number) => {
    await api(
      `forums/${id}`,
      'PUT',
      {status: ArticleStatus.NOT_ACTIVE},
      storeUser.token,
    );

    setItems(elem => elem.filter(i => i.id !== id));
    setTotal(tt => tt - 1);
  };

  //
  useFocusEffect(
    useCallback(() => {
      // console.log('useFocusEffect params', params);
      if (params?.post_id) {
        navigation.navigate('Article', {
          post_id: params.post_id,
          onGoBack: (post: Article) => {
            setItems(i => i.map(p => (p._id === post._id ? post : p)));
          },
          deletePost,
          setLike,
          setListItems: setItems,
        });

        params = undefined;
      }
    }, [params]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Button
              icon={require('../../UI/images/filter.png')}
              size="medium"
              color="grey"
              onPress={handlePresentModalPress}
            />
            {!!storeUser.user && (
              <Button
                icon={require('../../UI/images/plus.png')}
                color="grey"
                size="medium"
                style={{marginStart: 15}}
                onPress={() => {
                  navigation.navigate('AddNewArticle', {
                    onGoBack: (post: Article) => {
                      setItems(state => [post, ...state]);
                      setTotal(state => state + 1);
                    },
                  });
                }}
              />
            )}
          </View>
        );
      },
    });
    // StatusBar.setBarStyle('dark-content');

    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  //
  useEffect(() => {
    getData();
  }, []);

  //
  useEffect(() => {
    if (page > 1) {
      getData();
    }
  }, [page]);

  return (
    <>
      <View style={{height: (22 / 360) * w}} />
      <FlatList
        // style={theme.layoutStyle}
        contentContainerStyle={styles.wrapper}
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({item, index}) => (
          <ArticleCard
            item={item}
            setItems={setItems}
            setLike={setLike}
            deletePost={deletePost}
            key={index}
          />
        )}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        // ListFooterComponent={() =>
        //   !isHomePage ? <View style={{height: 24}} /> : <></>
        // }
        onEndReachedThreshold={0.7}
        onEndReached={() => {
          if (items.length < total) {
            setPage(p => p + 1);
          }
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          page = 1;
          getData(false);
        }}
        // scrollEnabled={!isHomePage}
      />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={() => (
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => bottomSheetModalRef.current?.close()}
            />
          </View>
        )}
        handleComponent={() => {
          return (
            <View style={[styles.handleComponent]}>
              <View style={styles.handleComponentInner} />
            </View>
          );
        }}>
        <View style={styles.contentContainer}>
          <Text style={styles.filterTitle}>{t('Filter')}</Text>
          <InputSearch />
          <View style={styles.popularContainer}>
            <Text style={[styles.filterItem, {marginBottom: 0}]}>Sort buy</Text>
            <View style={styles.popularView}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          </View>
          <Text style={styles.filterItem}>Type</Text>
          <Button
            label="Search"
            color="white"
            type="circle"
            border
            style={
              {
                // width: '100%',
                // bottom: (40 / 360) * w,
                // position: 'absolute',
              }
            }
            onPress={() => {}}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

export default Forum;

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    paddingHorizontal: (24 / 360) * w,
    paddingBottom: (24 / 360) * w,
    flexDirection: 'column',
  },
  block: {
    width: (150 / 360) * w,
    height: (150 / 360) * w,
    backgroundColor: 'red',
  },
  contentContainer: {
    flex: 1,
    // alignItems: 'center',
    paddingHorizontal: (25 / 360) * w,
  },
  filterTitle: {
    textAlign: 'center',
    fontFamily: theme.fontFamily.title,
    fontSize: (24 / 360) * w,
    lineHeight: (24 / 360) * w,
    color: theme.primary,
    marginBottom: (20 / 360) * w,
  },

  handleComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: (10 / 360) * w,
    paddingBottom: (30 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    borderTopStartRadius: (24 / 360) * w,
  },
  handleComponentInner: {
    height: (4 / 360) * w,
    borderRadius: (2 / 360) * w,
    width: (44 / 360) * w,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(4, 20, 44, 0.1)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4, 20, 44, 0.6)',
  },
  sortItem: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },

  // <<<<<<<<<<<<<<<<<<<<<<<<< ForumItem >>>>>>>>>>>>>>>>>>>>>>>>>>>
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
    padding: (20 / 360) * w,
    maxHeight: (85 / 360) * w,
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
    backgroundColor: theme.blue,
    fontFamile: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.white,
    borderRadius: (8 / 360) * w,
    justifyContent: 'center',
    marginEnd: 'auto',
  },
  filterItem: {
    fontFamily: theme.fontFamily.regular,
    fontSize: (20 / 360) * w,
    color: theme.primary,
    fontWeight: '700',
    marginBottom: (25 / 360) * w,
  },
  popularContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: (25 / 360) * w,
  },
  popularView: {
    backgroundColor: theme.grey,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularText: {
    color: theme.bluedark,
    fontFamily: theme.fontFamily.SFProTextBold,
  },
});
