'use strict';

var Pack = require('./pack');

module.exports = class Game {
  constructor(players) {
    this.players = players;
    this.pack = new Pack();
    this.pile = [];
  }

  deal(handSize) {
    for (let player of this.players) {
      player.addToHand(this.pack.draw(7));
    }
  }
}
