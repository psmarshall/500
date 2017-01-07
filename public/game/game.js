'use strict';

var Card = require('./card');

module.exports = class Game {
  standardDeck() {
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
}
