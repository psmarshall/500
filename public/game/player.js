'use strict';

module.exports = class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.hand = [];
  }

  addToHand(cards) {
    this.hand.push(...cards);
  }
};
