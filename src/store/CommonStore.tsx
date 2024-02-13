import {createContext} from 'react';
import {action, observable, makeObservable} from 'mobx';
import {Dimensions} from 'react-native';
import {AlertMessage} from '../types';

const scale = Dimensions.get('screen').scale;

class CommonStore {
  constructor() {
    makeObservable(this, {
      bottomBarHeight: observable,
      loading: observable,
      appLoaded: observable,
      setLoading: action.bound,
      setAppLoaded: action.bound,
    });
  }

  loading = false;
  color: string | null = null;
  size: number | null = null;

  url: string | null = null;

  appLoaded = false;

  offsetTop = 0;

  bottomBarHeight = 0;

  alert: AlertMessage = {type: '', dscr: ''};

  setLoading = (
    loading: boolean,
    color: string | null = null,
    size: number | null = null,
  ) => {
    this.loading = loading;
    this.color = color;
    this.size = size;
  };

  setAppLoaded = (newAppLoaded: boolean) => {
    this.appLoaded = newAppLoaded;
  };

  setAlert = (newAlert: AlertMessage) => {
    this.alert = newAlert;
  };

  setBottomBarHeight = (newHeight: number) => {
    this.bottomBarHeight = newHeight / scale;
  };
}

export default createContext(new CommonStore());
