'use strict';

var Pack = require('./pack');

module.exports = class Game {
  constructor(id, hostName, players) {
    this.id = id;
    this.hostName = hostName;
    this.players = players || [];
    this.pack = new Pack();
    this.pile = [];
  }

  numPlayers() {
    return this.players.length;
  }

  deal(handSize) {
    for (let player of this.players) {
      player.addToHand(this.pack.draw(7));
    }
  }
}
