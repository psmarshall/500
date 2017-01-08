'use strict';

var Card = require('./card');

class Pack {
  constructor() {
    this.pack = standardPack();
    this.shuffle();
  }

  numCards() {
    return this.pack.length;
  }

  rawArray() {
    return this.pack;
  }

  shuffle() {
    var i = this.pack.length;
    var j, tempi, tempj;
    if (i === 0) return false;
    while (--i) {
       j = Math.floor(Math.random() * (i + 1));
       tempi = this.pack[i];
       tempj = this.pack[j];
       this.pack[i] = tempj;
       this.pack[j] = tempi;
    }
  }

  draw(numCards) {
    var cards = [];
    cards = this.pack.slice(0, numCards);
    this.pack.splice(0, numCards);
    return cards;
  }
}

function standardPack() {
  var pack = [];
  for (let suit of Card.SUIT_TYPES) {
    for (let number of Card.NUMBER_TYPES) {
      var imagePath = number + '_of_' + suit;
      // Use full face card images.
      if (Card.isFaceCard(number)) imagePath += '2';
      var card = new Card(suit, number, imagePath);
      pack.push(card);
    }
  }
  return pack;
}

module.exports = Pack;
