import {createContext} from 'react';
import {action, observable, makeObservable} from 'mobx';
import AsyncStorage from '@react-native-community/async-storage';
import {Bundle, OrderBundle, OrderProduct, User} from '../types';

class UserStore {
  constructor() {
    makeObservable(this, {
      token: observable,
      user: observable,
      messages: observable,
      favorites: observable,
      cart: observable,
      showCartBubble: observable,
      promotionMode: observable,
      currentBundle: observable,
      bundlesInCart: observable,
      bundleProducts: observable,
      setToken: action.bound,
      setUser: action.bound,
      setMessages: action.bound,
      setFavorites: action.bound,
      setCart: action.bound,
      setShowCartBubble: action.bound,
      setDefaultBundleState: action.bound,
      setCurrentBundle: action.bound,
      setBundleInCart: action.bound,
      setBundleProducts: action.bound,
      deleteBundleFromCart: action.bound,
      getDefaultBundlesInCartState: action.bound,
      updateBundlesInCart: action.bound,
      addBundleToCartForReorder: action.bound,
    });

    this.getDafaultFavorites();
    this.getDafaultCart();
  }

  token: string | null = null;
  user: User | null = null;
  messages: number = 0;
  favorites: number[] = [];
  cart: OrderProduct[] = [];
  showCartBubble = false;
  promotionMode = false;
  currentBundle: Bundle | null = null;
  bundlesInCart: OrderBundle[] = [];
  bundleProducts: {
    product_id: number;
    variant: {
      option_id: number;
      value_id: number;
    }[];
    quantity: number;
  }[] = [];
  setToken = (newToken: string | null) => {
    this.token = newToken;
    if (newToken) {
      AsyncStorage.setItem('@token', newToken);
    } else {
      AsyncStorage.removeItem('@token');
    }
  };

  setUser = async (newUser: User | null) => {
    this.user = newUser;
  };

  setMessages = (newMessages: number) => {
    this.messages = newMessages;
  };

  setFavorites = (id: number) => {
    const newFav = this.favorites.includes(id)
      ? this.favorites.filter(f => f !== id)
      : [...this.favorites, id];
    this.favorites = newFav;
    AsyncStorage.setItem('@favorites', JSON.stringify(newFav));
  };

  getDafaultFavorites = async () => {
    const newFav = await AsyncStorage.getItem('@favorites');
    if (newFav) {
      this.favorites = JSON.parse(newFav);
    }
  };

  setCart = (newCart: Array<OrderProduct>) => {
    this.cart = newCart;
    AsyncStorage.setItem('@cart', JSON.stringify(newCart));
  };

  getDafaultCart = async () => {
    console.log('getDafaultCart');
    const newCart = await AsyncStorage.getItem('@cart');
    const bundles = await AsyncStorage.getItem('@bundlesInCart');
    if (newCart) {
      this.cart = JSON.parse(newCart);
    }
    if (bundles) {
      this.bundlesInCart = JSON.parse(bundles);
    }
  };

  setShowCartBubble = (show: boolean) => {
    this.showCartBubble = show;
  };
  setPromotionMode = (isPromotion: boolean) => {
    this.promotionMode = isPromotion;
  };

  setCurrentBundle = (bundle: Bundle | null) => {
    this.currentBundle = bundle;
  };
  setBundleProducts = (
    items: {
      product_id: number;
      variant: {
        option_id: number;
        value_id: number;
      }[];
      quantity: number;
    }[],
  ) => {
    this.bundleProducts = [
      ...this.bundleProducts.filter(
        item => item.product_id !== items[0].product_id,
      ),
      ...items,
    ];
  };
  setDefaultBundleState = () => {
    this.promotionMode = false;
    this.currentBundle = null;
    this.bundleProducts = [];
  };
  setBundleInCart = () => {
    this.bundlesInCart = [
      ...this.bundlesInCart,
      {
        bundle_id: this.currentBundle?.id as number,
        title: this.currentBundle?.title as string,
        products: this.bundleProducts,
        quantity: 1,
        price: this.currentBundle?.price as number,
      },
    ];
    AsyncStorage.setItem('@bundlesInCart', JSON.stringify(this.bundlesInCart));
  };
  deleteBundleFromCart = (id: number) => {
    const indexForDel = this.bundlesInCart.findIndex(
      item => item.bundle_id === id,
    );
    this.bundlesInCart = this.bundlesInCart.filter(
      (_, index) => index !== indexForDel,
    );
    AsyncStorage.setItem('@bundlesInCart', JSON.stringify(this.bundlesInCart));
  };
  getDefaultBundlesInCartState = () => {
    this.bundlesInCart = [];
  };
  updateBundlesInCart = (fetchedBundles: Bundle[]) => {
    // Filtering existing bundlesInCart to keep only those present in fetchedBundles
    const updatedBundlesInCart = this.bundlesInCart.filter(b =>
      fetchedBundles.some(rb => rb.id === b.bundle_id),
    );

    this.bundlesInCart = updatedBundlesInCart;

    AsyncStorage.setItem(
      '@bundlesInCart',
      JSON.stringify(updatedBundlesInCart),
    );
  };
  addBundleToCartForReorder = (bundle: OrderBundle) => {
    this.bundlesInCart.push(bundle);
    AsyncStorage.setItem('@bundlesInCart', JSON.stringify(this.bundlesInCart));
  };
}

export default createContext(new UserStore());
