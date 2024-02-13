import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageSourcePropType,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {Pagination} from 'react-native-snap-carousel';
import api from '../../helpers/api';
import UserStore from '../../store/UserStore';
import {Bundle, Product} from '../../types';
import {theme} from '../theme';
import DeviceInfo from 'react-native-device-info';
import CommonStore from '../../store/CommonStore';
import FastImage from 'react-native-fast-image';

const BANNER_MULTIPLIER = 10;

const w = Dimensions.get('screen').width;

interface CarouselItemProps {
  item: {
    status: string;
    title: string;
    price: string;
    image: ImageSourcePropType;
  };
}

interface Banner {
  image: string;
  id: number;
  external_url: string | null;
  product_id: number | null;
  bundle_id: number | null;
  //product: Product | null;
  //url: string | null;
}

const CarouselItem = ({item}: CarouselItemProps) => {
  const {status, title, price, image} = item;

  return (
    <View style={styles.sliderItem}>
      <View style={styles.rotateBox} />
      <View style={styles.sliderItemInfo}>
        <View style={styles.statusContainer}>
          <Text style={styles.status}>{status}</Text>
        </View>
        <Text style={styles.title} ellipsizeMode="tail" numberOfLines={3}>
          {title}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      <FastImage source={image} style={styles.sliderItemImage} />
    </View>
  );
};

const data = [
  {
    title: 'Tapered Internal Implant, 3.0 x 12mm, Mountless, RBT',
    price: '$89.95 USD',
    image: require('../../UI/images/carousel.png'),
    status: 'New in',
  },
  {
    title: 'Welcome to Dental',
    price: '$0.00',
    image: require('../../UI/images/carousel.png'),
    status: 'Free',
  },
  {
    title: 'Hellow World',
    price: '$100.00',
    image: require('../../UI/images/carousel.png'),
    status: 'Sale',
  },
];

const CustomCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  //
  const {navigate} = useNavigation();

  //
  const storeUser = useContext(UserStore);
  const storeCommon = useContext(CommonStore);

  //
  const scrollRef = useRef<ScrollView>(null);

  //
  const [banners, setBanners] = useState<Banner[]>([]);

  //
  const getItems = async () => {
    const resp: Banner[] & {data: Banner[]} = await api(
      'banners?expand=product',
      'GET',
      {},
      storeUser.token,
    );

    // console.log('resp >>>>>>', resp);

    setBanners(Array.from({length: BANNER_MULTIPLIER}, () => resp.data).flat());
  };

  //
  const goNextSlide = () => {
    const nextSlideIndex = activeIndex + 1;
    const offset = nextSlideIndex * w;
    scrollRef?.current?.scrollTo({x: offset, y: 0, animated: true});
    setActiveIndex(prevState => prevState + 1);
  };

  //
  const goFirstSlide = () => {
    scrollRef?.current?.scrollTo({x: 0, y: 0, animated: true});
    setActiveIndex(0);
  };

  //
  useEffect(() => {
    if (!banners.length) {
      setTimeout(getItems, 500);
      // getItems();
    }
  }, []);

  //
  useFocusEffect(() => {
    let timeout = setTimeout(() => {
      if (banners.length) {
        if (activeIndex < banners.length - 1) {
          goNextSlide();
          return;
        }

        if (activeIndex >= banners.length - 1) {
          goFirstSlide();
          return;
        }
      }
    }, 7000);

    return () => clearTimeout(timeout);
  });

  return (
    <View style={styles.carouselBlock}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          setActiveIndex(
            Math.ceil(Math.floor(event.nativeEvent.contentOffset.x) / w),
          );
        }}>
        {/* {data.map(item => (
          <CarouselItem item={item} key={item.title} />
        ))} */}
        {banners.map((item, index) => {
          // const ViewComponent = item.product ? TouchableOpacity : View;
          return (
            <TouchableOpacity
              onPress={async () => {
                // console.log('onPress item: ', item);

                if (item.external_url) {
                  try {
                    Linking.openURL(item.external_url);
                  } catch (e: any) {
                    console.log(e);
                  }
                } else if (item.product_id) {
                  storeCommon.setLoading(true);
                  const resp = await api(
                    `products/${item.product_id}`,
                    'GET',
                    {},
                    storeUser.token,
                  );
                  storeCommon.setLoading(false);

                  navigate('ProductScreen', {product: resp});
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
                  navigate('BundleScreen', {id: item.bundle_id});
                }
              }}
              disabled={
                !item.external_url && !item.product_id && !item.bundle_id
              }
              style={{
                width: (312 / 360) * w,
                marginHorizontal: (24 / 360) * w,
                borderColor: theme.grey,
                borderRadius: (12 / 360) * w,
                overflow: 'hidden',
                //borderWidth: 1,
              }}
              key={index}>
              <FastImage
                source={{
                  uri: item.image,
                }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Pagination
        dotsLength={banners.length / BANNER_MULTIPLIER}
        activeDotIndex={activeIndex % (banners.length / BANNER_MULTIPLIER)}
        containerStyle={{
          position: 'absolute',
          paddingVertical: 0,
          bottom: 20,
          start: 20,
        }}
        dotContainerStyle={{marginHorizontal: 2}}
        dotStyle={{
          width: (40 / 360) * w,
          height: (2 / 360) * w,
          borderRadius: (4 / 360) * w,
          backgroundColor: theme.primary,
        }}
        inactiveDotStyle={{
          width: (6 / 360) * w,
          height: (2 / 360) * w,
          borderRadius: (4 / 360) * w,
          backgroundColor: theme.primary,
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rotateBox: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: (200 / 360) * w,
    borderRightWidth: (120 / 360) * w,
    borderBottomWidth: 0,
    borderLeftWidth: 50,
    borderTopColor: theme.yellow,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.yellow,
  },
  carouselBlock: {
    height: (200 / 360) * w,
    // backgroundColor: '#E8C031',
    //borderColor: theme.grey,
    //borderRadius: (12 / 360) * w,
    //overflow: 'hidden',
    marginBottom: (40 / 360) * w,
    //marginHorizontal: (24 / 360) * w,
  },
  sliderItem: {
    maxWidth: (312 / 360) * w,
    paddingHorizontal: (25 / 360) * w,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderItemImage: {
    width: (150 / 360) * w,
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    zIndex: 100,
  },
  sliderItemInfo: {
    width: '60%',
  },
  statusContainer: {
    backgroundColor: theme.bright,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: (8 / 360) * w,
  },
  status: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (12 / 360) * w,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: theme.red,
  },
  title: {
    fontFamily: theme.fontFamily.title,
    fontSize: (18 / 360) * w,
    color: theme.white,
    fontWeight: '700',
    marginBottom: (8 / 360) * w,
  },
  price: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontSize: (14 / 360) * w,
    lineHeight: (20 / 360) * w,
    color: theme.white,
    fontWeight: '700',
  },
});

export default CustomCarousel;
