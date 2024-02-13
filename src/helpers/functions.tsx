import {Card, CardTypes} from '../types';

export const getImage = (card: Card) => {
  if (CardTypes[card.cardtype] === 'Mastercard') {
    return require('../UI/images/mastercard.png');
  } else if (CardTypes[card.cardtype] === 'Visa') {
    return require('../UI/images/visa.png');
  }
};
