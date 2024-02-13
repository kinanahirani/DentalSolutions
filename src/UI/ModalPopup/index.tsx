import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import UserStore from '../../store/UserStore';
import {BlurView} from '@react-native-community/blur';
import {theme} from '../theme';
import {useNavigation} from '@react-navigation/native';

interface ModalProps {
  children: React.ReactElement;
  visible: boolean;
  onClose: () => void;
  animationType?: 'slide' | 'fade' | 'none';
  externalStyles?: StyleProp<ViewStyle & TextStyle>;
}

const {width, height} = Dimensions.get('screen');

const ModalPopup = ({
  children,
  visible,
  onClose,
  animationType = 'fade',
  externalStyles,
}: ModalProps) => {
  //
  const storeUser = useContext(UserStore);
  //
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // const navigation = useNavigation();

  const keyboardDidShow = e => {
    setKeyboardHeight(e.endCoordinates.height);
  };

  const keyboardDidHide = e => {
    setKeyboardHeight(e.endCoordinates.height);
  };

  //
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide,
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  //
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType={animationType}
      statusBarTranslucent>
      <>
        {/* <BlurView
          style={styles.modalOverlay}
          blurType={storeUser.theme === 'light' ? 'light' : 'dark'}
          blurAmount={1}
          reducedTransparencyFallbackColor="transparent"
        /> */}
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.modalCenteredView,
            {
              height: height - keyboardHeight,
            },
          ]}>
          <View style={[styles.modalWrap, externalStyles]}>{children}</View>
        </TouchableOpacity>
      </>
    </Modal>
  );
};

export default ModalPopup;
const styles = StyleSheet.create({
  modalOverlay: {
    width,
    height,
    position: 'absolute',
    top: 0,
    start: 0,
  },
  modalCenteredView: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    // height: height,
  },
  modalWrap: {
    backgroundColor: theme.primary,
    padding: (24 / 375) * width,
    width: width - 32,
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
