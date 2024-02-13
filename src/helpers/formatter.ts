import React, {Text} from 'react-native';
import {Product} from '../types';

const idToPhone = (id: string) => {
  //Filter only numbers from the input
  const cleaned = id.replace(/\D/g, '');
  //Check if the input is of correct length
  const match = cleaned.match(/^(0)(\d{2})(\d{3})(\d{4})$/);
  if (match) {
    return '0' + match[2] + ' ' + match[3] + '-' + match[4];
  }
  return '';
};

const asCurrency = (value: number, locale = 'en-US', currency = 'USD') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value === 0 ? 0 : value);
};

const asDate = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const asDateTime = (date: Date, locale = 'en-US') => {
  return date.toLocaleTimeString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const asTime = (date: Date, locale = 'en-US') => {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const asPrice = (product: Product) => {
  if (!product.variants) {
    return null;
  }

  let prices: number[] = [];
  product.variants.forEach((size: any) => {
    if (size.variants) {
      size.variants.forEach((diam: any) => {
        prices = [
          ...prices,
          ...(diam?.prices?.filter((p: number | null) => !!p) || []),
        ];
      });
    }
    if (size.prices) {
      prices = [...prices, ...size.prices.filter((p: number | null) => !!p)];
    }
  });

  return asPriceCell(prices);
};

const asPriceCell = (prices: (number | null)[]) => {
  if (!prices) {
    return null;
  }
  if (prices.length === 0) {
    return null;
  }
  if (prices.filter(p => !!p).length === 0) {
    return null;
  }

  const min = Math.min(...(prices as number[]));
  const max = Math.max(...(prices as number[]));

  if (min === max) {
    return asCurrency(max);
  }

  return `${asCurrency(min)}—${asCurrency(max)}`;
};

export {
  asCurrency,
  asDate,
  asDateTime,
  asTime,
  idToPhone,
  asPrice,
  asPriceCell,
};
