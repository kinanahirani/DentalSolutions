import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {Alert, Dimensions, Platform, StyleSheet, View} from 'react-native';
import api from '../../helpers/api';
import CommonStore from '../../store/CommonStore';
import UserStore from '../../store/UserStore';
import {ErrorType, User} from '../../types';
import Button from '../Button';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import appleAuth from '@invertase/react-native-apple-authentication';
import analytics from '@react-native-firebase/analytics';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import appsFlyer from 'react-native-appsflyer';

//
GoogleSignin.configure();

const SocAuth = () => {
  //
  const storeUser = useContext(UserStore);
  const {setLoading} = useContext(CommonStore);

  const navigation = useNavigation();

  //
  const loginDataApple = async () => {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
      // console.log('appleAuthRequestResponse', appleAuthRequestResponse);
      const resp: {token: string; user: User; error?: ErrorType[]} = await api(
        'api/soc-login',
        'POST',
        {
          email: appleAuthRequestResponse.email,
          fname: appleAuthRequestResponse.fullName?.givenName || '',
          // avatar: undefined,
          lname: appleAuthRequestResponse.fullName?.familyName || '',
          apple_id: appleAuthRequestResponse.user,
        },
      );
      analytics().logEvent('FIB_sign_in_complete', {});
      AppEventsLogger.logEvent('fb_sign_in_complete');
      appsFlyer.logEvent('af_sign_in_complete', {});
      if (resp.error) {
        setLoading(false);
        Alert.alert('', resp.error[0].message);
        return;
      }

      storeUser.setUser(resp.user);
      storeUser.setToken(resp.token);
      setLoading(false);
      // login(resp.token);

      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    }
  };

  //
  const loginDataGoogle = async () => {
    const hasPlayService = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    if (hasPlayService) {
      // await GoogleSignin.signOut();
      setLoading(true);
      try {
        const userInfo = await GoogleSignin.signIn();
        // console.log('userInfo.user', {
        //   email: userInfo.user.email,
        //   fname: userInfo.user.givenName,
        //   avatar: userInfo.user.photo,
        //   lname: userInfo.user.familyName,
        //   google_id: userInfo.user.id,
        // });
        if (userInfo.user) {
          const resp: {token: string; user: User; error?: ErrorType[]} =
            await api('api/soc-login', 'POST', {
              email: userInfo.user.email,
              fname: userInfo.user.givenName || '',
              avatar: userInfo.user.photo,
              lname: userInfo.user.familyName || '',
              google_id: userInfo.user.id,
            });
          analytics().logEvent('FIB_sign_in_complete', {});
          AppEventsLogger.logEvent('fb_sign_in_complete');
          appsFlyer.logEvent('af_sign_in_complete', {});
          if (resp.error) {
            setLoading(false);
            Alert.alert('', resp.error[0].message);
            return;
          }

          storeUser.setUser(resp.user);
          storeUser.setToken(resp.token);
          setLoading(false);
          // login(resp.token);
          // } else {
          // Alert.alert('', userInfo.serverAuthCode || '');
          navigation.reset({
            index: 0,
            routes: [{name: 'MainTabs'}],
          });
        }
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // user cancelled the login flow
          Alert.alert('', error.code.toString());
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // operation (e.g. sign in) is in progress already
          Alert.alert('', error.code.toString());
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // play services not available or outdated
          Alert.alert('', error.code.toString());
        } else {
          // some other error happened
          Alert.alert('', error.toString());
        }
      }
    }
  };

  //
  const loginDataFacebook = async () => {
    LoginManager.logInWithPermissions(['email', 'public_profile']).then(
      async result => {
        if (result.isCancelled) {
          // console.log('Login cancelled');
        } else {
          setLoading(true);
          try {
            // console.log('result', result);

            AccessToken.getCurrentAccessToken().then(data => {
              const {accessToken} = data;
              let token = accessToken.toString();
              return fetch(
                'https://graph.facebook.com/v8.0/me?fields=email,name,first_name,last_name,picture.type(large),friends&access_token=' +
                  token,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              ).then(response =>
                response.json().then(async facebookData => {
                  // console.log(facebookData);

                  const resp: {
                    token: string;
                    user: User;
                    error?: ErrorType[];
                  } = await api('api/soc-login', 'POST', {
                    email: facebookData.email,
                    fname: facebookData.first_name || '',
                    avatar: facebookData.picture.data.url,
                    lname: facebookData.last_name || '',
                    facebook_id: facebookData.id,
                  });
                  analytics().logEvent('FIB_sign_in_complete', {});
                  AppEventsLogger.logEvent('fb_sign_in_complete');
                  appsFlyer.logEvent('af_sign_in_complete', {});
                  if (resp.error) {
                    setLoading(false);
                    Alert.alert('', resp.error[0].message);
                    return;
                  }

                  storeUser.setUser(resp.user);
                  storeUser.setToken(resp.token);
                  setLoading(false);
                  // login(resp.token);
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'MainTabs'}],
                  });
                }),
              );
            });
          } catch (error: any) {
            // console.log(error);
            setLoading(false);
          }
        }
      },
      error => {
        // console.log('Login fail with error: ' + error);
      },
    );
  };

  return (
    <View style={styles.login}>
      <Button
        icon={require('../../UI/images/facebook.png')}
        color="grey"
        iconSize="large"
        invert
        onPress={loginDataFacebook}
      />
      {Platform.OS === 'ios' && (
        <Button
          icon={require('../../UI/images/appleID.png')}
          color="grey"
          iconSize="large"
          invert
          onPress={loginDataApple}
        />
      )}
      <Button
        icon={require('../../UI/images/google.png')}
        color="grey"
        iconSize="large"
        invert
        onPress={loginDataGoogle}
      />
    </View>
  );
};

export default SocAuth;

const styles = StyleSheet.create({
  login: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: (20 / 360) * Dimensions.get('screen').width,
  },
});
