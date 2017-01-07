'use strict';

class Card {
  constructor(suit, number, imagePath) {
    this.suit = suit;
    this.number = number;
    this.imagePath = imagePath;
  }
}

var NUMBER_TYPES = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'jack',
  'queen',
  'king'
];

var SUIT_TYPES = [
  'hearts',
  'clubs',
  'spades',
  'diamonds'
];

Card.isFaceCard = function(number) {
  return number === 'ace' ||
      number === 'jack' ||
      number === 'queen' ||
      number === 'king'
};

Card.NUMBER_TYPES = NUMBER_TYPES;
Card.SUIT_TYPES = SUIT_TYPES;
module.exports = Card;
