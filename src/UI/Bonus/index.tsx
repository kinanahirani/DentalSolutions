import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, StyleSheet, TextInput, View} from 'react-native';
import {min} from 'react-native-reanimated';
import {asCurrency} from '../../helpers/formatter';
import UserStore from '../../store/UserStore';
import Button from '../Button';
import {theme} from '../theme';
import Title from '../Title';

const w = Dimensions.get('window').width;

const Bonus = ({
  bonus,
  setBonus,
  max,
}: {
  bonus: string;
  setBonus: Dispatch<SetStateAction<string>>;
  max: number;
}) => {
  //
  const storeUser = useContext(UserStore);

  //
  const {t, i18n} = useTranslation();

  //
  const textRef = useRef<TextInput>();

  return (
    <View style={styles.bonusBlock}>
      <Title
        label={
          'You have ' + asCurrency(storeUser.user?.credits || 0) + ' credits'
        }
        size="small"
        style={{
          fontFamily: theme.fontFamily.SFProTextBold,
          marginBottom: (10 / 360) * w,
          width: '100%',
        }}
      />
      {/* <View> */}
      <TextInput
        ref={textRef}
        value={bonus}
        onChangeText={val => {
          if (Number.isNaN(parseFloat(val.replace(',', '.')))) {
            setBonus('');
            return;
          }
          if (
            parseFloat(val.replace(',', '.')) >
            Math.min(max, storeUser.user?.credits || 0)
          ) {
            setBonus(Math.min(max, storeUser.user?.credits || 0).toString());
          } else {
            setBonus(val);
          }
        }}
        placeholder={t('Enter the amount')}
        selectionColor={theme.primary}
        style={styles.bonusInput}
        // autoFocus={!!autoFocus}
        placeholderTextColor={theme.bluedark}
        textAlign={
          i18n.language === 'he' || i18n.language === 'ar' ? 'right' : 'left'
        }
        keyboardType="decimal-pad"
      />
      <Button
        label={t('OK')}
        color="primary"
        size="small"
        style={styles.bonusButton}
        onPress={() => {
          if (textRef.current) {
            textRef.current.blur();
          }
        }}
      />
      <Button
        onPress={() => setBonus('')}
        icon={require('../../UI/images/close_blue.png')}
        size="small"
        color="white"
        style={{
          height: (20 / 360) * w,
          width: (20 / 360) * w,
        }}
      />
      {/* </View> */}
    </View>
  );
};

export default Bonus;

const styles = StyleSheet.create({
  bonusBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: (10 / 360) * w,
  },
  bonusInput: {
    color: 'black',
    height: (38 / 360) * w,
    backgroundColor: theme.white,
    borderWidth: (1 / 360) * w,
    borderColor: theme.grey,
    flex: 1,
    borderTopLeftRadius: (20 / 360) * w,
    borderBottomLeftRadius: (20 / 360) * w,
    fontFamily: theme.fontFamily.regular,
    fontSize: (12 / 360) * w,
    lineHeight: (14 / 360) * w,
    paddingHorizontal: (14 / 360) * w,
  },
  bonusButton: {
    paddingLeft: (12 / 360) * w,
    paddingRight: (12 / 360) * w + 5,
    borderRadius: 0,
    height: (38 / 360) * w,
    borderTopEndRadius: (20 / 360) * w,
    borderBottomEndRadius: (20 / 360) * w,
    marginEnd: (12 / 360) * w,
    overflow: 'hidden',
  },
});
