import {TFunction} from 'i18next';
import {Alert} from 'react-native';

export type ValidationField = {
  name: string;
  value: any;
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  length?: number;
  email?: boolean;
  mobile?: boolean;
  phone?: boolean;
  passport?: boolean;
  vat_id?: boolean;
  selectPicker?: boolean;
  message?: string;
};

export const validator: (
  config: ValidationField[],
  t: TFunction<'translation', undefined>,
) => boolean = (config, t) => {
  let valid = true;

  config.forEach(field => {
    if (!valid) {
      return;
    }

    if (field.required && field.selectPicker && field.value === null) {
      valid = false;
      Alert.alert(
        '',
        t(field.message ? field.message : 'Please select your {{field}}', {
          field: t(field.name),
        }),
      );
      return;
    }

    if (
      field.required &&
      !field.selectPicker &&
      !(field.value || '').toString()
    ) {
      valid = false;
      Alert.alert(
        '',
        t(field.message ? field.message : 'Please enter your {{field}}', {
          field: t(field.name),
        }),
      );
      return;
    }

    if (field.min || field.max) {
      if (field.min && field.max) {
        if (
          typeof field.value === 'string' &&
          (field.min > field.value.length || field.max < field.value.length)
        ) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be between {{min}} and {{max}} characters',
              {
                field: t(field.name),
                min: field.min,
                max: field.max,
              },
            ),
          );
          return;
        }

        if (
          typeof field.value === 'number' &&
          (field.min > field.value || field.max < field.value)
        ) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be between {{min}} and {{max}}',
              {
                field: t(field.name),
                min: field.min,
                max: field.max,
              },
            ),
          );
          return;
        }
      } else if (field.min) {
        if (typeof field.value === 'string' && field.min > field.value.length) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be grater {{min}} characters',
              {
                field: t(field.name),
                min: field.min,
              },
            ),
          );
          return;
        }

        if (typeof field.value === 'number' && field.min > field.value) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be grater then {{min}}',
              {
                field: t(field.name),
                min: field.min,
              },
            ),
          );
          return;
        }
      } else if (field.max) {
        if (typeof field.value === 'string' && field.max < field.value.length) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be less {{max}} characters',
              {
                field: t(field.name),
                max: field.max,
              },
            ),
          );
          return;
        }

        if (typeof field.value === 'number' && field.max < field.value) {
          valid = false;
          Alert.alert(
            '',
            t(
              field.message
                ? field.message
                : '{{field}} must be less then {{max}}',
              {
                field: t(field.name),
                max: field.max,
              },
            ),
          );
          return;
        }
      }
    }

    if (
      field.length &&
      typeof field.value === 'string' &&
      field.value.length !== field.length
    ) {
      valid = false;
      Alert.alert(
        '',
        t(
          field.message
            ? field.message
            : '{{field}} must be {{length}} characters',
          {
            field: t(field.name),
            length: field.length,
          },
        ),
      );
      return;
    }

    if (field.email && !isEmail(field.value)) {
      valid = false;
      Alert.alert(
        '',
        t(
          field.message
            ? field.message
            : '{{field}} must be correct email address',
          {
            field: t(field.name),
          },
        ),
      );
      return;
    }

    if (field.passport && !isValidIsraeliID(field.value)) {
      valid = false;
      Alert.alert(
        '',
        t(field.message ? field.message : '{{field}} must be correct ID', {
          field: t(field.name),
        }),
      );
      return;
    }

    if (field.mobile && !isMobile(field.value)) {
      valid = false;
      Alert.alert(
        '',
        t(
          field.message
            ? field.message
            : '{{field}} must be correct mobile phone number',
          {
            field: t(field.name),
          },
        ),
      );
      return;
    }

    if (field.phone && !isPhone(field.value)) {
      valid = false;
      Alert.alert(
        '',
        t(
          field.message
            ? field.message
            : '{{field}} must be correct phone number',
          {
            field: t(field.name),
          },
        ),
      );
      return;
    }

    if (field.vat_id && !isVatIdValid(field.value)) {
      valid = false;
      Alert.alert(
        '',
        t(field.message ? field.message : '{{field}} must be correct VAT ID', {
          field: t(field.name),
        }),
      );
      return;
    }
  });

  return valid;
};

export const isMobile = (mobile: string) => {
  const reg = /^\+?(972|0)(-)?([5]{1}\d{8})$/;
  return reg.test(mobile);
};

export const isPhone = (phone: string) => {
  const reg =
    /^\+?(972|0)(-)?0?(([23489]{1}\d{7})|[5]{1}\d{8}|((7)\d{8})|((180)\d{7}))$/;
  return reg.test(phone);
};

export const isEmail = (email: string) => {
  // const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
  // return reg.test(email);

  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const isValidIsraeliID = (id: string) => {
  // let id = String(id).trim();
  if (id.length > 9 || id.length < 5 || isNaN(parseInt(id))) return false;

  // Pad string with zeros up to 9 digits
  id = id.length < 9 ? ('00000000' + id).slice(-9) : id;

  return (
    Array.from(id, Number).reduce((counter, digit, i) => {
      const step = digit * ((i % 2) + 1);
      return counter + (step > 9 ? step - 9 : step);
    }) %
      10 ===
    0
  );
};

export const isVatIdValid = (value: string, alphabet = '0123456789') => {
  const parity = value.length % 2;

  const sum = value
    .split('')
    .map(v => alphabet.indexOf(v))
    .reduce((acc, val, idx) => {
      const v = idx % 2 === parity ? val * 2 : val;

      return acc + (v > 9 ? v - 9 : v);
    }, 0);

  return sum % alphabet.length === 0;
};
