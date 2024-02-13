import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  KeyboardType,
  ReturnKeyType,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import TextInputMask from 'react-native-text-input-mask';
import {theme} from '../theme';
import FastImage from 'react-native-fast-image';

const w = Dimensions.get('screen').width;

interface InputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: ImageSourcePropType;
  keyboardType?: KeyboardType;
  label?: string;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyType;
  onEndEditing?: () => void;
  multiline?: boolean;
  refInput?: React.LegacyRef<TextInput>;
  editable?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  labelColor?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  defaultValue?: string;
  mask?: string;
  search?: boolean;
  clearSearch?: number;
  onClearSearch?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyles?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const Input = ({
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  label,
  autoFocus,
  returnKeyType,
  onEndEditing,
  multiline,
  editable = true,
  secureTextEntry = false,
  autoCapitalize,
  labelColor = 'white',
  onFocus,
  onBlur,
  defaultValue,
  mask,
  search = false,
  clearSearch = 0,
  onClearSearch,
  style = {},
  labelStyle = {},
  inputStyles,
}: InputProps) => {
  //
  const refInput = useRef<TextInput>();

  const {t} = useTranslation();

  //
  const animValue = useRef(
    new Animated.Value(value?.length || defaultValue ? 0 : 1),
  ).current;

  if (!editable) {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }

  //
  const [typePassword, setTypePassword] = useState(secureTextEntry);
  //
  const [focus, setFocus] = useState(false);

  const handleInputChange = (text: string) => {
    onChangeText(text);

    if (mask) {
      Animated.timing(animValue, {
        toValue: text.length > 0 ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        style,
        {
          height: multiline ? (175 / 360) * w : (56 / 360) * w,
        },
      ]}>
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          // borderWidth: 1,
          // borderColor: 'green',
          // paddingHorizontal: 16,
        }}
        onPress={() => refInput.current?.focus()}
        activeOpacity={1}>
        {!!label && (
          <Animated.Text
            // style={
            //   isFocused
            //     ? {...styles.label, ...styles.labelFocused}
            //     : {...styles.label, ...styles.labelNotFocused}
            // }
            style={[
              styles.label,
              {
                top: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 20],
                }),
                fontSize: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 16],
                }),
                color: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.primarylight, theme.primary],
                }),
              },
              labelStyle,
            ]}>
            {label}
          </Animated.Text>
        )}

        <TextInputMask
          secureTextEntry={typePassword}
          value={value}
          // onChangeText={onChangeText}
          onChangeText={handleInputChange}
          placeholder={label ? undefined : placeholder}
          placeholderTextColor={'#a1a3a7'}
          keyboardType={keyboardType}
          selectionColor={theme.primary}
          style={[
            styles.input,
            inputStyles,
            {paddingLeft: icon ? 60 : (24 / 360) * w},
            //{
            //height: '100%',
            //textAlignVertical: 'top',
            //},
          ]}
          autoFocus={!!autoFocus}
          // placeholderTextColor={theme.gray}
          textAlign={'left'}
          returnKeyType={returnKeyType}
          onSubmitEditing={() => {
            if (onEndEditing) {
              onEndEditing();
            }
          }}
          ref={refInput}
          multiline={multiline}
          editable={editable}
          onFocus={() => {
            Animated.timing(animValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
            if (onFocus) {
              onFocus();
            }
            setFocus(true);
          }}
          onBlur={() => {
            if (value?.length === 0) {
              Animated.timing(animValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
              }).start();
            }
            if (onBlur) {
              onBlur();
            }
            setFocus(false);
          }}
          autoCapitalize={autoCapitalize}
          mask={mask}
        />
        {!!icon && (
          <FastImage source={icon} resizeMode="contain" style={styles.icon} />
        )}
      </TouchableOpacity>
      {/* {clearSearch > 0 && (
        <TouchableOpacity
          hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
          onPress={onClearSearch}
          style={{marginEnd: 16}}>
          <FastImage
            style={{
              width: 24,
              height: 24,
            }}
            source={require('../images/close.png')}
          />
        </TouchableOpacity>
      )} */}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: (28 / 360) * w,
    borderWidth: (1 / 360) * w,
    borderColor: theme.grey,
    marginBottom: (16 / 360) * w,
  },
  label: {
    paddingHorizontal: 7,
    position: 'absolute',
    start: (24 / 360) * w,
    backgroundColor: theme.white,
    zIndex: 6,
    alignSelf: 'flex-start',
    color: theme.bluedark,
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
  },
  input: {
    paddingHorizontal: (24 / 360) * w,
    paddingVertical: 0,
    width: '100%',
    fontSize: (16 / 360) * w,
    lineHeight: (18 / 360) * w,
    position: 'relative',
    zIndex: 7,
    fontFamily: theme.fontFamily.SFProTextRegular,
    color: theme.primary,
    //paddingTop: (18 / 360) * w,
    //paddingBottom: (15 / 360) * w,
  },

  icon: {
    position: 'absolute',
    width: (22 / 360) * w,
    height: (22 / 360) * w,
    top: (16 / 360) * w,
    left: (16 / 360) * w,
  },
});
