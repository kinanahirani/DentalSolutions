import {useNavigation} from '@react-navigation/native';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import Button from '../../UI/Button';
import ContactPopover from '../../UI/ContactPopover';
import {MultiplyBlendColor} from 'react-native-image-filter-kit';
import api, {IMAGES_URL} from '../../helpers/api';
import Title from '../../UI/Title';
import {theme} from '../../UI/theme';
import {Bundle} from '../../types';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {useTranslation} from 'react-i18next';
import UserStore from '../../store/UserStore';
import CommonStore from '../../store/CommonStore';
import {asCurrency} from '../../helpers/formatter';
import {Observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';

//
const w = Dimensions.get('screen').width;

const BundleScreen = ({route}) => {
  //
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [tolTipVisible, setTolTipVisible] = useState(false);
  //

  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);
  //

  const {dispatch, setOptions, navigate, goBack} = useNavigation();
  //

  const id = route.params.id;
  //
  const headerHeight = useHeaderHeight();
  const {t} = useTranslation();
  //

  const getBundle = async () => {
    try {
      storeCommon.setLoading(true);
      const resp: {data: Bundle} = await api(
        `bundles/${id}`,
        'GET',
        {},
        storeUser.token,
      );
      setBundle(resp);
      storeCommon.setLoading(false);
    } catch (err) {
      storeCommon.setLoading(false);
      Alert.alert('', err.message);
      console.log('err', err);
    }
  };
  //

  useLayoutEffect(() => {
    setOptions({
      headerStyle: {
        backgroundColor: '#cfcfcf',
        borderBottomWidth: 0,
        elevation: 0,
      },
      cardStyle: {
        backgroundColor: '#cfcfcf',
      },
      headerBackImage: () => (
        <TouchableOpacity
          onPress={() => {
            storeUser.setDefaultBundleState();
            // dispatch(StackActions.replace('MainTabs'));
            goBack();
          }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: (44 / 360) * w,
            width: (44 / 360) * w,
            marginStart: 13,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
          }}>
          <FastImage
            source={require('../../UI/images/arrow_back_white.png')}
            resizeMode="cover"
            style={{
              width: (24 / 360) * w,
              height: (24 / 360) * w,
              // marginHorizontal: Platform.OS === 'ios' ? 16 : 0,
              // transform: [{scaleX: isRTL ? 1 : -1}],
            }}
          />
        </TouchableOpacity>
      ),
      headerRight: () => {
        return (
          <Button
            color="halpOpaque"
            icon={require('../../UI/images/WatsUp_white.png')}
            size="medium"
            onPress={() => setShowPopover(true)}
          />
        );
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //

  useEffect(() => {
    getBundle();
  }, []);

  const renderFlatList = useMemo(() => {
    return (
      <FlatList
        numColumns={2}
        data={bundle?.products}
        keyExtractor={item => item.product.id.toString()}
        renderItem={({item}) => (
          <Observer>
            {() => {
              const product = item.product;
              const count = storeUser.bundleProducts
                .filter(item => item.product_id === product.id)
                .reduce((a, b) => a + b.quantity, 0);
              return (
                <View style={styles.itemContainer}>
                  <TouchableOpacity
                    style={styles.itemWrapper}
                    onPress={() => {
                      setTolTipVisible(false);
                      navigate('ProductScreen', {
                        product,
                      });
                    }}>
                    <View style={styles.itemImageContainer}>
                      {product.images[0] && (
                        <FastImage
                          source={{
                            uri: item.product.images[0]
                              .replace('https://api.dental.local', IMAGES_URL)
                              .replace('/uploads/', '/uploads/400/'),
                          }}
                          resizeMode="cover"
                          style={styles.itemImage}
                        />
                      )}
                    </View>
                    <Text
                      style={[styles.topItemsItemTitle]}
                      ellipsizeMode="tail"
                      numberOfLines={3}>
                      {product.title}
                    </Text>
                    <Text style={styles.topItemsItemCategory}>{`${t(
                      'Selected',
                    )}: ${count}/${item.quantity}`}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </Observer>
        )}
        contentContainerStyle={styles.wrapper}
        ListHeaderComponent={() => {
          return (
            <View style={styles.listHeaderContainer}>
              {bundle?.description && (
                <AutoHeightWebView
                  // source={{html: `${product.description}`}}
                  source={{
                    html: `<html dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');body{padding: 0 24px;margin:0;background:none;color:${theme.primary}!important;font-family: 'Rubik', sans-serif!important;}h1{text-align:center;}</style></head><body>${bundle?.description}</body></html>`,
                  }}
                  style={{
                    width: w - (30 / 360) * w * 2 - 2,
                    opacity: 0.99,
                    minHeight: 1,
                    marginTop: (16 / 360) * w,
                  }}
                  scalesPageToFit={false}
                  viewportContent={'width=device-width, user-scalable=no'}
                  bounces={false}
                />
              )}
            </View>
          );
        }}
        // ListFooterComponent={() => (

        // )}
        ListFooterComponentStyle={styles.listFooterStyle}
        ListEmptyComponent={() => <View style={styles.listEmpty} />}
        showsVerticalScrollIndicator={false}
      />
    );
  }, [bundle]);

  return (
    <>
      <ContactPopover open={showPopover} close={() => setShowPopover(false)} />
      <View style={styles.whiteBG} />
      <View
        style={{
          height: headerHeight,
          //borderWidth: 10,
          // borderColor: 'red',
        }}>
        {/* <MultiplyBlendColor
          style={
            {
              //borderWidth: 10,
              //borderColor: 'red',
            }
          }
          srcColor="#cfcfcf"
          // srcImage={
          //   <Image
          //     source={require('../../UI/images/blank.png')}
          //     resizeMode="cover"
          //     style={{width: (120 / 360) * w, height: (85 / 360) * w}}
          //   />
          // }
          dstImage={
            <FastImage
              source={
                bundle?.images[0]
                  ? {
                      uri: bundle?.images[0].replace(
                        'https://api.dental.local',
                        IMAGES_URL,
                      ),
                    }
                  : require('../../UI/images/categoryes/category-2.png')
              }
              resizeMode="contain"
              style={{
                width: '100%',
                height: (w / 3) * 2.5,
                opacity: 0.5,
                //   width: (64 / 360) * w,
                //   height: (64 / 360) * w,
                //   overflow: 'hidden',
                //   borderRadius: (32 / 360) * w,
              }}
            />
          }
        /> */}
        <FastImage
          source={
            bundle?.images[0]
              ? {
                  uri: bundle?.images[0].replace(
                    'https://api.dental.local',
                    IMAGES_URL,
                  ),
                }
              : require('../../UI/images/categoryes/category-2.png')
          }
          resizeMode="contain"
          style={{
            width: '100%',
            height: (w / 3) * 2.5,
            opacity: 0.5,
            //   width: (64 / 360) * w,
            //   height: (64 / 360) * w,
            //   overflow: 'hidden',
            //   borderRadius: (32 / 360) * w,
          }}
        />
      </View>
      <View style={{height: (12 / 360) * w}} />
      <View style={styles.categoryH1}>
        {/* <Title
          label={bundle?.title}
          size="large"
          style={{
            color: theme.white,
            fontWeight: '700',
          }}
        /> */}
      </View>
      {renderFlatList}
      <Observer>
        {() => {
          const isDisabled =
            storeUser.currentBundle?.products?.reduce(
              (a, b) => a + b.quantity,
              0,
            ) !== storeUser.bundleProducts?.reduce((a, b) => a + b.quantity, 0);
          return (
            <View style={styles.btnFooter}>
              <Button
                disabled={tolTipVisible}
                type="circle"
                label={
                  t('Add to cart for') + ' ' + asCurrency(bundle?.price || 0)
                }
                color="primary"
                onPress={() => {
                  if (isDisabled) {
                    setTolTipVisible(true);
                  } else {
                    storeUser.setBundleInCart();
                    storeUser.setDefaultBundleState();
                    goBack();
                  }
                }}
              />
              {tolTipVisible && (
                <Pressable
                  onPress={() => {
                    setTolTipVisible(false);
                  }}
                  style={styles.wrapperTooltip}>
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>
                      {`${t('Select all requiried products')}`}
                    </Text>
                  </View>
                  <View style={styles.whiteTriangle} />
                </Pressable>
              )}
            </View>
          );
        }}
      </Observer>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    borderRadius: (32 / 360) * w,
    backgroundColor: theme.white,
    paddingBottom: 100,
    position: 'relative',
  },
  categoryH1: {
    alignItems: 'center',
    justifyContent: 'center',
    height: (100 / 360) * w,
  },
  listHeaderContainer: {
    borderTopStartRadius: (24 / 360) * w,
    borderTopEndRadius: (24 / 360) * w,
    padding: (24 / 360) * w,
    backgroundColor: theme.white,
  },
  listFooterStyle: {
    marginBottom: 32,
    marginHorizontal: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  btnFooter: {
    // backgroundColor: theme.white,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: (16 / 360) * w,
    paddingBottom: 30,
  },
  listEmpty: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.white,
  },
  itemContainer: {
    backgroundColor: theme.white,
    alignItems: 'center',
    flex: 0.5,
  },
  itemWrapper: {
    marginBottom: (10 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (12 / 360) * w,
    padding: (12 / 360) * w,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageContainer: {
    height: (150 / 360) * w,
    backgroundColor: theme.white,
    borderRadius: (12 / 360) * w,
    padding: (12 / 360) * w,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#cfcfcf',
    borderWidth: 5,
  },
  itemImage: {
    width: (120 / 360) * w,
    height: (85 / 360) * w,
  },
  topItemsItemTitle: {
    fontFamily: theme.fontFamily.regular,
    fontWeight: '500',
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    marginBottom: (4 / 360) * w,
    marginTop: 10,
  },
  topItemsItemCategory: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (14 / 360) * w,
    lineHeight: (16 / 360) * w,
    marginBottom: (2 / 360) * w,
    color: theme.primary,
    opacity: 0.5,
    alignSelf: 'center',
  },
  //
  whiteBG: {
    position: 'absolute',
    bottom: 0,
    top: '50%',
    backgroundColor: 'white',
    width: '100%',
  },

  tooltip: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: 'white',

    //  shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  tooltipText: {
    fontFamily: theme.fontFamily.regular,
    color: theme.red,
    fontSize: 13,
  },
  whiteTriangle: {
    position: 'absolute',
    left: '50%',
    bottom: -10,
    transform: [{rotate: '180deg'}],
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  wrapperTooltip: {
    position: 'absolute',
    bottom: 110,
    // backgroundColor: 'red',
    left: '25%',
  },
});

export default BundleScreen;
